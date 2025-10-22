// api.js

// Define the backend URL once (CRITICAL: Make sure this is correct)
// We export this so components can use it when constructing the full URL.
export const BACKEND_URL = "https://todo-backend-sawo.onrender.com";

/**
 * Custom fetch wrapper to automatically include cookies for cross-origin requests.
 * * NOTE: The component (e.g., TodoApp.js) MUST pass the FULL URL 
 * (e.g., `${BACKEND_URL}/todos`).
 * * @param {string} url The full URL for the request (e.g., 'https://your-backend.onrender.com/todos').
 * @param {object} options Fetch options object.
 * @returns {Promise<Response>} The fetch Response object.
 */
// This function is simple—it just injects the credentials option.
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

