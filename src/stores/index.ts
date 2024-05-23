export const useStore = defineStore("mainStore", () => {
  const loading = ref(false);

  const productCategories = ref([]);

  return { loading, productCategories };
});
