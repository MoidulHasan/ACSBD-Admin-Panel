import type {
  IAttributeFormData,
  IProductAttribute,
} from "~/app/interfaces/products";
import type {
  ICreateResponse,
  IDataResponse,
  IDeleteResponse,
  IUpdateResponse,
} from "~/app/interfaces/common";

export const useAttributeStore = defineStore("attributeStore", () => {
  const { $apiClient } = useNuxtApp();

  const attributes = ref<IProductAttribute[]>([]);

  const fetchAttributes = async () => {
    const { data } =
      await $apiClient<IDataResponse<IProductAttribute[]>>("/admin/attributes");

    attributes.value = data;
  };

  const getAttributesByPageAndLimit = (
    page: number = 1,
    limit: number = 10,
  ) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return attributes.value.slice(start, end);
  };

  const deleteAttributeBySlug = async (slug: string) => {
    const response = await $apiClient<IDeleteResponse>(
      `/admin/attributes/${slug}`,
      {
        method: "DELETE",
      },
    );

    attributes.value = attributes.value.filter((attr) => attr.slug !== slug);
    return response;
  };

  const createAttribute = async (attributeData: IAttributeFormData) => {
    try {
      const response = await $apiClient<ICreateResponse>("/admin/attributes", {
        method: "POST",
        body: attributeData,
      }).catch((error) => error.data);

      if (!response?.errors) await fetchAttributes();

      return response;
    } catch (err) {
      return err;
    }
  };

  const updateAttribute = async (
    slug: string,
    updatedData: IAttributeFormData,
  ) => {
    try {
      const response = await $apiClient<IUpdateResponse<IProductAttribute>>(
        `/admin/attributes/${slug}`,
        {
          method: "PUT",
          body: updatedData,
        },
      ).catch((error) => error.data);

      if (response.data) {
        const updatedAttributeIndex = attributes.value.findIndex(
          (attr) => attr.slug === slug,
        );

        if (updatedAttributeIndex !== -1) {
          attributes.value[updatedAttributeIndex] = response.data;
        }
      }

      return response;
    } catch (err) {
      return err;
    }
  };

  return {
    attributes,
    fetchAttributes,
    getAttributesByPageAndLimit,
    deleteAttributeBySlug,
    createAttribute,
    updateAttribute,
  };
});
