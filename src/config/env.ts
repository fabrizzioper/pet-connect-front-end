/**
 * Environment variables configuration
 * No fallbacks - all variables must be defined
 */

const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

export const env = {
  API_URL: getEnvVar('VITE_API_URL'),
  APP_NAME: getEnvVar('VITE_APP_NAME'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION'),
} as const;

