import type {
  IAttributeFormData,
  ICategoryData,
  ICategoryResponse,
  IProductAttribute,
} from "~/app/interfaces/products";
import type {
  ICreateResponse,
  IDataResponse,
  IDeleteResponse,
  IUpdateResponse,
} from "~/app/interfaces/common";

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

  const createCategory = async (categoryData: any) => {
    try {
      const response = await $apiClient<ICreateResponse>("/admin/categories", {
        method: "POST",
        body: categoryData,
      }).catch((error) => error.data);

      if (!response?.errors) await fetchCategories();

      return response;
    } catch (err) {
      return err;
    }
  };

  const updateCategory = async (slug: string, updatedData: any) => {
    try {
      const response = await $apiClient<IUpdateResponse<ICategoryResponse>>(
        `/admin/categories/${slug}`,
        {
          method: "PUT",
          body: updatedData,
        },
      ).catch((error) => error.data);

      if (response.data) {
        const updatedCategoryIndex = categories.value.findIndex(
          (category) => category.slug === slug,
        );

        if (updatedCategoryIndex !== -1) {
          categories.value[updatedCategoryIndex] = response.data;
        }
      }

      return response;
    } catch (err) {
      return err;
    }
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
    createCategory,
    updateCategory,
    deleteCategoryBySlug,
  };
});
