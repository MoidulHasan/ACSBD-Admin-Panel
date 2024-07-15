import type { IProduct } from "~/app/interfaces/products";
import type {
  ICreateResponse,
  IDataResponse,
  IDeleteResponse,
  IUpdateResponse,
} from "~/app/interfaces/common";

export const useProductStore = defineStore("productStore", () => {
  const { $apiClient } = useNuxtApp();

  const products = ref<IProduct[]>([]);

  const fetchProducts = async () => {
    const { data } =
      await $apiClient<IDataResponse<IProduct[]>>("/admin/products");

    products.value = data;
    return products.value;
  };

  const getProductById = (id: number) => {
    if (!id) {
      return null;
    }

    return products.value.find((product) => product.id === id);
  };

  const createProduct = async (productData: FormData) => {
    try {
      const response = await $apiClient<ICreateResponse>("/admin/products", {
        method: "POST",
        body: productData,
      }).catch((error) => error.data);

      if (!response?.errors) await fetchProducts();

      return response;
    } catch (err) {
      return err;
    }
  };

  const updateProduct = async (slug: string, updatedData: FormData) => {
    try {
      const response = await $apiClient<IUpdateResponse<IProduct>>(
        `/admin/products/${slug}`,
        {
          method: "POST",
          body: updatedData,
        },
        fetchProducts,
      ).catch((error) => error.data);

      if (response.data) {
        const updatedProductIndex = products.value.findIndex(
          (product) => product.slug === slug,
        );

        if (updatedProductIndex !== -1) {
          products.value[updatedProductIndex] = response.data;
        }
      }

      return response;
    } catch (err) {
      return err;
    }
  };

  const deleteProductBySlug = async (slug: string) => {
    const response = await $apiClient<IDeleteResponse>(
      `/admin/products/${slug}`,
      {
        method: "DELETE",
      },
    );

    products.value = products.value.filter((product) => product.slug !== slug);

    return response;
  };

  return {
    products,
    fetchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProductBySlug,
  };
});
