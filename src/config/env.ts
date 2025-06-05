
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001/api',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
} as const;

// Validação das variáveis de ambiente obrigatórias
export const validateEnv = () => {
  const requiredVars = ['VITE_API_BASE_URL'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
};
