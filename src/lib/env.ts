/**
 * Helper utility to safely access environment variables in different bundler environments
 */
export const getEnvVariable = (key: string): string => {
  // For Vite
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = `VITE_${key.replace(/^(REACT_APP_|VITE_)/, '')}`;
    if (import.meta.env[viteKey]) {
      return import.meta.env[viteKey];
    }
    if (import.meta.env[key]) {
      return import.meta.env[key];
    }
  }
  
  // For Create React App
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) {
      return process.env[key];
    }
  }
  
  // Fallback
  return '';
};

// Example usage: getEnvVariable('REACT_APP_OPENAI_API_KEY') or getEnvVariable('VITE_OPENAI_API_KEY') 