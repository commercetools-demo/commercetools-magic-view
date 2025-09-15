
const maxTokensKey = '__maxTokens';
const seedTextKey = '__seedText';
const fieldsKey = '__fields';
export const useConfiguration = () => {
  const getMaxTokens = () => {
    const maxTokens = localStorage.getItem(maxTokensKey);
    return parseInt(maxTokens || '100', 10);
  };

  const getSeedText = () => {
    const seedText = localStorage.getItem(seedTextKey);
    return seedText || 'You are a product marketer targeting a Gen Z audience. Create suggestions for product data fields. Keep suggestions under a few sentences long.';
  };

  const getFields = () => {
    const fields = localStorage.getItem(fieldsKey);
    return fields ? JSON.parse(fields) : ['description', 'slug', 'metaTitle', 'metaDescription', 'metaKeywords'];
  };

  const setMaxTokens = (maxTokens: number) => {
    localStorage.setItem(maxTokensKey, maxTokens.toString());
  };

  const setSeedText = (seedText: string) => {
    localStorage.setItem(seedTextKey, seedText);
  };

  const setFields = (fields: string[]) => {
    localStorage.setItem(fieldsKey, JSON.stringify(fields));
  };

  return {
    getMaxTokens,
    setMaxTokens,
    getSeedText,
    setSeedText,
    getFields,
    setFields,
  };
};
