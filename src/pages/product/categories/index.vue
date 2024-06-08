<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "primevue/api";
import DataTableHeader from "~/components/Common/DataTableHeader.vue";

import type { CategoryData, MinifiedCategory } from "~/app/interfaces/products";
import type { IPaginatedResponse } from "~/app/interfaces/common";

useHead({
  title: "Categories | Product",
});

definePageMeta({
  name: "product-categories",
});

const toast = useToast();
const { $apiClient } = useNuxtApp();

const currentPage = ref(1);
const store = useStore();
const expandedRows = ref({});

const transformNode = (node: CategoryData[], currentIndex: number) => {
  if (Array.isArray(node)) {
    return node.map((item, index) => transformNode(item, index + 1));
  } else if (typeof node === "object" && node !== null) {
    // Extract children and other data
    const { childrens, ...data } = node;

    // index property assing
    data.index = currentIndex;

    // Map visibility_status
    if (data.visibility_status === "public") {
      data.visibility_status = "Active";
    } else if (data.visibility_status === "hidden") {
      data.visibility_status = "Inactive";
    }

    // Return transformed node
    return {
      key: node.id.toString(),
      data,
      children:
        childrens && childrens.length > 0
          ? childrens?.map((child: CategoryData[], index: number) =>
              transformNode(child, index + 1),
            )
          : [],
    };
  }
  return node;
};

const {
  data: allCategories,
  refresh: refreshCategories,
  pending,
  error,
} = await useAsyncData<CategoryData[]>(() => $apiClient(`/admin/categories`), {
  transform: (data) => transformNode(data.data),
});
if (error.value) {
  throw createError(error.value);
}

// const { data: allCategoriesWithNode, refresh: refreshNodeCat } =
//   await useAsyncData(() => $apiClient(`/admin/categories`), {
//     transform: (data) => transformNode(data.data),
//   });
// console.log("Transformed Data", allCategoriesWithNode.value);

const refreshCategoryDataInEverywhere = () => {
  store.setAllCategoryData(allCategories.value);
};

if (allCategories.value?.length) {
  refreshCategoryDataInEverywhere();
}

function flattenDataUsingReduce(categories: any) {
  return categories.reduce((acc: any, item: any) => {
    const { children, ...rest } = item;
    acc.push({
      id: rest.data.id,
      name: rest.data.name,
      parent_id: rest.data.parent_id,
    });
    if (children && children.length > 0) {
      acc = acc.concat(flattenDataUsingReduce(children));
    }
    return acc;
  }, []);
}

const refreshAllCategoryData = () => {
  store.productCategories = flattenDataUsingReduce(allCategories.value);
  refreshCategoryDataInEverywhere();
};

// const filters = ref({
//   global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//   name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
//   "values.name": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
// });

const filters = ref({});

const expandAll = () => {
  expandedRows.value = allCategories.value.reduce(
    (acc, p) => (acc[p.id] = true) && acc,
    {},
  );
};
const collapseAll = () => {
  expandedRows.value = null;
};

const getParentName = (id: string | number | null) => {
  if (!id) {
    return "None";
  }
  console.log(id, "IDD");
  return (
    store.flattenedCategories.find(
      (cat: MinifiedCategory) => String(cat.id) === String(id),
    )?.name ?? "None"
  );
};

const showCategoryFormModal = ref(false);
const editableCategoryData = ref(null);

const refreshCategoryInfo = async () => {
  await refreshCategories();
  refreshAllCategoryData();
};

const handleFormSubmit = async () => {
  showCategoryFormModal.value = false;
  editableCategoryData.value = null;
  await refreshCategoryInfo();
};

// edit

const handleEditButtonClick = (categoryData: CategoryData) => {
  editableCategoryData.value = categoryData;
  showCategoryFormModal.value = true;
};

// delete starts
const showDeleteConfirmationModal = ref(false);
const categorySlugToDelete = ref<null | string>(null);
const handleDeleteButtonClick = (slug: string) => {
  showDeleteConfirmationModal.value = true;
  categorySlugToDelete.value = slug;
};
const hideDeleteConfirmationModal = () => {
  showDeleteConfirmationModal.value = false;
  categorySlugToDelete.value = null;
};
const handleDeleteConfirmation = async () => {
  try {
    store.loading = true;
    const response = await $apiClient(
      `/admin/categories/${categorySlugToDelete.value}`,
      {
        method: "DELETE",
      },
    );
    store.loading = false;

    toast.add({
      severity: "success",
      summary: "Request Success",
      detail: response.message,
      life: 3000,
    });

    hideDeleteConfirmationModal();
    await refreshCategoryInfo();
  } catch (error) {
    store.loading = false;

    toast.add({
      severity: "error",
      summary: "Request Failed",
      detail: error.statusMessage,
      life: 3000,
    });
  }
};

watch(currentPage, () => {
  store.setCurrentPage(currentPage.value);
});
</script>

<template>
  <div class="table-container">
    <TreeTable
      v-if="allCategories.length"
      :value="store.getPaginatedCategories"
      :filters="filters"
      :loading="pending"
      filter-mode="lenient"
      :rows="10"
      :row-hover="true"
      striped-rows
      class="custom-treetable"
    >
      <template #header>
        <DataTableHeader
          v-model:search-text="filters['global']"
          :add-button-label="'Add A Category'"
          :table-header="'Product Categories'"
          @on-add-button-clicked="showCategoryFormModal = true"
        />
      </template>
      <Column
        expander
        header="SN"
        style="width: 10rem"
        header-class="text-center"
      >
        <template #body="slotProps">
          {{ slotProps.node.data.index }}
        </template>
      </Column>
      <Column header="Image" header-class="min-w-42">
        <template #body="slotProps">
          <img
            class="h-20 w-44"
            :src="slotProps.node.data.image_url"
            :alt="slotProps.node.data.name"
          />
        </template>
      </Column>
      <Column field="name" header="Name" header-class="min-w-42" body-class="min-w-42" />
      <Column field="visibility_status" header="Status" />
      <Column header="Parent">
        <template #body="slotProps">
          {{ getParentName(slotProps.node.data.parent_id) }}
        </template>
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <button class="action-button">
              <i
                class="pi pi-file-edit block block-edit"
                title="Edit Category Information"
                @click="handleEditButtonClick(slotProps.node.data)"
              />
            </button>
            <button class="action-button">
              <i
                class="pi pi-trash block block-delete"
                title="Delete This Category"
                @click="() => handleDeleteButtonClick(slotProps.node.data.slug)"
              />
            </button>
          </div>
        </template>
      </Column>
      <template #footer>
        <CommonPagination
          v-model:current-page="currentPage"
          :total-page="Math.ceil(allCategories.length / 10)"
        />
      </template>
    </TreeTable>
    <div v-else-if="error" class="h-full">
      <CommonError :error="error" />
    </div>
    <ClientOnly>
      <Dialog
        v-model:visible="showCategoryFormModal"
        modal
        :draggable="false"
        header="Add A Category"
        @hide="() => (editableCategoryData = null)"
      >
        <PagesProductsCategoriesForm
          :category-data="editableCategoryData"
          @on-form-submit="handleFormSubmit"
        />
      </Dialog>
      <!--      delete modal -->
      <CommonDeleteConfirmationModal
        v-model:visible="showDeleteConfirmationModal"
        :disabled="store.loading"
        @on-confirm="handleDeleteConfirmation"
        @on-cancel="hideDeleteConfirmationModal"
      />
    </ClientOnly>
  </div>
</template>

<style scoped>
.table-container {
  @apply bg-white rounded-xl  py-6;

  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;

  color: var(--dark-gray-80);

  :deep(.p-treetable-header) {
    @apply p-0;
    @apply pt-4;
  }

  :deep(tr) {
    @apply px-5 even:bg-color-light-gray-secondary;
  }

  :deep(th) {
    @apply bg-white;
  }

  :deep(td) {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;

    color: var(--primary-color-dark-gray);
  }

  :deep(.p-treetable-footer) {
    border: 0;
  }

  .action-button {
    width: 24px;
    height: 24px;

    &:hover {
      color: var(--primary-color-navy-blue);
    }
  }
}

.block-edit,
.block-delete {
  transition: 0.5s;
}
.block-edit:hover,
.block-delete:hover {
  transform: scale(1.05);
  color: var(--primary-color-envitect-sam-blue);
}
.block-delete:hover {
  color: var(--color-danger);
}
</style>
