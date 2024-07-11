<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast";
import type { IDataResponse, IDeleteResponse } from "~/app/interfaces/common";
import type { ITestimonial } from "~/app/interfaces/feedbacks";
import { getSeverity } from "~/utils/getVisibilitySeverity";
const { $apiClient } = useNuxtApp();
useHead({
  title: "Testimonials | Feedbacks",
});

definePageMeta({
  name: "feedbacks-testimonials",
});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const {
  data: testimonials,
  error,
  pending,
  refresh,
} = await useAsyncData<IDataResponse<ITestimonial[]>>("testimonials", () =>
  $apiClient(`/admin/testimonials`),
);

const store = useStore();
const toast = useToast();
const currentPage = ref(0);
const showTestimonialFormModal = ref<boolean>(false);
const showDeleteConfirmModal = ref<boolean>(false);
const editableTestimonial = ref<ITestimonial | null>(null);
const testimonialIdToDelete = ref<number | null>(null);

const handleEditButtonClick = (testimonial: ITestimonial) => {
  editableTestimonial.value = testimonial;
  showTestimonialFormModal.value = true;
};

const handleFormSubmit = () => {
  showTestimonialFormModal.value = false;
  editableTestimonial.value = null;
  refresh();
};

const handleDeleteButtonClick = (id: number) => {
  testimonialIdToDelete.value = id;
  showDeleteConfirmModal.value = true;
};
const hideDeleteConfirmModal = () => {
  testimonialIdToDelete.value = null;
  showDeleteConfirmModal.value = false;
};

const handleDeleteConfirmation = async () => {
  if (!testimonialIdToDelete.value) return;

  try {
    store.loading = true;
    const response = await $apiClient<IDeleteResponse>(
      `admin/testimonials/${testimonialIdToDelete.value}`,
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
        :value="testimonials?.data"
        table-style="min-width: 50rem"
        data-key="id"
        :loading="pending || store.loading"
        :global-filter-fields="[
          'reviewer_name',
          'reviewer_title',
          'review',
          'visibility_status',
        ]"
        striped-rows
        :rows="10"
        paginator
        @page="changePage"
      >
        <template #header>
          <CommonDataTableHeader
            v-model:search-text="filters['global'].value"
            :add-button-label="'Add Testimonial'"
            :table-header="'Customer Testimonial'"
            @on-add-button-clicked="showTestimonialFormModal = true"
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
        <Column header="Reviewer Image">
          <template #body="slotProps">
            <img
              class="reviewer-image"
              :src="slotProps.data.reviewer_image"
              :alt="slotProps.data.reviewer_title"
            />
          </template>
        </Column>

        <Column field="reviewer_name" header="Reviewer Name" />
        <Column field="reviewer_title" header="Reviewer Title" />
        <Column field="review" header="Review" style="max-width: 20vw" />
        <Column header="Visibility Status">
          <template #body="{ data }">
            <Tag
              :value="data.visibility_status === 'public' ? 'Public' : 'Hidden'"
              :severity="getSeverity(data.visibility_status)"
            />
          </template>
        </Column>
        <Column header="Review Stars">
          <template #body="{ data }">
            <Rating v-model="data.star" readonly :cancel="false" />
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
          v-model:visible="showTestimonialFormModal"
          modal
          :draggable="false"
          header="Add A Collection"
          @hide="() => (editableTestimonial = null)"
        >
          <PagesFeedbacksTestimonialsForm
            :testimonial-data="editableTestimonial"
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

<style scoped>
.reviewer-image {
  height: 5rem;
  width: 5rem;
  border-radius: 50%;
}

:deep(.p-rating-icon) {
  color: var(--color-orange);
}
</style>
