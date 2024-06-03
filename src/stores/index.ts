import type { MinifiedCategory } from "~/app/interfaces/products";

export const useStore = defineStore("mainStore", () => {
  const loading = ref(false);

  const productCategories = ref<MinifiedCategory[] | [] | undefined>([]);

  return { loading, productCategories };
});
