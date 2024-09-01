<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast";
import type { IDataResponse, IDeleteResponse } from "~/app/interfaces/common";
import type { IBrand } from "~/app/interfaces/products";
import { getSeverity } from "~/utils/getVisibilitySeverity";

useHead({
  title: "Recent Works by ACSBD",
});
definePageMeta({
  name: "recent-works",
});

const { $apiClient } = useNuxtApp();
const store = useStore();
const toast = useToast();

const currentPage = ref(0);
const showDeleteConfirmModal = ref<boolean>(false);
const workIdToDelete = ref<number | null>(null);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const {
  data: recentWorks,
  error,
  pending,
  refresh,
} = await useAsyncData<IDataResponse<IBrand[]>>("recent-works", () =>
  $apiClient(`/admin/works`),
);

const redirectToCreateWorkPage = async () => {
  await navigateTo({ name: "create-new-work" });
};

const handleEditButtonClick = async (id: number) => {
  await navigateTo({
    name: "create-new-work",
    params: {
      id,
    },
  });
};

const handleDeleteButtonClick = (id: number) => {
  workIdToDelete.value = id;
  showDeleteConfirmModal.value = true;
};
const hideDeleteConfirmModal = () => {
  workIdToDelete.value = null;
  showDeleteConfirmModal.value = false;
};

const handleDeleteConfirmation = async () => {
  if (!workIdToDelete.value) return;

  try {
    store.loading = true;
    const response = await $apiClient<IDeleteResponse>(
      `admin/works/${workIdToDelete.value}`,
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

const upperCaseFirstLetter = (word: string) => {
  return word[0].toUpperCase() + word.substring(1);
};
</script>

<template>
  <div>
    <div class="table-container">
      <DataTable
        v-model:filters="filters"
        :value="recentWorks?.data?.data"
        table-style="min-width: 50rem"
        data-key="id"
        :loading="pending || store.loading"
        :global-filter-fields="['title', 'client', 'type']"
        striped-rows
        :rows="10"
        paginator
        @page="changePage"
      >
        <template #header>
          <CommonDataTableHeader
            v-model:search-text="filters['global'].value"
            :add-button-label="'Add Work History'"
            :table-header="'Our Recent Works'"
            @on-add-button-clicked="redirectToCreateWorkPage"
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
        <Column header="Work Image">
          <template #body="slotProps">
            <img
              class="work-image h-12 w-44"
              :src="slotProps.data.image"
              :alt="slotProps.data.title"
            />
          </template>
        </Column>

        <Column field="title" header="Title" style="min-height: 40%" />
        <Column field="title" header="Title" />
        <Column field="client" header="Client" />
        <Column header="Type">
          <template #body="{ data }">
            <Tag :value="upperCaseFirstLetter(data.type)" severity="success" />
          </template>
        </Column>
        <Column field="from_date" header="Project Start Date" />
        <Column header="Visibility Status">
          <template #body="{ data }">
            <Tag
              :value="data.status === true ? 'Public' : 'Hidden'"
              :severity="getSeverity(data.visibility_status)"
            />
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <button
                class="table-action-button option-action-button"
                @click="() => handleEditButtonClick(slotProps.data.id)"
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
