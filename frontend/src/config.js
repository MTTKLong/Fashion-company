// Default in XAMPP
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost/Fashion-company/backend';

// Docker if .env.local exist
export const API_URL = `${BASE_URL}/api`;
export const UPLOADS_URL = `${BASE_URL}/uploads`;