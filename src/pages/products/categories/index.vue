<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import type { ICategoryResponse } from "~/app/interfaces/products";
import type { ICreateResponse } from "~/app/interfaces/common";

useHead({
  title: "Categories | Product",
});

definePageMeta({
  name: "product-categories",
});

const toast = useToast();
const { $apiClient } = useNuxtApp();

const store = useStore();
const categoryStore = useCategoryStore();

const { pending, error } = await useAsyncData<ICategoryResponse[]>(
  "category-data",
  () => categoryStore.fetchCategories(),
);

if (error.value) {
  throw createError(error.value);
}

const filters = ref({});

const showCategoryFormModal = ref(false);
const editableCategoryData = ref<ICategoryResponse | null>(null);

const handleFormSubmit = () => {
  showCategoryFormModal.value = false;
  editableCategoryData.value = null;
};

// edit

const handleEditButtonClick = (categoryData: ICategoryResponse) => {
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
    const response = await $apiClient<ICreateResponse>(
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
  <div>
    <div class="table-container">
      <TreeTable
        :filters="filters"
        :value="categoryStore.categoryNodes"
        :loading="pending"
        filter-mode="lenient"
        :rows="10"
        :row-hover="true"
        striped-rows
        class="custom-treetable"
        paginator
        filter-display="menu"
      >
        <template #header>
          <CommonDataTableHeader
            v-model:search-text="filters['global']"
            :add-button-label="'Add A Category'"
            :table-header="'Product Categories'"
            @on-add-button-clicked="showCategoryFormModal = true"
          />
        </template>

        <Column
          field="name"
          header="Name"
          header-class="min-w-42 pl-14"
          body-class="min-w-42"
          expander
        />

        <Column
          header="Image"
          header-class="min-w-42 flex align-center justify-center"
        >
          <template #body="slotProps">
            <div class="flex align-center justify-center">
              <img
                class="h-20 w-44"
                :src="slotProps.node.data.image_url"
                :alt="slotProps.node.data.name"
              />
            </div>
          </template>
        </Column>

        <Column field="visibility_status" header="Status">
          <template #body="slotProps">
            <span class="capitalize">
              {{ slotProps.node.data.visibility_status }}
            </span>
          </template>
        </Column>

        <Column header="Parent" field="parent">
          <template #body="slotProps">
            {{
              categoryStore.getCategoryById(slotProps.node.data.parent_id)
                ?.name ?? "None"
            }}
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
                  @click="
                    () => handleDeleteButtonClick(slotProps.node.data.slug)
                  "
                />
              </button>
            </div>
          </template>
        </Column>
      </TreeTable>
      <div v-if="error" class="h-full">
        <CommonError :error="error" />
      </div>
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
