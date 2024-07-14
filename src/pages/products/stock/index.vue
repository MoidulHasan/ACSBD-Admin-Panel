<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import type { IDataResponse } from "~/app/interfaces/common";
import type { IStock } from "~/app/interfaces/products";

useHead({
  title: "Stock Management | Product",
});
definePageMeta({
  name: "product-stock",
});

const { $apiClient } = useNuxtApp();
const store = useStore();

const currentPage = ref(0);
const showStockFormModal = ref<boolean>(false);
const editableStockData = ref<IStock | null>(null);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const {
  data: stocks,
  error,
  pending,
  refresh,
} = await useAsyncData<IDataResponse<IStock[]>>("stocks", () =>
  $apiClient(`/admin/stocks`),
);

const handleEditButtonClick = (stock: IStock) => {
  editableStockData.value = stock;
  showStockFormModal.value = true;
};

const handleFormSubmit = () => {
  showStockFormModal.value = false;
  editableStockData.value = null;
  refresh();
};

const changePage = (e: { page: number }) => {
  currentPage.value = e.page;
};
</script>

<template>
  <div>
    <div class="table-container">
      <DataTable
        v-model:filters="filters"
        :value="stocks?.data"
        table-style="min-width: 50rem"
        data-key="id"
        :loading="pending || store.loading"
        :global-filter-fields="['product_id', 'quantity']"
        striped-rows
        :rows="10"
        paginator
        @page="changePage"
      >
        <template #header>
          <CommonDataTableHeader
            v-model:search-text="filters['global'].value"
            :table-header="'Stock Management'"
          />
        </template>

        <template #empty>
          <CommonNoDataFound />
        </template>

        <Column header="SL">
          <template #body="slotProps">
            <div>
              {{ currentPage * 10 + slotProps.index + 1 }}
            </div>
          </template>
        </Column>
        <Column field="product_id" header="Product ID" />
        <Column field="quantity" header="Stock Quantity" />
        <Column header="Actions">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <button
                class="table-action-button option-action-button"
                @click="handleEditButtonClick(slotProps.data)"
              >
                <i class="pi pi-file-edit" />
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
          v-model:visible="showStockFormModal"
          modal
          :draggable="false"
          header="Update Product Stock"
          @hide="() => (editableStockData = null)"
        >
          <PagesProductsStocksForm
            :stock-data="editableStockData"
            @on-form-submit="handleFormSubmit"
          />
        </Dialog>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped></style>
