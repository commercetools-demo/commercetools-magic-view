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
import { useConfiguration } from '../../hooks/configuration';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';

const PromptForm = ({ productId }: { productId: string }) => {
  const initialValues = { seed: '', tone: '' };
  const intl = useIntl();
  const [isSuggestionArrived, setisSuggestionArrived] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    [key: string]: Record<string, string>;
  }>({});
  const [isLoading, setisLoading] = useState(false);
  const [isUpdating, setisUpdating] = useState(false);

  const { dataLocale } = useApplicationContext((context) => context);

  const { loading, product, updateProduct } = useProduct({ productId });

  const { getLocalizedProductFieldSuggestion } = useGenAI();

  const { getFields, getFieldLabel } = useConfiguration();

  const fields = getFields();

  const handleSuggestion = async (values: { seed: string; tone: string }) => {
    if (product) {
      setisLoading(true);
      const results = await Promise.all(
        fields.map((field: string) =>
          getLocalizedProductFieldSuggestion(
            product.masterData.current.name!,
            field,
            values.seed,
            values.tone
          )
        )
      );

      setSuggestion(
        fields.reduce(
          (acc: Record<string, Record<string, string>>, curr: string) => ({
            ...acc,
            [curr]:
              fields.indexOf(curr) > -1 ? results[fields.indexOf(curr)] : {},
          }),
          {}
        )
      );
      setisLoading(false);
      setisSuggestionArrived(true);
    }
  };

  const handleUpdateProduct = async () => {
    setisUpdating(true);
    try {
      const errors = [];
      const nonAeoFields = fields.filter((field: string) => field !== 'aeoKeywords');
      for await (const field of nonAeoFields) {
        try {
          await updateProduct(field, suggestion[field]);
        } catch (error) {
          console.log(error);
          errors.push((error as any).body.message);
        }
      }

      if (errors.length < nonAeoFields.length) {
        showNotification({
          kind: NOTIFICATION_KINDS_SIDE.success,
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.success),
        });
      }
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      setSuggestion({});
      setisSuggestionArrived(false);
    } catch (error) {
      showNotification({
        kind: NOTIFICATION_KINDS_SIDE.error,
        domain: DOMAINS.SIDE,
        text: (error as Error).message,
      });
      setSuggestion({});
      setisSuggestionArrived(false);
    } finally {
      setisUpdating(false);
    }
  };

  return (
    <>
      {!isSuggestionArrived && (
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
      )}
      {isLoading && (
        <Spacings.Stack scale="m" alignItems="center">
          <Spacings.Inline
            scale="xs"
            justifyContent="center"
            alignItems="center"
          >
            <Text.Body>Generating suggestions...</Text.Body>
            <LoadingSpinner />
          </Spacings.Inline>
        </Spacings.Stack>
      )}
      {isSuggestionArrived && (
        <Spacings.Stack scale="m">
          {fields.map((field: string, index: number) => (
            <CollapsiblePanel
              key={field}
              header={
                intl
                  .formatMessage(messages.formEditorHeader, {
                    productName: product?.masterData?.current?.name,
                    field: getFieldLabel(field),
                  })
                  .substring(0, 60) + '...'
              }
              condensed
              isDefaultClosed={index !== 0}
              horizontalConstraint="scale"
            >
              <LocalizedMultilineTextField
                title={getFieldLabel(field)}
                value={suggestion[field] || {}}
                selectedLanguage={dataLocale || 'en-US'}
                defaultExpandMultilineText
                defaultExpandLanguages
              ></LocalizedMultilineTextField>
            </CollapsiblePanel>
          ))}
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
    </>
  );
};

export default PromptForm;
