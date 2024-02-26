import React, { useState } from 'react';
import { Form, Formik } from 'formik';
import { useConfiguration } from '../../hooks/configuration';
import PasswordField from '@commercetools-uikit/password-field';
import Text from '@commercetools-uikit/text';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import Spacings from '@commercetools-uikit/spacings';
import { ContentNotification } from '@commercetools-uikit/notifications';
import messages from './messages';
import PromptForm from '../prompt-form';
import { useIntl } from 'react-intl';
import NumberField from '@commercetools-uikit/number-field';

const ConfigurationForm = ({ productId }: { productId: string }) => {
  const intl = useIntl();

  const { setApiKey, setMaxTokens, isConfigured } = useConfiguration();
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(isConfigured);
  const initialValues = { apiKey: '', maxTokens: 100 };
  if (isApiKeyConfigured) {
    return (
      <Spacings.Stack scale="xl">
        <Spacings.Inline scale="xl" justifyContent="flex-end">
          <SecondaryButton
            label={intl.formatMessage(messages.reconfigure)}
            onClick={() => {
              setApiKey('');
              setIsApiKeyConfigured(false);
            }}
          ></SecondaryButton>
        </Spacings.Inline>
        <Spacings.Stack scale="s">
          <PromptForm productId={productId} />
        </Spacings.Stack>
      </Spacings.Stack>
    );
  }
  return (
    <Spacings.Inline scale="xl" justifyContent="flex-start">
      <Spacings.Stack scale="xl">
        <ContentNotification type="info">
          <Text.Body intlMessage={messages.noConfiguration} />
        </ContentNotification>
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {
            setApiKey(values.apiKey);
            setMaxTokens(values.maxTokens);
            setIsApiKeyConfigured(true);
          }}
          validate={(values) => {
            const errors = {} as any;
            if (!values.apiKey) {
              errors.apiKey = 'Required';
            }
            if (!values.maxTokens) {
              errors.maxTokens = 'Required';
            }
            return errors;
          }}
        >
          {({ values, isValid, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <Spacings.Stack scale="l">
                <Spacings.Stack scale="xs">
                  <PasswordField
                    title={intl.formatMessage(messages.apiKey)}
                    hint={intl.formatMessage(messages.hint)}
                    name="apiKey"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.apiKey}
                  />
                  {errors.apiKey && touched.apiKey && (
                    <Text.Caption tone="critical">{errors.apiKey}</Text.Caption>
                  )}
                </Spacings.Stack>
                <Spacings.Stack scale="xs">
                  <NumberField
                    title={intl.formatMessage(messages.maxTokens)}
                    value={values.maxTokens}
                    name="maxTokens"
                    onChange={handleChange}
                  />
                  {errors.maxTokens && touched.maxTokens && (
                    <Text.Caption tone="critical">
                      {errors.maxTokens}
                    </Text.Caption>
                  )}
                </Spacings.Stack>
                <Spacings.Inline scale="xl">
                  <PrimaryButton
                    isDisabled={!isValid}
                    label={intl.formatMessage(messages.save)}
                    type="submit"
                  ></PrimaryButton>
                </Spacings.Inline>
              </Spacings.Stack>
            </Form>
          )}
        </Formik>
      </Spacings.Stack>
    </Spacings.Inline>
  );
};

export default ConfigurationForm;
