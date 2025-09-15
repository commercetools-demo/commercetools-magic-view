import {
  useApplicationContext,
  useCustomViewContext
} from '@commercetools-frontend/application-shell-connectors';

import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import ConfigurationForm from '../configuration-form';
import messages from './messages';

const Magic = () => {
  const { env, testURL } = useApplicationContext<{
    env?: string;
    testURL?: string;
  }>((context) => context.environment);

  const hostUrl = useCustomViewContext((context) => context.hostUrl);
  const currentUrl = env === 'development' ? testURL : hostUrl;

  const matches = currentUrl?.match('/products/(.*)');
  const productId = matches?.[1];

  if (!productId) {
    return (
      <ContentNotification type="info">
        <Text.Body intlMessage={messages.noResults} />
      </ContentNotification>
    );
  }

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="s">
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>

      <ConfigurationForm productId={productId} />
    </Spacings.Stack>
  );
};
Magic.displayName = 'Channels';

export default Magic;
