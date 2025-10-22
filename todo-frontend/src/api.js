// api.js

// Define the backend URL once (CRITICAL: Make sure this is correct)
export const BACKEND_URL = "https://todo-backend-sawo.onrender.com";

/**
 * Custom fetch wrapper to automatically include cookies for cross-origin requests.
 * @param {string} url The full URL for the request.
 * @param {object} options Fetch options object.
 * @returns {Promise<Response>} The fetch Response object.
 */
export const fetchWithCredentials = (url, options = {}) => {
  return fetch(url, {
    ...options,
    // CRITICAL: Tells the browser to send the HTTP-only cookie
    credentials: 'include', 
    headers: {
      // Set default content type, allowing override if needed
      'Content-Type': 'application/json', 
      ...options.headers,
    },
  });
};