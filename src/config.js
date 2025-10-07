const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? ''  // En producción, las rutas API ya empiezan con /api
    : 'http://localhost:5000'  // En desarrollo local
};

export default config;