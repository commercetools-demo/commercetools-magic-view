import MultilineTextField from '@commercetools-uikit/multiline-text-field';
import { ContentNotification } from '@commercetools-uikit/notifications';
import NumberField from '@commercetools-uikit/number-field';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SelectField from '@commercetools-uikit/select-field';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { Form, Formik } from 'formik';
import { useIntl } from 'react-intl';
import { useConfiguration } from '../../hooks/configuration';
import messages from './messages';
import { useState } from 'react';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import PromptForm from '../prompt-form';
import Constraints from '@commercetools-uikit/constraints';

const ConfigurationForm = ({ productId }: { productId: string }) => {
  const intl = useIntl();

  const [isConfiguring, setisConfiguring] = useState(false);

  const { setMaxTokens, setSeedText, getSeedText, getFields, setFields, getFieldOptions } =
    useConfiguration();


  const initialValues = {
    maxTokens: 100,
    seedText: getSeedText(),
    fields: getFields(),
  };

  if (!isConfiguring) {
    return (
      <Spacings.Stack scale="xl">
        <Spacings.Inline scale="xl" justifyContent="flex-end">
          <SecondaryButton
            label={intl.formatMessage(messages.reconfigure)}
            onClick={() => {
              setisConfiguring(true);
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
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          setMaxTokens(values.maxTokens);
          setSeedText(values.seedText);
          setFields(values.fields);
          setisConfiguring(false);
        }}
        validate={(values) => {
          const errors = {} as any;
          if (!values.maxTokens) {
            errors.maxTokens = 'Required';
          }
          if (!values.seedText) {
            errors.seedText = 'Required';
          }
          if (!values.fields || values.fields.length === 0) {
            errors.fields = 'At least one field must be selected';
          }
          console.log({ errors });
          return errors;
        }}
      >
        {({
          values,
          isValid,
          errors,
          touched,
          dirty,
          handleChange,
          handleBlur,
        }) => (
          <Form style={{ width: '100%' }}>
            <Spacings.Stack scale="m">
              <Constraints.Horizontal>
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
                <Spacings.Stack scale="xs">
                  <MultilineTextField
                    title={intl.formatMessage(messages.seedText)}
                    value={values.seedText}
                    name="seedText"
                    defaultExpandMultilineText
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.seedText && touched.seedText && (
                    <Text.Caption tone="critical">
                      {errors.seedText}
                    </Text.Caption>
                  )}
                </Spacings.Stack>
                <Spacings.Stack scale="xs">
                  <SelectField
                    title={intl.formatMessage(messages.fields)}
                    value={values.fields}
                    options={getFieldOptions()}
                    name="fields"
                    isMulti={true}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.fields && touched.fields && (
                    <Text.Caption tone="critical">{errors.fields}</Text.Caption>
                  )}
                </Spacings.Stack>
              </Constraints.Horizontal>
              <Spacings.Inline scale="xl" justifyContent="space-between">
                <SecondaryButton
                  label={intl.formatMessage(messages.cancel)}
                  onClick={() => {
                    setisConfiguring(false);
                  }}
                ></SecondaryButton>
                <PrimaryButton
                  isDisabled={!isValid || !dirty}
                  label={intl.formatMessage(messages.save)}
                  type="submit"
                ></PrimaryButton>
              </Spacings.Inline>
            </Spacings.Stack>
          </Form>
        )}
      </Formik>
    </Spacings.Inline>
  );
};

export default ConfigurationForm;
