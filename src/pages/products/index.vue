<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast";
import type { IDataResponse, IDeleteResponse } from "~/app/interfaces/common";
import type { IProduct } from "~/app/interfaces/products";

useHead({
  title: "Products",
});

definePageMeta({
  name: "product-list",
});

const store = useStore();
const { $apiClient } = useNuxtApp();
const toast = useToast();

const showDeleteConfirmationModal = ref(false);
const deletableProductSlug = ref<null | string>(null);

const {
  data: products,
  refresh,
  error,
  status: productsDataFetchingStatus,
} = await useAsyncData<IDataResponse<IProduct[]>>(`product-data`, () =>
  $apiClient(`/admin/products`),
);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const getSeverity = (status) => {
  switch (status) {
    case "public":
      return "success";

    case "hidden":
      return "info";
  }
};

const handleCreateNewProduct = async () => {
  await navigateTo({ name: "product-create-new" });
};

const handleEditButtonClick = async (slug: string) => {
  await navigateTo({
    name: "product-edit",
    params: {
      slug,
    },
  });
};

const handleDeleteButtonClick = (slug: string) => {
  showDeleteConfirmationModal.value = true;
  deletableProductSlug.value = slug;
};

const hideDeleteConfirmationModal = () => {
  showDeleteConfirmationModal.value = false;
  deletableProductSlug.value = null;
};

const handleDeleteConfirmation = async () => {
  try {
    store.loading = true;
    const response = await $apiClient<IDeleteResponse>(
      `/admin/products/${deletableProductSlug.value}`,
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
      detail: error?.statusMessage,
      life: 3000,
    });
  }
};
</script>

<template>
  <div class="table-container">
    <DataTable
      v-if="products?.data"
      v-model:filters="filters"
      :value="products.data"
      data-key="id"
      :loading="productsDataFetchingStatus === 'pending'"
      :global-filter-fields="['name', 'category.name']"
      striped-rows
      :rows="10"
      paginator
    >
      <template #header>
        <CommonDataTableHeader
          v-model:search-text="filters['global'].value"
          :add-button-label="'Add Product'"
          :table-header="'Products'"
          @on-add-button-clicked="handleCreateNewProduct"
        />
      </template>

      <template #empty>
        <CommonNoDataFound />
      </template>

      <Column header="SL">
        <template #body="slotProps">
          <div>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>

      <Column header="Main Image">
        <template #body="slotProps">
          <img
            class="h-20 w-24"
            :src="slotProps.data.image"
            :alt="slotProps.data.name"
          />
        </template>
      </Column>

      <Column field="name" header="Product Name" style="min-width: 40%" />

      <Column header="Type" field="category.name" />

      <Column header="Price" style="min-width: 40%">
        <template #body="slotProps">
          <span class="mr-1">
            {{ `TK ${parseInt(slotProps.data.price.final_price)}` }}
          </span>

          <span
            v-if="
              slotProps.data.price.final_price !==
              slotProps.data.price.base_price
            "
            class="line-through text-gray-400"
          >
            {{ `TK ${parseInt(slotProps.data.price.base_price)}` }}
          </span>
        </template>
      </Column>

      <Column header="Quantity">
        <template #body>
          <span>20</span>
        </template>
      </Column>

      <Column header="SKU">
        <template #body="{ data }">
          <span>{{ data.sku }}</span>
        </template>
      </Column>

      <Column header="Status" field="visibility_status">
        <template #body="{ data }">
          <Tag
            :value="data.visibility_status === 'public' ? 'Active' : 'Inactive'"
            :severity="getSeverity(data.visibility_status)"
          />
        </template>
      </Column>

      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <button
              class="option-action-button"
              @click="() => handleEditButtonClick(slotProps.data.slug)"
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
    </DataTable>

    <div v-else-if="error" class="h-full">
      <CommonError :error="error" />
    </div>

    <client-only>
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
