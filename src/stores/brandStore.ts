import type { IBrand } from "~/app/interfaces/products";
import type { IDataResponse } from "~/app/interfaces/common";

export const useBrandStore = defineStore("brandStore", () => {
  const { $apiClient } = useNuxtApp();

  const brands = ref<IBrand[]>([]);

  const fetchBrands = async () => {
    const { data } = await $apiClient<IDataResponse<IBrand[]>>("/admin/brands");

    brands.value = data;
    return brands.value;
  };

  return {
    brands,
    fetchBrands,
  };
});
