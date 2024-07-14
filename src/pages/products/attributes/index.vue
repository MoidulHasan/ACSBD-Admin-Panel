<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import type { IProductAttribute } from "~/app/interfaces/products";

useHead({
  title: "Attributes | Product",
});

definePageMeta({
  name: "product-attributes",
});

const store = useStore();
const attributeStore = useAttributeStore();
const toast = useToast();

const showAttributeFormModal = ref(false);
const showDeleteConfirmationModal = ref(false);
const deletableAttributeSlug = ref<null | string>(null);
const editableAttributeData = ref<null | IProductAttribute>(null);

const { pending, error } = await useAsyncData<IProductAttribute[]>(
  "attributes-data",
  () => attributeStore.fetchAttributes(),
);

if (error.value) {
  throw createError(error.value);
}

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  "values.name": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const handleFormSubmit = async () => {
  showAttributeFormModal.value = false;
  editableAttributeData.value = null;
};

const handleEditButtonClick = (attributeData: IProductAttribute) => {
  editableAttributeData.value = attributeData;
  showAttributeFormModal.value = true;
};

const handleDeleteButtonClick = (slug: string) => {
  showDeleteConfirmationModal.value = true;
  deletableAttributeSlug.value = slug;
};

const hideDeleteConfirmationModal = () => {
  showDeleteConfirmationModal.value = false;
  deletableAttributeSlug.value = null;
};

const handleDeleteConfirmation = async () => {
  if (!deletableAttributeSlug.value) return;

  try {
    store.loading = true;
    const response = await attributeStore.deleteAttributeBySlug(
      deletableAttributeSlug.value,
    );
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

  hideDeleteConfirmationModal();
};
</script>

<template>
  <div>
    <div class="table-container">
      <DataTable
        v-model:filters="filters"
        :value="attributeStore.attributes"
        table-style="min-width: 50rem"
        data-key="id"
        :loading="pending || store.loading"
        :global-filter-fields="['name', 'values.name']"
        striped-rows
        :rows="10"
        paginator
      >
        <template #header>
          <CommonDataTableHeader
            v-model:search-text="filters['global'].value"
            :add-button-label="'Add Attributes'"
            :table-header="'Product Attributes'"
            @on-add-button-clicked="showAttributeFormModal = true"
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

        <Column field="name" header="Name" />

        <Column field="values" header="Values">
          <template #body="slotProps">
            <ul class="flex gap-2 flex-wrap">
              <li
                v-for="item in slotProps.data.values"
                :key="item.name"
                class="border-2 px-2 rounded"
              >
                {{ item.name }}
              </li>
            </ul>
          </template>
        </Column>

        <Column header="Actions">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <button
                class="table-action-button"
                @click="() => handleEditButtonClick(slotProps.data)"
              >
                <i class="pi pi-file-edit" />
              </button>

              <button
                class="table-action-button"
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
    </div>

    <client-only>
      <Dialog
        v-model:visible="showAttributeFormModal"
        modal
        :draggable="false"
        header="Add Attribute"
        @hide="() => (editableAttributeData = null)"
      >
        <PagesProductsAttributesForm
          :attribute-data="editableAttributeData"
          @on-form-submit="handleFormSubmit"
        />
      </Dialog>

      <CommonDeleteConfirmationModal
        v-model:visible="showDeleteConfirmationModal"
        :disabled="store.loading"
        @on-confirm="handleDeleteConfirmation"
        @on-cancel="hideDeleteConfirmationModal"
      />
    </client-only>
  </div>
</template>
