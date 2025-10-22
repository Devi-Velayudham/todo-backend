// api.js

// Define the backend URL once (CRITICAL: Make sure this is correct)
export const BACKEND_URL = "https://todo-backend-sawo.onrender.com";

/**
 * Custom fetch wrapper to automatically include cookies for cross-origin requests.
 * @param {string} path The resource path for the request (e.g., '/todos').
 * @param {object} options Fetch options object.
 * @returns {Promise<Response>} The fetch Response object.
 */
// CRITICAL FIX: Changed 'url' parameter to 'path' for clarity, and now prepend BACKEND_URL
export const fetchWithCredentials = (path, options = {}) => {
  // CORRECT: We combine the BACKEND_URL with the path before sending the fetch request.
  const fullUrl = `${BACKEND_URL}${path}`;
  
  return fetch(fullUrl, {
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
