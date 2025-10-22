// api.js

// Define the backend URL once (CRITICAL: Make sure this is correct)
export const BACKEND_URL = "https://todo-backend-sawo.onrender.com";

/**
 * Custom fetch wrapper to automatically include cookies and prepend the BACKEND_URL.
 * @param {string} path The relative path to the backend (e.g., '/todos', '/login').
 * @param {object} options Fetch options object.
 * @returns {Promise<Response>} The fetch Response object.
 */
export const fetchWithCredentials = (path, options = {}) => {
  // CRITICAL FIX: Combine BACKEND_URL and the path
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

