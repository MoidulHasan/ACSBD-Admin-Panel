import type { CategoryData, MinifiedCategory } from "~/app/interfaces/products";

export const useStore = defineStore("mainStore", () => {
  const loading = ref(false);

  const productCategories = ref<MinifiedCategory[] | [] | undefined>([]);
  const allProductCategories = ref<CategoryData[]>([]);
  const currentPage = ref<number>(1);

  const flattenedCategories = computed(() => {
    return flattenDataUsingReduce(allProductCategories.value);
  });

  const getPaginatedCategories = computed(() => {
    return allProductCategories.value.slice(
      (currentPage.value - 1) * 10,
      (currentPage.value - 1) * 10 + 10,
    );
  });

  function flattenDataUsingReduce(categories: CategoryData[]) {
    return categories.reduce((acc, item) => {
      const { children, data } = item;
      acc.push({ id: data.id, name: data.name, parent_id: data.parent_id });
      if (children && children.length > 0) {
        acc = acc.concat(flattenDataUsingReduce(children));
      }
      return acc;
    }, []);
  }

  function setCurrentPage(page: number) {
    currentPage.value = page;
  }
  function setAllCategoryData(categories: CategoryData[]) {
    allProductCategories.value = categories;
  }

  return {
    loading,
    allProductCategories,
    productCategories,
    flattenedCategories,
    getPaginatedCategories,
    currentPage,
    setCurrentPage,
    setAllCategoryData,
  };
});
