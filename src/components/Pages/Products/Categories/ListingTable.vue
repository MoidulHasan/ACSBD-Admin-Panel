<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "primevue/api";
import type {
  CategoryData,
  MinifiedCategory,
} from "~/app/interfaces/products";

const toast = useToast();
const expandedRows = ref({});
const store = useStore();
const { $apiClient } = useNuxtApp();

const props = defineProps<{
  categories: any;
}>();

const emit = defineEmits<{
  (e: "refreshAllCategory"): void;
}>();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  "values.name": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const refreshAllData = async () => {
  emit("refreshAllCategory");
};

const getParentName = (id: string | number | null) => {
  if (!id) {
    return "None";
  }
  return store.productCategories.find((cat: MinifiedCategory) => cat.id === id)
    ?.name;
};

const showCategoryFormModal = ref(false);
const editableCategoryData = ref(null);

const handleFormSubmit = async () => {
  showCategoryFormModal.value = false;
  editableCategoryData.value = null;
  await refreshAllData();
};

// edit

const handleEditButtonClick = (categoryData: CategoryData) => {
  editableCategoryData.value = categoryData;
  console.log(editableCategoryData.value, "EDIT");
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
    await refreshAllData();
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
</script>

<template>
  <div class="category-table">
    <DataTable
      v-model:expandedRows="expandedRows"
      v-model:filters="filters"
      :value="categories"
      :global-filter-fields="['name', 'values.name']"
      table-style="min-width: 50rem"
      data-key="id"
      striped-rows
    >
      <Column expander style="width: 2rem" />
      <Column header="SL">
        <template #body="slotProps">
          <div>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>
      <Column header="Image">
        <template #body="slotProps">
          <img
            class="h-12 w-44"
            :src="slotProps.data.image_url"
            :alt="slotProps.data.name"
          />
        </template>
      </Column>
      <Column header="Name" style="min-width: 40%">
        <template #body="slotProps">
          {{ slotProps.data.name }}
        </template>
      </Column>
      <Column header="Status">
        <template #body="slotProps">
          {{
            slotProps.data.visibility_status === "public"
              ? "Active"
              : "De-actived"
          }}
        </template>
      </Column>
      <Column header="Parent">
        <template #body="slotProps">
          {{ getParentName(slotProps.data.parent_id) }}
        </template>
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <button class="action-button">
              <i
                class="pi pi-file-edit block block-edit"
                title="Edit Category Information"
                @click="handleEditButtonClick(slotProps.data)"
              />
            </button>
            <button class="action-button">
              <i
                class="pi pi-trash block block-delete"
                title="Delete This Category"
                @click="() => handleDeleteButtonClick(slotProps.data.slug)"
              />
            </button>
          </div>
        </template>
      </Column>
      <template #expansion="slotProps">
        <div v-if="slotProps.data.childrens.length" class="pb-3">
          <h5 class="pb-2">Children of {{ slotProps.data.name }}</h5>
          <PagesProductsCategoriesListingTable
            :categories="slotProps.data.childrens"
            @refresh-all-category="refreshAllData"
          />
        </div>
        <h3 v-else>No Children found for {{ slotProps.data.name }}</h3>
      </template>
    </DataTable>
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
.category-table {
  :deep(.p-datatable-header) {
    @apply p-0;
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

  :deep(.p-datatable-footer) {
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
