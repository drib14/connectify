const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Wrapper around fetch that includes credentials and JSON headers.
 * @param {string} endpoint - API path (e.g. "/api/auth/login")
 * @param {object} [options] - Fetch options override
 * @returns {Promise<Response>}
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  };

  // Ensure headers merge properly when options.headers is provided
  if (options.headers) {
    config.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
  }

  return fetch(url, config);
}

export { API_URL };
