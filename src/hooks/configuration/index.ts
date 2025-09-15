
const maxTokensKey = '__maxTokens';
const seedTextKey = '__seedText';
export const useConfiguration = () => {
  const getMaxTokens = () => {
    const maxTokens = localStorage.getItem(maxTokensKey);
    return parseInt(maxTokens || '100', 10);
  };

  const getSeedText = () => {
    const seedText = localStorage.getItem(seedTextKey);
    return seedText || 'You are a product marketer targeting a Gen Z audience. Create suggestions for product data fields. Keep suggestions under a few sentences long.';
  };

  const setMaxTokens = (maxTokens: number) => {
    localStorage.setItem(maxTokensKey, maxTokens.toString());
  };

  const setSeedText = (seedText: string) => {
    localStorage.setItem(seedTextKey, seedText);
  };

  return {
    getMaxTokens,
    setMaxTokens,
    getSeedText,
    setSeedText,
  };
};
