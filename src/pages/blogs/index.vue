<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast";
import type { IDataResponse, IDeleteResponse } from "~/app/interfaces/common";
import type { IBlog } from "~/app/interfaces/webManagement";

useHead({
  title: "Blogs | Website Management",
});
definePageMeta({
  name: "blogs",
});

const { $apiClient } = useNuxtApp();
const store = useStore();
const toast = useToast();

const currentPage = ref(0);
const showDeleteConfirmModal = ref<boolean>(false);
const blogSlugToDelete = ref<string | null>(null);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const {
  data: blogs,
  error,
  pending,
  refresh: refreshBlogList,
} = await useAsyncData<IDataResponse<IBlog[]>>("blogs", () =>
  $apiClient(`/admin/blogs`, {
    params: {
      is_latest: true,
    },
  }),
);

const handleEditButtonClick = async (slug: string) => {
  await navigateTo({
    name: "blog-edit",
    params: {
      slug,
    },
  });
};

const handleDeleteButtonClick = (slug: string) => {
  blogSlugToDelete.value = slug;
  showDeleteConfirmModal.value = true;
};
const hideDeleteConfirmModal = () => {
  blogSlugToDelete.value = null;
  showDeleteConfirmModal.value = false;
};

const handleDeleteConfirmation = async () => {
  if (!blogSlugToDelete.value) return;

  try {
    store.loading = true;
    const response = await $apiClient<IDeleteResponse>(
      `admin/blogs/${blogSlugToDelete.value}`,
      {
        method: "DELETE",
      },
    );

    await refreshBlogList();
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

const navigateToBrandCreatePage = async () => {
  await navigateTo({ name: "create-new-blog" });
};
</script>

<template>
  <div>
    <div class="table-container">
      <DataTable
        v-model:filters="filters"
        :value="blogs?.data?.data"
        table-style="min-width: 50rem"
        data-key="id"
        :loading="pending || store.loading"
        :global-filter-fields="['title', 'category', 'tags']"
        striped-rows
        :rows="10"
        paginator
        @page="changePage"
      >
        <template #header>
          <CommonDataTableHeader
            v-model:search-text="filters['global'].value"
            :add-button-label="'Add Blog'"
            :table-header="'Our Blogs'"
            @on-add-button-clicked="navigateToBrandCreatePage"
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
              :src="slotProps.data.image"
              :alt="slotProps.data.title"
            />
          </template>
        </Column>

        <Column field="title" header="Title" style="min-height: 40%" />
        <Column field="sub_title" header="Sub Title" style="min-height: 40%" />
        <Column header="Category">
          <template #body="{ data }">
            <Tag :value="data.category" severity="info" />
          </template>
        </Column>
        <Column header="Tags">
          <template #body="{ data }">
            <Tag
              v-for="tag in data.tags"
              :key="tag"
              class="m-1"
              :value="tag"
              severity="success"
            />
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <button
                class="table-action-button option-action-button"
                @click="handleEditButtonClick(slotProps.data.slug)"
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
