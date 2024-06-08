import type {
  ICategoryData,
  IMinifiedCategory,
} from "~/app/interfaces/products";

export const useStore = defineStore("mainStore", () => {
  const loading = ref(false);

  const productCategories = ref<IMinifiedCategory[] | [] | undefined>([]);
  const allProductCategories = ref<ICategoryData[]>([]);
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

  function flattenDataUsingReduce(categories: ICategoryData[]) {
    return categories.reduce((acc: IMinifiedCategory[], item) => {
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
  function setAllCategoryData(categories: ICategoryData[]) {
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
