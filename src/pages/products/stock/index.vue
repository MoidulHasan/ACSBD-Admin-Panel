<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import type { IDataResponse } from "~/app/interfaces/common";
import type {
  IProduct,
  IStock,
  IStockWithName,
} from "~/app/interfaces/products";

useHead({
  title: "Stock Management | Product",
});
definePageMeta({
  name: "product-stock",
});

const { $apiClient } = useNuxtApp();
const store = useStore();
const productStore = useProductStore();

const currentPage = ref(0);
const showStockFormModal = ref<boolean>(false);
const showStockAddForm = ref<boolean>(false);
const stockModificationFormTitle = ref<string>("Add Product Stocks");
const stockModificationType = ref<string>("Increment");
const editableStockData = ref<IStockWithName | null>(null);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const {
  data: stocks,
  error,
  status,
  refresh,
} = await useAsyncData<IDataResponse<IStock[]>>("stocks", () =>
  $apiClient(`/admin/stocks`),
);

if (!productStore.products.length) {
  const { error: productError } = await useAsyncData<IProduct[]>(
    "products-data",
    () => productStore.fetchProducts(),
  );

  if (productError.value) {
    throw createError(productError.value);
  }
}

const minifiedProductData = computed(() => {
  return productStore.products.map((product: IProduct) => ({
    id: product.id,
    name: product.name,
  }));
});

const handleEditButtonClick = (
  stock: IStock,
  type: "Increase" | "Decrease",
) => {
  const stockProductName =
    productStore.products.find(
      (product: IProduct) => product.id === stock.product_id,
    )?.name ?? " ";
  editableStockData.value = { ...stock, name: stockProductName };
  stockModificationFormTitle.value = "Update Product Stock";
  stockModificationType.value = type;
  showStockFormModal.value = true;
};

const handleFormSubmit = () => {
  showStockFormModal.value = false;
  editableStockData.value = null;
  stockModificationFormTitle.value = "Add Product Stock";
  refresh();
};

const handleAddStockFormSubmit = () => {
  showStockAddForm.value = false;
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
        :loading="status === 'pending' || store.loading"
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
            :add-button-label="'Add Product Stocks'"
            @on-add-button-clicked="showStockAddForm = true"
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
        <Column header="Product Name">
          <template #body="slotProps">
            {{
              productStore.products.find(
                (product) => product.id === slotProps.data.product_id,
              )?.name
            }}
          </template>
        </Column>
        <Column field="quantity" header="Stock Quantity" />
        <Column header="Actions">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <button
                class="table-action-button option-action-button"
                @click="handleEditButtonClick(slotProps.data, 'Increase')"
              >
                <i class="pi pi-plus" />
              </button>
              <button
                class="table-action-button option-action-button"
                @click="handleEditButtonClick(slotProps.data, 'Decrease')"
              >
                <i class="pi pi-minus" />
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
          :header="stockModificationFormTitle"
          @hide="() => (editableStockData = null)"
        >
          <PagesProductsStocksForm
            :stock-data="editableStockData"
            :operation-type="stockModificationType"
            @on-form-submit="handleFormSubmit"
          />
        </Dialog>
        <Dialog
          v-model:visible="showStockAddForm"
          modal
          :draggable="false"
          :header="stockModificationFormTitle"
          @hide="showStockAddForm = false"
        >
          <PagesProductsStocksAddForm
            :product-data="minifiedProductData"
            @on-stock-add="handleAddStockFormSubmit"
          />
        </Dialog>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped></style>
