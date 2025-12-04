const API_URL = 'http://localhost:5000/api';

// Helper to attach token automatically
export const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    // If body is JSON, add content-type (unless it's FormData)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    return res;
};
