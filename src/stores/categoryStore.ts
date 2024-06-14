import type {
  ICategoryData,
  ICategoryResponse,
} from "~/app/interfaces/products";
import type { IDataResponse, IDeleteResponse } from "~/app/interfaces/common";

export const useCategoryStore = defineStore("categoryStore", () => {
  const { $apiClient } = useNuxtApp();

  const categories = ref<ICategoryResponse[]>([]);

  const categoryNodes = computed(() =>
    transformToCategoryNode(categories.value),
  );

  const flattenCategories = computed(() => {
    const flattenData: ICategoryResponse[] = [];

    const traverse = (categories: ICategoryResponse[]) => {
      for (const category of categories) {
        flattenData.push(category);
        if (category.childrens && category.childrens.length > 0) {
          traverse(category.childrens as ICategoryResponse[]);
        }
      }
    };

    traverse(categories.value);
    return flattenData;
  });

  const fetchCategories = async () => {
    const { data } =
      await $apiClient<IDataResponse<ICategoryResponse[]>>("/admin/categories");

    categories.value = data;
    return categories.value;
  };

  const getCategoryByPageAndLimit = (page: number = 1, limit: number = 10) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return categories.value.slice(start, end);
  };

  const getCategoryById = (id: number | null) => {
    if (!id) {
      return null;
    }

    function findCategoryById(
      categories: ICategoryResponse[],
      id: number,
    ): ICategoryResponse | null {
      for (const category of categories) {
        if (category.id === id) {
          return category;
        }

        if (category.childrens?.length) {
          const childResult = findCategoryById(category.childrens, id);

          if (childResult) {
            return childResult;
          }
        }
      }
      return null;
    }

    return findCategoryById(categories.value, id);
  };

  const deleteCategoryBySlug = async (slug: string) => {
    const response = await $apiClient<IDeleteResponse>(
      `/admin/categories/${slug}`,
      {
        method: "DELETE",
      },
    );

    categories.value = categories.value.filter(
      (category) => category.slug !== slug,
    );

    return response;
  };

  function transformToCategoryNode(
    categories: ICategoryResponse[],
  ): ICategoryData[] {
    return categories.map(({ childrens = [], slug, ...category }, index) => ({
      key: slug,
      data: { ...category, slug, index },
      children: transformToCategoryNode(childrens),
    }));
  }

  return {
    categories,
    categoryNodes,
    flattenCategories,
    fetchCategories,
    getCategoryById,
    getCategoryByPageAndLimit,
    deleteCategoryBySlug,
  };
});
