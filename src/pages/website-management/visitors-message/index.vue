<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import type { IDataResponse } from "~/app/interfaces/common";
import type { IVisitorMessage } from "~/app/interfaces/webManagement";

useHead({
  title: "Visitor's Message | Website Management",
});
definePageMeta({
  name: "visitors-message",
});

const { $apiClient } = useNuxtApp();
const store = useStore();

const currentPage = ref(0);
const showMessageFormModal = ref<boolean>(false);
const editableMessageData = ref<IVisitorMessage | null>(null);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const {
  data: messages,
  error,
  pending,
  refresh,
} = await useAsyncData<IDataResponse<IVisitorMessage[]>>("messages", () =>
  $apiClient(`/admin/visitors-message`),
);

const handleEditButtonClick = (message: IVisitorMessage) => {
  editableMessageData.value = message;
  showMessageFormModal.value = true;
};

const handleFormSubmit = () => {
  showMessageFormModal.value = false;
  editableMessageData.value = null;
  refresh();
};

const getSeverity = (status: string) => {
  switch (status) {
    case "Contacted":
      return "success";

    case "Pending":
      return "warning";
  }
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
        :value="messages?.data"
        table-style="min-width: 50rem"
        data-key="id"
        :loading="pending || store.loading"
        :global-filter-fields="[
          'name',
          'phone',
          'email',
          'message',
          'type',
          'status',
          'contact_note',
        ]"
        striped-rows
        :rows="10"
        paginator
        @page="changePage"
      >
        <template #header>
          <CommonDataTableHeader
            v-model:search-text="filters['global'].value"
            :table-header="'Visitors messages'"
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
        <Column field="name" header="Visitor's Name" />
        <Column field="email" header="Email" />
        <Column field="phone" header="Phone Number" />
        <Column
          field="message"
          header="Visitor's Message"
          style="max-width: 12vw"
        />
        <Column header="Contact Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="getSeverity(data.status)" />
          </template>
        </Column>
        <Column field="contact_note" header="Contact Note" />

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
          v-model:visible="showMessageFormModal"
          modal
          :draggable="false"
          header="Update Visitor's Message Status"
          @hide="() => (editableMessageData = null)"
        >
          <PagesWebManagementVisitorsMessageForm
            :message-data="editableMessageData"
            @on-form-submit="handleFormSubmit"
          />
        </Dialog>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped></style>
