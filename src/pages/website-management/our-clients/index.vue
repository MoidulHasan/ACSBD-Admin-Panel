<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast";
import type { IDataResponse, IDeleteResponse } from "~/app/interfaces/common";
import type { IClient } from "~/app/interfaces/webManagement";

useHead({
  title: "Our Clients | Website Management",
});
definePageMeta({
  name: "our-clients",
});

const { $apiClient } = useNuxtApp();
const store = useStore();
const toast = useToast();

const currentPage = ref(0);
const showClientFormModal = ref<boolean>(false);
const showDeleteConfirmModal = ref<boolean>(false);
const editableClientData = ref<IClient | null>(null);
const clientIdToDelete = ref<number | null>(null);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const {
  data: clients,
  error,
  pending,
  refresh,
} = await useAsyncData<IDataResponse<IClient[]>>("clients", () =>
  $apiClient(`/our-clients`),
);

const handleEditButtonClick = (client: IClient) => {
  editableClientData.value = client;
  showClientFormModal.value = true;
};

const handleFormSubmit = () => {
  showClientFormModal.value = false;
  editableClientData.value = null;
  refresh();
};

const handleDeleteButtonClick = (id: number) => {
  clientIdToDelete.value = id;
  showDeleteConfirmModal.value = true;
};
const hideDeleteConfirmModal = () => {
  clientIdToDelete.value = null;
  showDeleteConfirmModal.value = false;
};

const handleDeleteConfirmation = async () => {
  if (!clientIdToDelete.value) return;

  try {
    store.loading = true;
    const response = await $apiClient<IDeleteResponse>(
      `admin/our-clients/${clientIdToDelete.value}`,
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
        :value="clients?.data"
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
            :add-button-label="'Add Client'"
            :table-header="'Our Clients'"
            @on-add-button-clicked="showClientFormModal = true"
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
        <Column header="Client Image">
          <template #body="slotProps">
            <img
              class="client-image h-12 w-44"
              :src="slotProps.data.image"
              :alt="slotProps.data.title"
            />
          </template>
        </Column>

        <Column field="name" header="Name" />

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
          v-model:visible="showClientFormModal"
          modal
          :draggable="false"
          header="Add A Client"
          @hide="() => (editableClientData = null)"
        >
          <PagesWebManagementClientsForm
            :client-data="editableClientData"
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
