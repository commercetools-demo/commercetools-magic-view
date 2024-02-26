import { useConfiguration } from '../configuration';
import OpenAI from 'openai';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import {
  DOMAINS,
  NOTIFICATION_KINDS_SIDE,
} from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useTranslate } from '../google-translate/translation';

const SEED_TEXT_EXPERT =
  'Product name: Kangra Sweater\nSeed words: grey, sweater, v-neck, casual, long-sleeve, everday, business casual, comfortable, ribbed cuffs and hem\nTone: Expert\nProduct description: This grey long-sleeve sweater is a classic wardrobe staple with traditional details, like a v-neck, and ribbed texture at the cuffs and hem.';
const SEED_TEXT_SOPHISTICATED =
  'Product name: Kangra Sweater\nSeed words: grey, sweater, v-neck, casual, long-sleeve, everday, business casual, comfortable, ribbed cuffs and hem\nTone: Sophisticated\nProduct description: This cozy grey long-sleeve v-neck sweater is the perfect piece for everyday use.  It easily transitions from home to office to a night on the town.';

export const useOpenAI = () => {
  const { getApiKey, getMaxTokens } = useConfiguration();
  const apiKey = getApiKey();
  const maxTokens = getMaxTokens();
  const showNotification = useShowNotification();
  const { project, dataLocale } = useApplicationContext((context) => context);
  const { googleTranslate } = useTranslate();

  const getProductDescriptionSuggestion = async (
    productName: string,
    seed: string,
    tone: string
  ) => {
    if (!apiKey) {
      return;
    }
    const openai = new OpenAI({
      dangerouslyAllowBrowser: true,
      apiKey,
    });
    let seedText = '';
    if (tone === 'expert') {
      seedText = SEED_TEXT_EXPERT;
    } else if (tone === 'sophisticated') {
      seedText = SEED_TEXT_SOPHISTICATED;
    }
    try {
      const response = await openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt:
          seedText +
          `\n\nProduct name: ${productName}\nSeed words: ${seed}\nTone: ${tone}\nProduct Description:`,
        temperature: 0.8,
        max_tokens: 60,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      });

      return response.choices[0].text;
    } catch (error) {
      showNotification({
        kind: NOTIFICATION_KINDS_SIDE.error,
        domain: DOMAINS.SIDE,
        text: (error as Error).message,
      });
    }
  };

  const getLocalizedProductDescriptionSuggestion = async (
    productName: string,
    seed: string,
    tone: string
  ) => {
    if (productName && seed && tone) {
      const productDescription = await getProductDescriptionSuggestion(
        productName,
        seed,
        tone
      );

      const description: Record<string, string> = {
        [dataLocale as string]: productDescription as string,
      };

      if (!!productDescription && project?.languages) {
        for await (const lang of project.languages) {
          const localizedProductDescription = await googleTranslate(
            productDescription,
            lang
          );

          if (localizedProductDescription) {
            description[lang] = localizedProductDescription[0].translatedText;
          }
        }
      }
      return description;
    }
    return {};
  };
  return {
    getLocalizedProductDescriptionSuggestion,
  };
};
