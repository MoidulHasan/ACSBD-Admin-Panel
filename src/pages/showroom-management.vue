<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast";
import type { IDataResponse, IDeleteResponse } from "~/app/interfaces/common";
import type { ILocation } from "~/app/interfaces/webManagement";

useHead({
  title: "Showroom Manage",
});

definePageMeta({
  name: "showroom-management",
});

const { $apiClient } = useNuxtApp();
const store = useStore();
const toast = useToast();

const currentPage = ref(0);
const showLocationFormModal = ref<boolean>(false);
const showDeleteConfirmModal = ref<boolean>(false);
const editableLocationData = ref<ILocation | null>(null);
const locationIdToDelete = ref<number | null>(null);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const {
  data: locations,
  error,
  status,
  refresh,
} = await useAsyncData<IDataResponse<ILocation[]>>("locations", () =>
  $apiClient(`/our-locations`),
);

const handleEditButtonClick = (location: ILocation) => {
  editableLocationData.value = location;
  showLocationFormModal.value = true;
};

const handleFormSubmit = () => {
  showLocationFormModal.value = false;
  editableLocationData.value = null;
  refresh();
};

const handleDeleteButtonClick = (id: number) => {
  locationIdToDelete.value = id;
  showDeleteConfirmModal.value = true;
};
const hideDeleteConfirmModal = () => {
  locationIdToDelete.value = null;
  showDeleteConfirmModal.value = false;
};

const handleDeleteConfirmation = async () => {
  if (!locationIdToDelete.value) return;

  try {
    store.loading = true;
    const response = await $apiClient<IDeleteResponse>(
      `admin/our-locations/${locationIdToDelete.value}`,
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
        :value="locations?.data"
        data-key="id"
        :loading="status === 'pending' || store.loading"
        :global-filter-fields="[
          'location_type',
          'title',
          'subtitle',
          'address',
          'phone',
        ]"
        striped-rows
        :rows="10"
        paginator
        @page="changePage"
      >
        <template #header>
          <CommonDataTableHeader
            v-model:search-text="filters['global'].value"
            :add-button-label="'Add Location'"
            :table-header="'Our Locations'"
            @on-add-button-clicked="showLocationFormModal = true"
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
        <Column field="location_type" header="Location Type" />
        <Column field="title" header="Title" />
        <Column field="subtitle" header="Subtitle" />
        <Column field="address" header="Address" style="max-width: 12vw" />
        <Column field="phone" header="Phone Number" />
        <Column header="Map Url" style="max-width: 12vw">
          <template #body="slotProps">
            <p :title="slotProps.data.map_url">
              {{ shortenString(slotProps.data?.map_url, 70) }}
            </p>
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
                @click="() => handleDeleteButtonClick(slotProps.data.id)"
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
          v-model:visible="showLocationFormModal"
          modal
          :draggable="false"
          header="Add A Location"
          @hide="() => (editableLocationData = null)"
        >
          <PagesWebManagementLocationsForm
            :location-data="editableLocationData"
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
