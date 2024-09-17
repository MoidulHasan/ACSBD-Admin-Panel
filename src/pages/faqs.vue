<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast";
import type {
  IDataResponse,
  IDeleteResponse,
  IFAQ,
} from "~/app/interfaces/common";
import { getSeverity } from "~/utils/getVisibilitySeverity";

useHead({
  title: "F.A.Q.s ",
});
definePageMeta({
  name: "faqs",
});

const { $apiClient } = useNuxtApp();
const store = useStore();
const toast = useToast();

const currentPage = ref(0);
const showFaqModal = ref<boolean>(false);
const showDeleteConfirmModal = ref<boolean>(false);
const editableFaqData = ref<IFAQ | null>(null);
const faqIdToDelete = ref<number | null>(null);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const {
  data: faqs,
  error,
  pending,
  refresh,
} = await useAsyncData<IDataResponse<IFAQ[]>>("faqs", () =>
  $apiClient(`/admin/faqs`),
);

const handleEditButtonClick = (faq: IFAQ) => {
  editableFaqData.value = faq;
  showFaqModal.value = true;
};

const handleFormSubmit = () => {
  showFaqModal.value = false;
  editableFaqData.value = null;
  refresh();
};

const handleDeleteButtonClick = (slug: number) => {
  faqIdToDelete.value = slug;
  showDeleteConfirmModal.value = true;
};
const hideDeleteConfirmModal = () => {
  faqIdToDelete.value = null;
  showDeleteConfirmModal.value = false;
};

const handleDeleteConfirmation = async () => {
  if (!faqIdToDelete.value) return;

  try {
    store.loading = true;
    const response = await $apiClient<IDeleteResponse>(
      `admin/faqs/${faqIdToDelete.value}`,
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

const makeFirstLetterOfAWord = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// const getCategorySeverity = (str: string) => {
//   switch (str) {
//     case "service":
//       return "success";
//
//     case "ac_rent":
//       return "warning";
//
//     case "product":
//       return "contrast";
//
//     case "policy":
//       return "info";
//   }
// };
</script>

<template>
  <div>
    <div class="table-container">
      <DataTable
        v-model:filters="filters"
        :value="faqs?.data"
        table-style="min-width: 50rem"
        data-key="id"
        :loading="pending || store.loading"
        :global-filter-fields="['question', 'category']"
        striped-rows
        :rows="10"
        paginator
        @page="changePage"
      >
        <template #header>
          <CommonDataTableHeader
            v-model:search-text="filters['global'].value"
            :add-button-label="'Add FAQ'"
            :table-header="'Website FAQS'"
            @on-add-button-clicked="showFaqModal = true"
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

        <Column field="question" header="Question" style="min-height: 20%" />
        <Column field="answer" header="Answer" style="min-height: 20%" />
        <Column header="Category">
          <template #body="{ data }">
            <Tag
              :value="makeFirstLetterOfAWord(data.category)"
              severity="success"
            />
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <Tag
              :value="data.status === true ? 'Public' : 'Hidden'"
              :severity="getSeverity(data.status)"
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
          v-model:visible="showFaqModal"
          modal
          :draggable="false"
          header="Add a FAQ"
          @hide="() => (editableFaqData = null)"
        >
          <PagesWebManagementFaqForm
            :faq-data="editableFaqData"
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
