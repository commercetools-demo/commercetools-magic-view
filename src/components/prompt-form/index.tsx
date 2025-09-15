import Spacings from '@commercetools-uikit/spacings';
import React, { useState } from 'react';
import LocalizedMultilineTextField from '@commercetools-uikit/localized-multiline-text-field';
import MultilineTextField from '@commercetools-uikit/multiline-text-field';
import { Form, Formik } from 'formik';
import { useIntl } from 'react-intl';
import messages from './messages';
import SelectField from '@commercetools-uikit/select-field';
import Text from '@commercetools-uikit/text';
import { useGenAI } from '../../hooks/genai';
import { useProduct } from '../../hooks/use-product-connector';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import {
  showNotification,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import {
  DOMAINS,
  NOTIFICATION_KINDS_SIDE,
} from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

const PromptForm = ({ productId }: { productId: string }) => {
  const initialValues = { seed: '', tone: '' };
  const intl = useIntl();
  const [isSuggestionArrived, setisSuggestionArrived] = useState(false);
  const [suggestion, setSuggestion] = useState<Record<string, string>>({});
  const [isLoading, setisLoading] = useState(false);

  const { dataLocale } = useApplicationContext((context) => context);

  const { loading, product, updateProduct } = useProduct({ productId });

  const { getLocalizedProductFieldSuggestion } = useGenAI();

  const handleSuggestion = async (values: { seed: string; tone: string }) => {
    if (product) {
      setisLoading(true);
      const description = await getLocalizedProductFieldSuggestion(
        product.masterData.current.name!,
        'description',
        values.seed,
        values.tone
      );

      setSuggestion(description || {});
      setisLoading(false);
      setisSuggestionArrived(true);
    }
  };

  const handleUpdateProduct = async () => {
    await updateProduct(suggestion);
    showNotification({
      kind: NOTIFICATION_KINDS_SIDE.success,
      domain: DOMAINS.SIDE,
      text: intl.formatMessage(messages.success),
    });
    setisSuggestionArrived(false);
    setSuggestion({});
  };

  return (
    <Spacings.Stack scale="xl">
      <CollapsiblePanel
        isClosed={isSuggestionArrived}
        header={
          intl
            .formatMessage(messages.formEditorHeader, {
              productName: product?.masterData?.current?.name,
            })
            .substring(0, 60) + '...'
        }
        condensed
        horizontalConstraint="scale"
      >
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => handleSuggestion(values)}
          validate={(values) => {
            const errors = {} as any;
            if (!values.seed) {
              errors.seed = 'Required';
            }
            if (!values.tone) {
              errors.tone = 'Required';
            }
            return errors;
          }}
        >
          {({ values, errors, touched, isValid, handleChange, handleBlur }) => (
            <Form css={{ width: '100%' }}>
              <Spacings.Stack scale="m">
                <Spacings.Stack scale="xs">
                  <MultilineTextField
                    value={values.seed}
                    title={intl.formatMessage(messages.formSeed)}
                    name="seed"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.seed && touched.seed && (
                    <Text.Caption tone="critical">{errors.seed}</Text.Caption>
                  )}
                </Spacings.Stack>
                <Spacings.Stack scale="xs">
                  <SelectField
                    title={intl.formatMessage(messages.formTone)}
                    name="tone"
                    value={values.tone}
                    options={[
                      { value: 'export', label: 'Expert' },
                      { value: 'sophisticated', label: 'Sophisticated' },
                    ]}
                    onChange={handleChange}
                  />
                  {errors.tone && touched.tone && (
                    <Text.Caption tone="critical">{errors.tone}</Text.Caption>
                  )}
                </Spacings.Stack>
                <Spacings.Inline scale="xl">
                  <PrimaryButton
                    label={intl.formatMessage(messages.getDescription)}
                    type="submit"
                    isDisabled={loading || !isValid || isLoading}
                    disabled={loading || !isValid || isLoading}
                  ></PrimaryButton>
                </Spacings.Inline>
              </Spacings.Stack>
            </Form>
          )}
        </Formik>
      </CollapsiblePanel>
      {isSuggestionArrived && (
        <Spacings.Stack scale="m">
          <LocalizedMultilineTextField
            title="desc"
            value={suggestion}
            selectedLanguage="en-US"
            defaultExpandMultilineText
            defaultExpandLanguages
          ></LocalizedMultilineTextField>
          <Spacings.Inline scale="xl">
            <SecondaryButton
              label={intl.formatMessage(messages.editSuggection)}
              type="button"
              onClick={() => setisSuggestionArrived(false)}
            ></SecondaryButton>
            <PrimaryButton
              label={intl.formatMessage(messages.acceptSuggestion)}
              type="button"
              onClick={handleUpdateProduct}
            ></PrimaryButton>
          </Spacings.Inline>
        </Spacings.Stack>
      )}
    </Spacings.Stack>
  );
};

export default PromptForm;
