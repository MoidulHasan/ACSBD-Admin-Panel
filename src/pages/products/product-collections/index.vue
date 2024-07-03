<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import type { ICollection } from "~/app/interfaces/products";

definePageMeta({
  name: "product-collections",
});
useHead({
  title: "Collections | Products",
});

const store = useStore();
const toast = useToast();
const collectionStore = useCollectionStore();

const showCollectionModal = ref<boolean>(false);
const showDeleteConfirmModal = ref<boolean>(false);
const editableCollection = ref<ICollection | null>(null);
const collectionSlugToDelete = ref<string | null>(null);

const {
  pending,
  refresh: refreshCollections,
  error,
} = await useAsyncData<ICollection[]>("collection-data", () =>
  collectionStore.fetchCollections(),
);

if (error.value) {
  throw createError(error.value);
}

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const handleCreateNewCollection = () => {
  showCollectionModal.value = true;
};

const getSeverity = (status) => {
  switch (status) {
    case "public":
      return "success";

    case "private":
      return "info";
  }
};

const handleFormSubmit = async () => {
  showCollectionModal.value = false;
  editableCollection.value = null;
  await refreshCollections();
};

const handleEditButtonClick = (collectionData: ICollection) => {
  editableCollection.value = collectionData;
  showCollectionModal.value = true;
};

const handleDeleteButtonClick = (slug: string) => {
  collectionSlugToDelete.value = slug;
  showDeleteConfirmModal.value = true;
};
const hideDeleteConfirmModal = async () => {
  collectionSlugToDelete.value = null;
  showDeleteConfirmModal.value = false;
  await refreshCollections();
};

const handleDeleteConfirmation = async () => {
  if (!collectionSlugToDelete.value) return;

  try {
    store.loading = true;
    const response = await collectionStore.deleteCollectionBySlug(
      collectionSlugToDelete.value,
    );
    store.loading = false;

    toast.add({
      severity: "success",
      summary: "Request Success",
      detail: response.message,
      life: 3000,
    });
  } catch (error) {
    store.loading = false;

    toast.add({
      severity: "error",
      summary: error?.statusMessage ?? "Request Failed",
      detail: error?.data?.error ?? "Unknown Issue Occurred",
      life: 3000,
    });
  }

  await hideDeleteConfirmModal();
};
</script>

<template>
  <div class="table-container">
    <DataTable
      v-model:filters="filters"
      :value="collectionStore.collections"
      table-style="min-width: 50rem"
      data-key="id"
      :global-filter-fields="['title', 'status']"
      striped-rows
      :loading="pending || store.loading"
      :rows="10"
      paginator
    >
      <template #header>
        <CommonDataTableHeader
          v-model:search-text="filters['global'].value"
          :add-button-label="'Add Collection'"
          :table-header="'Product Collections'"
          @on-add-button-clicked="handleCreateNewCollection"
        />
      </template>
      <template #empty>
        <CommonNoDataFound />
      </template>

      <Column header="SN">
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>
      <Column header="Title">
        <template #body="slotProps">
          {{ slotProps.data.title }}
        </template>
      </Column>
      <Column header="Status">
        <template #body="{ data }">
          <Tag
            :value="data.status === 'public' ? 'Public' : 'Hidden'"
            :severity="getSeverity(data.status)"
          />
        </template>
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <button class="option-action-button">
              <i
                class="pi pi-file-edit block block-edit"
                title="Edit Collection Information"
                @click="handleEditButtonClick(slotProps.data)"
              />
            </button>
            <button class="option-action-button">
              <i
                class="pi pi-trash block block-delete"
                title="Delete This Collection"
                @click="() => handleDeleteButtonClick(slotProps.data.slug)"
              />
            </button>
          </div>
        </template>
      </Column>
    </DataTable>
    <div v-if="error" class="h-full">
      <CommonError :error="error" />
    </div>
    <ClientOnly>
      <Dialog
        v-model:visible="showCollectionModal"
        modal
        :draggable="false"
        header="Add A Collection"
        @hide="() => (editableCollection = null)"
      >
        <PagesProductsCollectionsForm
          :collection-data="editableCollection"
          @on-form-submit="handleFormSubmit"
        />
      </Dialog>
      <CommonDeleteConfirmationModal
        v-model:visible="showDeleteConfirmModal"
        :disabled="store.loading"
        @on-confirm="handleDeleteConfirmation"
        @on-cancel="hideDeleteConfirmModal"
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
}
</style>
