import axios from 'axios';

const apiGateway = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    withCredentials: false
});

// API Configuration
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'https://api.schematicstory.com';

// In development, use proxy. In production, use full URL
const getApiUrl = (endpoint: string): string => {
  if (import.meta.env.DEV) {
    // Development: use proxy
    return `/api${endpoint}`;
  } else {
    // Production: use full URL
    return `${API_BASE_URL}${endpoint}`;
  }
};

export { apiGateway, getApiUrl, API_BASE_URL }