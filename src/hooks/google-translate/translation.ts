import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import axios from 'axios';

const API_URL = 'https://translation.googleapis.com/language/translate/v2';

export const useTranslate = () => {
  // @ts-ignore
  const { translateApiKey } = useApplicationContext(
    (context) => context.environment
  );

  const googleTranslate = async (
    textToTranslate: string | string[],
    targetLanguage: string
  ): Promise<{ translatedText: string; detectedSourceLanguage?: string }[]> => {
    const response = await axios.post(`${API_URL}?key=${translateApiKey}`, {
      q: textToTranslate,
      target: targetLanguage,
    });

    return response.data.data.translations;
  };

  return {
    googleTranslate,
  };
};
