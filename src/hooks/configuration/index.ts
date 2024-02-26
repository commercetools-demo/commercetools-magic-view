import { useMemo } from 'react';

const apiKeyKey = '__apiKey';
const maxTokensKey = '__maxTokens';
export const useConfiguration = () => {
  const getApiKey = () => {
    const apiKey = localStorage.getItem(apiKeyKey);
    return apiKey;
  };
  const getMaxTokens = () => {
    const maxTokens = localStorage.getItem(maxTokensKey);
    return parseInt(maxTokens || '100', 10);
  };

  const setMaxTokens = (maxTokens: number) => {
    localStorage.setItem(maxTokensKey, maxTokens.toString());
  };

  const isConfigured = useMemo(() => {
    return !!getApiKey();
  }, []);

  const setApiKey = (apiKey: string) => {
    localStorage.setItem(apiKeyKey, apiKey);
  };

  return {
    isConfigured,
    setApiKey,
    getApiKey,
    getMaxTokens,
    setMaxTokens,
  };
};
