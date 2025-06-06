
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7039/api',
} as const;

// Validação das variáveis de ambiente obrigatórias
export const validateEnv = () => {
  console.log('Environment configuration:');
  console.log('API_BASE_URL:', ENV.API_BASE_URL);
  
  const requiredVars = ['VITE_API_BASE_URL'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    console.info(`Using default API URL: ${ENV.API_BASE_URL}`);
  } else {
    console.info('All environment variables are properly configured');
  }
};
