import type { ICollection } from "~/app/interfaces/products";
import type {
  ICreateResponse,
  IDataResponse,
  IDeleteResponse,
  IUpdateResponse,
} from "~/app/interfaces/common";

export const useCollectionStore = defineStore("collectionStore", () => {
  const { $apiClient } = useNuxtApp();

  const collections = ref<ICollection[]>([]);

  const fetchCollections = async () => {
    const { data } =
      await $apiClient<IDataResponse<ICollection[]>>("/admin/collections");

    collections.value = data;
    return collections.value;
  };

  const getCollectionById = (id: number | null) => {
    if (!id) {
      return null;
    }

    function findCollectionById(
      collections: ICollection[],
      id: number,
    ): ICollection | null {
      for (const collection of collections) {
        if (collection.id === id) {
          return collection;
        }
      }
      return null;
    }

    return findCollectionById(collections.value, id);
  };

  const createCollection = async (collectionData: any) => {
    try {
      const response = await $apiClient<ICreateResponse>("/admin/collections", {
        method: "POST",
        body: collectionData,
      }).catch((error) => error.data);

      if (!response?.errors) await fetchCollections();

      return response;
    } catch (err) {
      return err;
    }
  };

  const updateCollection = async (slug: string, updatedData: any) => {
    try {
      const response = await $apiClient<IUpdateResponse<ICollection>>(
        `/admin/collections/${slug}`,
        {
          method: "PUT",
          body: updatedData,
        },
      ).catch((error) => error.data);

      if (response.data) {
        const updatedCollectionIndex = collections.value.findIndex(
          (collection) => collection.slug === slug,
        );

        if (updatedCollectionIndex !== -1) {
          collections.value[updatedCollectionIndex] = response.data;
        }
      }

      return response;
    } catch (err) {
      return err;
    }
  };

  const deleteCollectionBySlug = async (slug: string) => {
    const response = await $apiClient<IDeleteResponse>(
      `/admin/collections/${slug}`,
      {
        method: "DELETE",
      },
    );

    collections.value = collections.value.filter(
      (collection) => collection.slug !== slug,
    );

    return response;
  };

  return {
    collections,
    fetchCollections,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollectionBySlug,
  };
});
