import {
  useMcQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS, MC_API_PROXY_TARGETS } from '@commercetools-frontend/constants';
import FetchProductQuery from './fetch-product.ctp.graphql';
import { useMemo } from 'react';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  actions,
  TSdkAction,
  useAsyncDispatch,
} from '@commercetools-frontend/sdk';
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

const mapfieldToAction: Record<string, string> = {
  description: 'setDescription',
  slug: 'changeSlug',
  metaTitle: 'setMetaTitle',
  metaDescription: 'setMetaDescription',
  metaKeywords: 'setMetaKeywords',
}



export const useProduct = ({ productId }: { productId: string }) => {
  const { dataLocale, project } = useApplicationContext((context) => context);
  const dispatchAppsRead = useAsyncDispatch<TSdkAction, any>();

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

  const updateProduct = async (field: string, suggestion: Record<string, string>) => {
    const product = await dispatchAppsRead(
      actions.get({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: `/${project?.key}/products/${productId}`,
      })
    );
    return dispatchAppsRead(
      actions.post({
        mcApiProxyTarget: MC_API_PROXY_TARGETS.COMMERCETOOLS_PLATFORM,
        uri: `/${project?.key}/products/${productId}`,
        payload: {
          version: product.version,
          actions: [{
            action: mapfieldToAction[field],
            [field]: suggestion,
            staged: false,
          }],
        },
      })
    );

  };

  return {
    product,
    version,
    error: fetchError,
    loading: fetchLoading,
    updateProduct,
  };
};
