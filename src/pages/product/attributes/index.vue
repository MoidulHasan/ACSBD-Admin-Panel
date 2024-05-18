<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

useHead({
  title: "Attributes | Product",
});

definePageMeta({
  name: "product-attributes",
});

const currentPage = ref(1);
const showAttributeFormModal = ref(false);

const {
  data: attributes,
  pending,
  refresh,
} = await useFetch(
  () => `/api/proxy/admin/attributes/?page=${currentPage.value}`,
  {
    watch: [currentPage],
  },
);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  "values.name": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const handleFormSubmit = async () => {
  showAttributeFormModal.value = false;
  await refresh();
};
</script>

<template>
  <div class="table-container">
    <DataTable
      v-model:filters="filters"
      :value="attributes?.data"
      table-style="min-width: 50rem"
      :rows="10"
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
            <button class="action-button">
              <i class="pi pi-file-edit" />
            </button>

            <button class="action-button">
              <i class="pi pi-trash" />
            </button>
          </div>
        </template>
      </Column>

      <template #footer>
        <CommonPagination
          v-model:current-page="currentPage"
          :total-page="attributes.meta.last_page"
        />
      </template>
    </DataTable>

    <client-only>
      <Dialog
        v-model:visible="showAttributeFormModal"
        modal
        :draggable="false"
        header="Add Attribute"
      >
        <PagesProductsAttributesForm @on-form-submit="handleFormSubmit" />
      </Dialog>
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

  .action-button {
    width: 24px;
    height: 24px;

    &:hover {
      color: var(--primary-color-navy-blue);
    }
  }
}
</style>
