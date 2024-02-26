import {
  useMcQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchProductQuery from './fetch-product.ctp.graphql';
import UpdateProductQuery from './update-product.ctp.graphql';
import { useMemo } from 'react';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

interface Product {
  id: string;
  version: string;
  masterData: {
    current: {
      name?: string;
      description?: string;
    };
  };
}

export const useProduct = ({ productId }: { productId: string }) => {
  const { dataLocale } = useApplicationContext((context) => context);

  const {
    data,
    error: fetchError,
    loading: fetchLoading,
  } = useMcQuery<{ product: Product }>(FetchProductQuery, {
    variables: {
      id: productId,
      locale: dataLocale,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  const [
    execute,
    { data: updateData, error: updateError, loading: updateLoading },
  ] = useMcMutation<{ product: Product }>(UpdateProductQuery);

  const product = useMemo(() => {
    if (!fetchLoading && !!data?.product) {
      return data.product;
    }
    return null;
  }, [fetchLoading, data]);

  const version = useMemo(() => {
    if (!!product) {
      return parseInt(product.version, 10);
    }
    return null;
  }, [product]);

  const updateProduct = async (description: Record<string, string>) => {
    return await execute({
      variables: {
        id: productId,
        version,
        description: Object.keys(description).map((locale) => ({
          locale,
          value: description[locale],
        })),
        locale: dataLocale,
      },
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
    });
  };

  return {
    product,
    version,
    error: fetchError,
    loading: fetchLoading,
    updateProduct,
    updateError,
    updateLoading,
  };
};
