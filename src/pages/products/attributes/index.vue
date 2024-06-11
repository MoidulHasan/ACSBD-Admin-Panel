<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast";
import type { IPaginatedResponse } from "~/app/interfaces/common";
import type { IProductAttribute } from "~/app/interfaces/products";

useHead({
  title: "Attributes | Product",
});

definePageMeta({
  name: "product-attributes",
});

const store = useStore();
const { $apiClient } = useNuxtApp();
const toast = useToast();

const currentPage = ref(1);
const showAttributeFormModal = ref(false);
const showDeleteConfirmationModal = ref(false);
const deletableAttributeSlug = ref<null | string>(null);
const editableAttributeData = ref<null | IProductAttribute>(null);

const {
  data: attributes,
  pending,
  refresh,
  error,
} = await useAsyncData(
  () =>
    $apiClient<IPaginatedResponse<IProductAttribute>>(
      `/admin/attributes?page=${currentPage.value}&limit=10`,
    ),
  {
    watch: [currentPage],
  },
);

if (error.value) {
  throw createError(error.value);
}

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  "values.name": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const handleFormSubmit = async () => {
  showAttributeFormModal.value = false;
  editableAttributeData.value = null;
  await refresh();
};

const handleEditButtonClick = (attributeData: IProductAttribute) => {
  editableAttributeData.value = attributeData;
  showAttributeFormModal.value = true;
};

const handleDeleteButtonClick = (slug: string) => {
  showDeleteConfirmationModal.value = true;
  deletableAttributeSlug.value = slug;
};

const hideDeleteConfirmationModal = () => {
  showDeleteConfirmationModal.value = false;
  deletableAttributeSlug.value = null;
};

const handleDeleteConfirmation = async () => {
  try {
    store.loading = true;
    const response = await $apiClient(
      `/admin/attributes/${deletableAttributeSlug.value}`,
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
    await refresh();
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
  <div class="table-container">
    <DataTable
      v-if="attributes?.data"
      v-model:filters="filters"
      :value="attributes.data"
      table-style="min-width: 50rem"
      data-key="id"
      :loading="pending"
      :global-filter-fields="['name', 'values.name']"
      striped-rows
    >
      <template #header>
        <CommonDataTableHeader
          v-model:search-text="filters['global'].value"
          :add-button-label="'Add Attributes'"
          :table-header="'Product Attributes'"
          @on-add-button-clicked="showAttributeFormModal = true"
        />
      </template>

      <Column header="SL">
        <template #body="slotProps">
          <div>
            {{ (currentPage - 1) * 10 + slotProps.index + 1 }}
          </div>
        </template>
      </Column>

      <Column field="name" header="Name" />

      <Column field="values" header="Values">
        <template #body="slotProps">
          <ul class="flex gap-2 flex-wrap">
            <li
              v-for="item in slotProps.data.values"
              :key="item.name"
              class="border-2 px-2 rounded"
            >
              {{ item.name }}
            </li>
          </ul>
        </template>
      </Column>

      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <button
              class="option-action-button"
              @click="() => handleEditButtonClick(slotProps.data)"
            >
              <i class="pi pi-file-edit" />
            </button>

            <button
              class="option-action-button"
              @click="() => handleDeleteButtonClick(slotProps.data.slug)"
            >
              <i class="pi pi-trash" />
            </button>
          </div>
        </template>
      </Column>

      <template #footer>
        <CommonPagination
          v-model:current-page="currentPage"
          :total-page="attributes?.meta?.last_page"
        />
      </template>
    </DataTable>

    <div v-else-if="error" class="h-full">
      <CommonError :error="error" />
    </div>

    <client-only>
      <Dialog
        v-model:visible="showAttributeFormModal"
        modal
        :draggable="false"
        header="Add Attribute"
        @hide="() => (editableAttributeData = null)"
      >
        <PagesProductAttributesForm
          :attribute-data="editableAttributeData"
          @on-form-submit="handleFormSubmit"
        />
      </Dialog>

      <CommonDeleteConfirmationModal
        v-model:visible="showDeleteConfirmationModal"
        :disabled="store.loading"
        @on-confirm="handleDeleteConfirmation"
        @on-cancel="hideDeleteConfirmationModal"
      />
    </client-only>
  </div>
</template>

<style scoped lang="postcss">
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
