const API_URL = 'http://localhost:5000/api';

// Reusable request helper that automatically attaches JWT token
export const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    // Build final headers object
    const headers = {
        ...(options.headers || {}),
        ...(token && { Authorization: `Bearer ${token}` })
    };

    // Only set JSON header when body is not FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Execute the request
    return await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
};
