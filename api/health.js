import dns from 'dns';

// Ensure IPv4 lookup first to prevent IPv6 connection timeouts to data.gov.sg
try {
  dns.setDefaultResultOrder?.('ipv4first');
} catch {
  // Ignore in environments where this is not supported
}

const DATA_GOV_SG_ENDPOINT =
  'https://data.gov.sg/api/action/datastore_search?resource_id=d_8b84c4ee58e3cfc0ece0d773c8ca6abc&limit=1';

/**
 * Health check handler for checking backend service and upstream data source reachability.
 * Works as both a Vercel Serverless Function and an Express route handler.
 */
export default async function handleHealth(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const upstreamRes = await fetch(DATA_GOV_SG_ENDPOINT, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HDB-Price-Explorer/1.0 (HealthCheck)',
      },
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({
        status: 'degraded',
        backend: 'ok',
        latencyMs,
        upstream: {
          source: 'data.gov.sg',
          datasetId: 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc',
          status: upstreamRes.status,
          statusText: upstreamRes.statusText || 'Upstream error',
          reachable: false,
        },
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      status: 'healthy',
      backend: 'ok',
      latencyMs,
      upstream: {
        source: 'data.gov.sg',
        datasetId: 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc',
        status: upstreamRes.status,
        reachable: true,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    const isTimeout = err?.name === 'AbortError';

    return res.status(503).json({
      status: 'unhealthy',
      backend: 'ok',
      latencyMs,
      upstream: {
        source: 'data.gov.sg',
        datasetId: 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc',
        status: 503,
        reachable: false,
        reason: isTimeout ? 'Upstream request timed out after 8s' : (err?.message || 'Network error'),
      },
      timestamp: new Date().toISOString(),
    });
  }
}
