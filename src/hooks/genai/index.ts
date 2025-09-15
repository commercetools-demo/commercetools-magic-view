import { useConfiguration } from '../configuration';
import { GoogleGenAI } from '@google/genai';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import {
  DOMAINS,
  NOTIFICATION_KINDS_SIDE,
} from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useTranslate } from '../google-translate/translation';

export const useGenAI = () => {
  const { getMaxTokens, getSeedText } = useConfiguration();
  const maxTokens = getMaxTokens();
  const seedText = getSeedText();
  const showNotification = useShowNotification();
  const { project, dataLocale, environment } = useApplicationContext<{
    project: any;
    dataLocale: string;
    environment: { genAIKey: string };
  }>((context) => context as any);

  const { googleTranslate } = useTranslate();

  const getProductFieldSuggestion = async (
    productName: string,
    field: string,
    seed: string,
    tone: string
  ) => {
    if (!environment.genAIKey) {
      return;
    }

    const genAI = new GoogleGenAI({ apiKey: environment.genAIKey });

    try {
      const prompt = `Give suggestion for the product ${field}. No other text or explanation.\n\nProduct name: ${productName}\nSeed words: ${seed}\nTone: ${tone}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
        config: {
          maxOutputTokens: maxTokens,
          temperature: 0.8,
          topP: 1.0,
          systemInstruction: seedText,
        },
      });

      return response.text || response;
    } catch (error) {
      showNotification({
        kind: NOTIFICATION_KINDS_SIDE.error,
        domain: DOMAINS.SIDE,
        text: (error as Error).message,
      });
      return;
    }
  };

  const getLocalizedProductFieldSuggestion = async (
    productName: string,
    field: string,
    seed: string,
    tone: string
  ) => {
    if (productName && seed && tone) {
      const fieldSuggestion = await getProductFieldSuggestion(
        productName,
        field,
        seed,
        tone
      );

      const localizedString: Record<string, string> = {
        [dataLocale as string]: fieldSuggestion as string,
      };

      if (!!fieldSuggestion && project?.languages) {
        for await (const lang of project.languages) {
          const localizedProductField = await googleTranslate(
            fieldSuggestion as string,
            lang
          );

          if (localizedProductField) {
            localizedString[lang] = localizedProductField[0].translatedText;
          }
        }
      }
      return localizedString;
    }
    return {};
  };

  return {
    getLocalizedProductFieldSuggestion,
  };
};
