import dns from 'dns';

try {
  dns.setDefaultResultOrder?.('ipv4first');
} catch {
  // Ignore in environments where this is not supported
}

const ONEMAP_BASE = 'https://www.onemap.gov.sg';

// Token storage (lasts ~3 days / 72 hours)
let activeToken = process.env.ONEMAP_TOKEN || null;
let tokenExpiresAt = null;

// Persistent in-memory geocoding cache: address -> { lat, lng, postal, address }
const geocodeCache = new Map();

/**
 * Attempts to mint a new OneMap API token.
 */
async function mintOneMapToken(email, password) {
  const url = `${ONEMAP_BASE}/api/auth/post/getToken`;
  const res = await fetch(url, {
    method: 'POST',
    signal: AbortSignal.timeout(8000),
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'HDB-Price-Explorer/1.0',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Token generation failed (HTTP ${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (data.access_token) {
    activeToken = data.access_token;
    tokenExpiresAt = data.expiry_timestamp || new Date(Date.now() + 72 * 3600 * 1000).toISOString();
    return {
      token: activeToken,
      expiresAt: tokenExpiresAt,
    };
  }

  throw new Error(data.error || 'Failed to retrieve access_token from response');
}

/**
 * Geocodes an individual address using OneMap Elastic Search.
 */
async function geocodeAddress(searchVal) {
  const clean = String(searchVal).trim();
  if (!clean) return null;

  const key = clean.toUpperCase();
  if (geocodeCache.has(key)) {
    return geocodeCache.get(key);
  }

  const queryParams = new URLSearchParams({
    searchVal: clean,
    returnGeom: 'Y',
    getAddrDetails: 'Y',
    pageNum: '1',
  });

  const headers = {
    'User-Agent': 'HDB-Price-Explorer/1.0',
  };
  if (activeToken) {
    headers['Authorization'] = activeToken;
  }

  try {
    const res = await fetch(`${ONEMAP_BASE}/api/common/elastic/search?${queryParams.toString()}`, {
      signal: AbortSignal.timeout(6000),
      headers,
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const top = data.results[0];
      const lat = parseFloat(top.LATITUDE);
      const lng = parseFloat(top.LONGITUDE);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const item = {
          lat,
          lng,
          postal: top.POSTAL || '',
          building: top.BUILDING || '',
          roadName: top.ROAD_NAME || '',
          blkNo: top.BLK_NO || '',
          address: top.ADDRESS || clean,
        };
        geocodeCache.set(key, item);
        return item;
      }
    }
  } catch (err) {
    // Graceful fallback
  }

  return null;
}

/**
 * Main OneMap route handler.
 * Supports token management, search, reverse geocoding, routing, and batch geocoding.
 */
export default async function handleOneMap(req, res) {
  res.setHeader('Content-Type', 'application/json');

  // Handle Token Minting / Setting (POST)
  if (req.method === 'POST') {
    const body = req.body || {};
    const { action, email, password, token } = body;

    // Direct token assignment
    if (token) {
      activeToken = String(token).trim();
      tokenExpiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
      return res.status(200).json({
        success: true,
        message: 'OneMap token successfully configured',
        expiresAt: tokenExpiresAt,
      });
    }

    // Email / Password token minting
    if (email && password) {
      try {
        const result = await mintOneMapToken(email, password);
        return res.status(200).json({
          success: true,
          message: 'OneMap token minted successfully',
          expiresAt: result.expiresAt,
        });
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: err.message || 'Failed to authenticate with OneMap',
        });
      }
    }

    return res.status(400).json({
      error: 'Please provide either { email, password } to mint a token or { token } directly.',
    });
  }

  // Handle GET queries
  const action = req.query?.action || 'search';

  // 1. Status / Config
  if (action === 'status') {
    return res.status(200).json({
      hasToken: Boolean(activeToken),
      tokenExpiresAt,
      cacheSize: geocodeCache.size,
    });
  }

  // 2. Geocode / Search
  if (action === 'search') {
    const searchVal = req.query?.searchVal || req.query?.q;
    if (!searchVal) {
      return res.status(400).json({ error: 'Missing required query parameter "searchVal"' });
    }

    const pageNum = req.query?.pageNum || '1';
    const queryParams = new URLSearchParams({
      searchVal: String(searchVal).trim(),
      returnGeom: 'Y',
      getAddrDetails: 'Y',
      pageNum: String(pageNum),
    });

    const headers = { 'User-Agent': 'HDB-Price-Explorer/1.0' };
    if (activeToken) {
      headers['Authorization'] = activeToken;
    }

    try {
      const upstreamRes = await fetch(`${ONEMAP_BASE}/api/common/elastic/search?${queryParams.toString()}`, {
        signal: AbortSignal.timeout(6000),
        headers,
      });

      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).json({
          error: `OneMap search returned HTTP ${upstreamRes.status}`,
          upstreamStatus: upstreamRes.status,
        });
      }

      const json = await upstreamRes.json();
      return res.status(200).json(json);
    } catch (err) {
      return res.status(502).json({
        error: `Failed to query OneMap search: ${err?.message}`,
      });
    }
  }

  // 3. Batch Geocode for multiple HDB addresses
  if (action === 'batchGeocode') {
    let addresses = [];
    if (typeof req.query?.addresses === 'string') {
      addresses = req.query.addresses.split('|').map((s) => s.trim()).filter(Boolean);
    } else if (Array.isArray(req.query?.addresses)) {
      addresses = req.query.addresses;
    }

    if (addresses.length === 0) {
      return res.status(200).json({ results: {} });
    }

    const targets = addresses.slice(0, 30);
    const results = {};

    await Promise.all(
      targets.map(async (addr) => {
        const coords = await geocodeAddress(addr);
        if (coords) {
          results[addr] = coords;
        }
      })
    );

    return res.status(200).json({ results });
  }

  // 4. Reverse Geocode (requires token)
  if (action === 'revgeocode') {
    const location = req.query?.location; // e.g. "1.3,103.8"
    if (!location) {
      return res.status(400).json({ error: 'Missing required query parameter "location" (lat,lng)' });
    }

    const buffer = req.query?.buffer || '40';
    const addressType = req.query?.addressType || 'All';

    if (!activeToken) {
      return res.status(401).json({
        error: 'OneMap reverse geocoding requires an authenticated OneMap API token.',
        requiresToken: true,
      });
    }

    const queryParams = new URLSearchParams({
      location,
      buffer,
      addressType,
    });

    try {
      const upstreamRes = await fetch(`${ONEMAP_BASE}/api/public/revgeocode?${queryParams.toString()}`, {
        signal: AbortSignal.timeout(6000),
        headers: {
          Authorization: activeToken,
          'User-Agent': 'HDB-Price-Explorer/1.0',
        },
      });

      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).json({
          error: `OneMap reverse geocoding returned HTTP ${upstreamRes.status}`,
          upstreamStatus: upstreamRes.status,
        });
      }

      const json = await upstreamRes.json();
      return res.status(200).json(json);
    } catch (err) {
      return res.status(502).json({
        error: `Failed to reverse geocode: ${err?.message}`,
      });
    }
  }

  // 5. Routing (requires token)
  if (action === 'route') {
    const start = req.query?.start;
    const end = req.query?.end;
    const routeType = req.query?.routeType || 'walk'; // walk | drive | cycle | pt

    if (!start || !end) {
      return res.status(400).json({ error: 'Missing "start" or "end" coordinates (lat,lng)' });
    }

    if (!activeToken) {
      return res.status(401).json({
        error: 'OneMap routing service requires an authenticated OneMap API token. Please configure your token in OneMap settings.',
        requiresToken: true,
      });
    }

    const queryParams = new URLSearchParams({
      start,
      end,
      routeType,
    });

    try {
      const upstreamRes = await fetch(`${ONEMAP_BASE}/api/public/routingsvc/route?${queryParams.toString()}`, {
        signal: AbortSignal.timeout(8000),
        headers: {
          Authorization: activeToken,
          'User-Agent': 'HDB-Price-Explorer/1.0',
        },
      });

      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).json({
          error: `OneMap routing returned HTTP ${upstreamRes.status}`,
          upstreamStatus: upstreamRes.status,
        });
      }

      const json = await upstreamRes.json();
      return res.status(200).json(json);
    } catch (err) {
      return res.status(502).json({
        error: `Routing request failed: ${err?.message}`,
      });
    }
  }

  return res.status(400).json({ error: `Unknown action: "${action}"` });
}
