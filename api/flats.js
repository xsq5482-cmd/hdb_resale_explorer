import dns from 'dns';

// Ensure IPv4 lookup first to prevent IPv6 connection timeouts to data.gov.sg
try {
  dns.setDefaultResultOrder?.('ipv4first');
} catch {
  // Ignore in environments where this is not supported
}

const DATA_GOV_SG_ENDPOINT = 'https://data.gov.sg/api/action/datastore_search';
const RESOURCE_ID = 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc';

// In-memory cache for upstream data.gov.sg results to optimize performance and prevent rate limiting.
// Key: `${town}_${flatType}_${limit}`, TTL: 1 hour (historical HDB data updates monthly)
const memoryCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Parses remaining lease string into decimal years.
 * Examples: "70 years 01 month" -> 70.08, "61 years 04 months" -> 61.33, "92 years" -> 92
 */
function parseRemainingLeaseYears(leaseStr, commenceYear) {
  if (!leaseStr && commenceYear) {
    const startYear = parseInt(commenceYear, 10);
    if (!Number.isNaN(startYear)) {
      const currentYear = new Date().getFullYear();
      const calculated = 99 - (currentYear - startYear);
      return Math.max(0, calculated);
    }
  }

  if (typeof leaseStr === 'number') return Number.isFinite(leaseStr) ? leaseStr : 0;
  if (!leaseStr) return 0;

  const str = String(leaseStr).trim();
  const match = str.match(/(\d+)\s*years?(?:\s*(\d+)\s*months?)?/i);
  if (match) {
    const years = parseInt(match[1], 10) || 0;
    const months = parseInt(match[2], 10) || 0;
    return Math.round((years + months / 12) * 10) / 10;
  }

  const num = parseFloat(str);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Calculates median of a sorted numeric array. Returns 0 if empty.
 */
function calculateMedian(sortedArr) {
  if (!sortedArr || sortedArr.length === 0) return 0;
  const mid = Math.floor(sortedArr.length / 2);
  if (sortedArr.length % 2 !== 0) {
    return sortedArr[mid];
  }
  return Math.round((sortedArr[mid - 1] + sortedArr[mid]) / 2);
}

/**
 * Handles /api/flats query requests.
 * Works as both a standalone Vercel Serverless Function and an Express route handler.
 */
export default async function handleFlats(req, res) {
  // Set required Cache-Control and Content-Type headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=43200');

  // Handle missing query parameters gracefully with sensible defaults
  const townQuery = req.query?.town ? String(req.query.town).trim().toUpperCase() : 'TAMPINES';
  const rawFlatType = req.query?.flat_type || req.query?.flatType || '4 ROOM';
  const flatTypeQuery = String(rawFlatType).trim().toUpperCase();

  const rawBudget = req.query?.maxBudget ?? req.query?.budget;
  const maxBudget = rawBudget && !Number.isNaN(Number(rawBudget)) && Number(rawBudget) > 0
    ? Number(rawBudget)
    : null;

  const limitParam = parseInt(req.query?.limit, 10);
  const fetchLimit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 1000) : 350;

  const cacheKey = `${townQuery}::${flatTypeQuery}::${fetchLimit}`;
  const now = Date.now();

  let rawRecords = [];

  // Check in-memory cache
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      rawRecords = cached.records;
    }
  }

  // Fetch from data.gov.sg if not cached
  if (rawRecords.length === 0) {
    const filters = {};
    if (townQuery && townQuery !== 'ALL') {
      filters.town = townQuery;
    }
    if (flatTypeQuery && flatTypeQuery !== 'ALL') {
      filters.flat_type = flatTypeQuery;
    }

    const queryParams = new URLSearchParams({
      resource_id: RESOURCE_ID,
      limit: String(fetchLimit),
      sort: 'month desc',
    });

    if (Object.keys(filters).length > 0) {
      queryParams.set('filters', JSON.stringify(filters));
    }

    const targetUrl = `${DATA_GOV_SG_ENDPOINT}?${queryParams.toString()}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const upstreamRes = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'HDB-Price-Explorer/1.0',
        },
      });
      clearTimeout(timeoutId);

      // AFTER the fetch from data.gov.sg, check response.ok before reading the body.
      // On a non-2xx reply, return the upstream status and a one-line reason in your own JSON instead.
      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).json({
          error: `Upstream error: data.gov.sg responded with HTTP ${upstreamRes.status}`,
          upstreamStatus: upstreamRes.status,
          upstreamReason: upstreamRes.statusText || 'Upstream data.gov.sg request failed',
        });
      }

      const responseBody = await upstreamRes.json();
      if (!responseBody.success) {
        return res.status(502).json({
          error: 'Upstream data.gov.sg reported unfulfilled query.',
          upstreamStatus: 502,
          upstreamReason: 'Datastore query marked unsuccessful by data.gov.sg',
        });
      }

      rawRecords = responseBody.result?.records || [];

      // Save to in-memory cache
      memoryCache.set(cacheKey, {
        timestamp: now,
        records: rawRecords,
      });
    } catch (err) {
      const isTimeout = err?.name === 'AbortError';
      return res.status(502).json({
        error: `Failed to communicate with data.gov.sg: ${isTimeout ? 'Request timed out after 12s' : err?.message}`,
        upstreamStatus: 502,
        upstreamReason: isTimeout ? 'Upstream request timed out' : (err?.message || 'Network error'),
      });
    }
  }

  // Parse and normalize all records. Never emit NaN or null.
  const normalizedRecords = rawRecords.map((r, index) => {
    const resalePrice = Math.round(Number(r.resale_price) || 0);
    const floorAreaSqm = Math.round((Number(r.floor_area_sqm) || 0) * 10) / 10;
    const remainingLeaseYears = parseRemainingLeaseYears(r.remaining_lease, r.lease_commence_date);
    const pricePerSqm = floorAreaSqm > 0 ? Math.round(resalePrice / floorAreaSqm) : 0;

    return {
      id: r._id || index + 1,
      month: r.month || 'Unknown',
      town: r.town || townQuery,
      flatType: r.flat_type || flatTypeQuery,
      block: r.block || '',
      streetName: r.street_name || '',
      storeyRange: r.storey_range || '',
      floorAreaSqm,
      floorAreaSqft: Math.round(floorAreaSqm * 10.7639),
      flatModel: r.flat_model || 'Standard',
      leaseCommenceDate: r.lease_commence_date || '',
      remainingLease: r.remaining_lease || `${remainingLeaseYears} years`,
      remainingLeaseYears,
      resalePrice,
      pricePerSqm,
    };
  });

  // Calculate overall market metrics for this town & flat type (before budget filter)
  const totalMarketCount = normalizedRecords.length;
  const marketPrices = normalizedRecords.map((r) => r.resalePrice).sort((a, b) => a - b);
  const marketMedianPrice = calculateMedian(marketPrices);
  const marketAvgPrice = totalMarketCount > 0
    ? Math.round(marketPrices.reduce((acc, p) => acc + p, 0) / totalMarketCount)
    : 0;

  // Filter records by budget if specified
  const filteredRecords = maxBudget !== null
    ? normalizedRecords.filter((r) => r.resalePrice <= maxBudget)
    : normalizedRecords;

  const totalFilteredCount = filteredRecords.length;

  // Monthly Price Trends aggregation (chronological order)
  const monthMap = new Map();
  for (const r of filteredRecords) {
    if (!monthMap.has(r.month)) {
      monthMap.set(r.month, {
        month: r.month,
        prices: [],
        areas: [],
        psmList: [],
      });
    }
    const bucket = monthMap.get(r.month);
    bucket.prices.push(r.resalePrice);
    bucket.areas.push(r.floorAreaSqm);
    if (r.pricePerSqm > 0) bucket.psmList.push(r.pricePerSqm);
  }

  const monthlyTrends = Array.from(monthMap.values())
    .map((b) => {
      const count = b.prices.length;
      const sortedPrices = [...b.prices].sort((a, b) => a - b);
      const avgPrice = count > 0 ? Math.round(sortedPrices.reduce((s, p) => s + p, 0) / count) : 0;
      const medianPrice = calculateMedian(sortedPrices);
      const minPrice = sortedPrices[0] || 0;
      const maxPrice = sortedPrices[count - 1] || 0;
      const avgArea = count > 0 ? Math.round((b.areas.reduce((s, a) => s + a, 0) / count) * 10) / 10 : 0;
      const avgPsm = b.psmList.length > 0 ? Math.round(b.psmList.reduce((s, p) => s + p, 0) / b.psmList.length) : 0;

      return {
        month: b.month,
        count,
        avgPrice,
        medianPrice,
        minPrice,
        maxPrice,
        avgFloorAreaSqm: avgArea,
        avgPsm,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month)); // Oldest to newest for charts

  // "What does my budget buy" dataset
  // Combining floor_area_sqm and remaining_lease for units within specified budget
  const inBudgetUnits = filteredRecords;
  const inBudgetCount = inBudgetUnits.length;
  const budgetPercentage = totalMarketCount > 0
    ? Math.round((inBudgetCount / totalMarketCount) * 1000) / 10
    : 0;

  let avgFloorAreaSqm = 0;
  let medianFloorAreaSqm = 0;
  let avgRemainingLeaseYears = 0;

  if (inBudgetCount > 0) {
    const areas = inBudgetUnits.map((u) => u.floorAreaSqm).sort((a, b) => a - b);
    avgFloorAreaSqm = Math.round((areas.reduce((s, a) => s + a, 0) / inBudgetCount) * 10) / 10;
    medianFloorAreaSqm = calculateMedian(areas);

    const leases = inBudgetUnits.map((u) => u.remainingLeaseYears);
    avgRemainingLeaseYears = Math.round((leases.reduce((s, l) => s + l, 0) / inBudgetCount) * 10) / 10;
  }

  // Lease breakdown for units within budget
  const leaseBrackets = [
    { label: '80+ years (Recent MOP)', min: 80, max: 100 },
    { label: '70 - 79 years (Mid-life)', min: 70, max: 79.99 },
    { label: '60 - 69 years (Mature)', min: 60, max: 69.99 },
    { label: '< 60 years (Aging lease)', min: 0, max: 59.99 },
  ];

  const leaseBreakdown = leaseBrackets.map((bracket) => {
    const matching = inBudgetUnits.filter(
      (u) => u.remainingLeaseYears >= bracket.min && u.remainingLeaseYears <= bracket.max
    );
    const count = matching.length;
    const percentage = inBudgetCount > 0 ? Math.round((count / inBudgetCount) * 1000) / 10 : 0;
    const avgPrice = count > 0 ? Math.round(matching.reduce((s, u) => s + u.resalePrice, 0) / count) : 0;
    const avgArea = count > 0 ? Math.round((matching.reduce((s, u) => s + u.floorAreaSqm, 0) / count) * 10) / 10 : 0;

    return {
      bracket: bracket.label,
      count,
      percentage,
      avgPrice,
      avgAreaSqm: avgArea,
    };
  });

  // Floor area breakdown for units within budget
  const areaBrackets = [
    { label: 'Compact (< 80 sqm)', min: 0, max: 79.99 },
    { label: 'Standard (80 - 100 sqm)', min: 80, max: 100.0 },
    { label: 'Spacious (> 100 sqm)', min: 100.01, max: 300 },
  ];

  const areaBreakdown = areaBrackets.map((bracket) => {
    const matching = inBudgetUnits.filter(
      (u) => u.floorAreaSqm >= bracket.min && u.floorAreaSqm <= bracket.max
    );
    const count = matching.length;
    const percentage = inBudgetCount > 0 ? Math.round((count / inBudgetCount) * 1000) / 10 : 0;
    const avgPrice = count > 0 ? Math.round(matching.reduce((s, u) => s + u.resalePrice, 0) / count) : 0;

    return {
      bracket: bracket.label,
      count,
      percentage,
      avgPrice,
    };
  });

  // Summary message when no flats match the filters
  let noMatchMessage = null;
  if (totalFilteredCount === 0) {
    if (totalMarketCount === 0) {
      noMatchMessage = `No resale flat transactions recorded for ${flatTypeQuery} in ${townQuery} in recent data records.`;
    } else if (maxBudget !== null) {
      const minAvailablePrice = marketPrices[0] || 0;
      noMatchMessage = `No ${flatTypeQuery} flats found in ${townQuery} within your budget of $${maxBudget.toLocaleString()}. The lowest recent transaction price for this flat type in ${townQuery} was $${minAvailablePrice.toLocaleString()}.`;
    } else {
      noMatchMessage = `No resale transactions match your current search filters for ${townQuery} and ${flatTypeQuery}.`;
    }
  }

  // Summary object with guaranteed non-null, non-NaN metrics
  const summary = {
    totalTransactions: totalFilteredCount,
    totalMarketTransactions: totalMarketCount,
    marketAvgPrice,
    marketMedianPrice,
    filteredAvgPrice: totalFilteredCount > 0
      ? Math.round(filteredRecords.reduce((s, r) => s + r.resalePrice, 0) / totalFilteredCount)
      : 0,
    filteredMedianPrice: calculateMedian(filteredRecords.map((r) => r.resalePrice).sort((a, b) => a - b)),
    minPrice: filteredRecords.length > 0 ? Math.min(...filteredRecords.map((r) => r.resalePrice)) : 0,
    maxPrice: filteredRecords.length > 0 ? Math.max(...filteredRecords.map((r) => r.resalePrice)) : 0,
    avgFloorAreaSqm,
    avgRemainingLeaseYears,
  };

  const responsePayload = {
    filters: {
      town: townQuery,
      flatType: flatTypeQuery,
      maxBudget,
      limit: fetchLimit,
    },
    totalMatches: totalFilteredCount,
    records: filteredRecords,
    monthlyTrends,
    budgetAnalysis: {
      maxBudget,
      unitsInBudget: inBudgetCount,
      totalUnitsSampled: totalMarketCount,
      percentageInBudget: budgetPercentage,
      avgFloorAreaSqm,
      medianFloorAreaSqm,
      avgRemainingLeaseYears,
      leaseBreakdown,
      areaBreakdown,
    },
    summary,
    noMatchMessage,
  };

  return res.status(200).json(responsePayload);
}
