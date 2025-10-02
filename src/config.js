const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? '/api'  // En producción (Vercel)
    : 'http://localhost:5000'  // En desarrollo local
};

export default config;