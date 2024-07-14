<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast";
import type { IDataResponse, IDeleteResponse } from "~/app/interfaces/common";
import type { IBrand } from "~/app/interfaces/products";
import { getSeverity } from "~/utils/getVisibilitySeverity";

useHead({
  title: "Brands | Products",
});
definePageMeta({
  name: "product-brands",
});

const { $apiClient } = useNuxtApp();
const store = useStore();
const toast = useToast();

const currentPage = ref(0);
const showBrandFormModal = ref<boolean>(false);
const showDeleteConfirmModal = ref<boolean>(false);
const editableBrandData = ref<IBrand | null>(null);
const brandSlugToDelete = ref<string | null>(null);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const {
  data: brands,
  error,
  pending,
  refresh,
} = await useAsyncData<IDataResponse<IBrand[]>>("brands", () =>
  $apiClient(`/admin/brands`),
);

const handleEditButtonClick = (brand: IBrand) => {
  editableBrandData.value = brand;
  showBrandFormModal.value = true;
};

const handleFormSubmit = () => {
  showBrandFormModal.value = false;
  editableBrandData.value = null;
  refresh();
};

const handleDeleteButtonClick = (slug: string) => {
  brandSlugToDelete.value = slug;
  showDeleteConfirmModal.value = true;
};
const hideDeleteConfirmModal = () => {
  brandSlugToDelete.value = null;
  showDeleteConfirmModal.value = false;
};

const handleDeleteConfirmation = async () => {
  if (!brandSlugToDelete.value) return;

  try {
    store.loading = true;
    const response = await $apiClient<IDeleteResponse>(
      `admin/brands/${brandSlugToDelete.value}`,
      {
        method: "DELETE",
      },
    );
    await refresh();
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

  hideDeleteConfirmModal();
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
        :value="brands?.data"
        table-style="min-width: 50rem"
        data-key="id"
        :loading="pending || store.loading"
        :global-filter-fields="['name']"
        striped-rows
        :rows="10"
        paginator
        @page="changePage"
      >
        <template #header>
          <CommonDataTableHeader
            v-model:search-text="filters['global'].value"
            :add-button-label="'Add Brand'"
            :table-header="'Our brands'"
            @on-add-button-clicked="showBrandFormModal = true"
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
        <Column header="Brand Image">
          <template #body="slotProps">
            <img
              class="brand-image h-12 w-44"
              :src="slotProps.data.image_url"
              :alt="slotProps.data.name"
            />
          </template>
        </Column>

        <Column field="name" header="Name" style="min-height: 40%" />
        <Column header="Status">
          <template #body="{ data }">
            <Tag
              :value="data.visibility_status === 'public' ? 'Public' : 'Hidden'"
              :severity="getSeverity(data.visibility_status)"
            />
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <button
                class="table-action-button option-action-button"
                @click="handleEditButtonClick(slotProps.data)"
              >
                <i class="pi pi-file-edit" />
              </button>

              <button
                class="table-action-button option-action-button delete-btn"
                @click="() => handleDeleteButtonClick(slotProps.data.slug)"
              >
                <i class="pi pi-trash" />
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
          v-model:visible="showBrandFormModal"
          modal
          :draggable="false"
          header="Add A Brand"
          @hide="() => (editableBrandData = null)"
        >
          <PagesProductsBrandsForm
            :brand-data="editableBrandData"
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
  </div>
</template>

<style scoped></style>
