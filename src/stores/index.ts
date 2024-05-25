export interface CategoryData {
  id: number | null;
  name: string;
  parent_id: number | null;
}
export const useStore = defineStore("mainStore", () => {
  const loading = ref(false);

  const productCategories = ref<CategoryData[]>([]);

  return { loading, productCategories };
});
