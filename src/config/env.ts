
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7039/api',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'), // Aumentado para 30 segundos
} as const;

// Validação das variáveis de ambiente obrigatórias
export const validateEnv = () => {
  const requiredVars = ['VITE_API_BASE_URL'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    console.info(`Using default API URL: ${ENV.API_BASE_URL}`);
    console.info(`Using timeout: ${ENV.API_TIMEOUT}ms`);
  }
};
