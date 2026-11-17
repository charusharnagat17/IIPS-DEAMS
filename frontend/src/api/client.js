// Real API Client connecting to Spring Boot Backend

export async function checkBackendHealth() {
  try {
    const res = await fetch('/api/public/info', { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// Generic authenticated API caller
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('iips_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(endpoint, {
    ...options,
    headers,
    signal: AbortSignal.timeout(15000)
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = body?.message || body?.error || `Request failed with HTTP status ${res.status}`;
    throw new Error(errorMsg);
  }

  return body;
}
