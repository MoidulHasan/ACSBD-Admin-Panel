<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "primevue/api";
import type {
  CategoryData,
  MinifiedCategory,
  EditableCategoryProperties,
} from "~/pages/product/categories/index.vue";
import { formatSize } from "#imports";

const toast = useToast();
const expandedRows = ref({});
const store = useStore();
const { $apiClient } = useNuxtApp();

const props = defineProps<{
  categories: any;
}>();

const emit = defineEmits<{
  (e: "refreshAllCategory"): void;
}>();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  "values.name": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

// const visibleCategoryCreationModal = ref(false);

const visibleCategoryEditModal = ref(false);

const statuses = ref([
  { name: "Active", code: "public" },
  { name: "De-active", code: "hidden" },
]);

// starts edits
const editableCategoryProperties = ref<EditableCategoryProperties>({
  slug: "",
  name: "",
  metaDescription: "",
  metaTitle: "",
  visibilityStatus: { name: "Active", code: "public" },
  image: "",
  parentId: { id: 0, name: "None", parent_id: null },
});
const categoryInfo = ref({});

const filesForEdit = ref([]);
const onRemoveTemplatingFileEdit = (removeFileCallback: any, index: number) => {
  removeFileCallback(index);
};
const fileToEditUp = ref<File | null>(null);
const onSelectedFilesforEdit = (event: any) => {
  const [_file] = event.files;
  // console.log(_file, "EDIT SELECT");
  fileToEditUp.value = _file;
  filesForEdit.value = event.files;
};

const refreshAllData = () => {
  emit("refreshAllCategory");
};

const getParentInfo = (parentId: number) => {
  return (
    store.productCategories.find(
      (cat: MinifiedCategory) => cat.id === parentId,
    ) ?? {
      id: null,
      name: "None",
      parent_id: 0,
    }
  );
};

const openEditModal = (categoryData: CategoryData) => {
  // console.log(categoryData, "To GO")
  categoryInfo.value = categoryData;
  editableCategoryProperties.value.slug = categoryData.slug;
  editableCategoryProperties.value.name = categoryData.name;
  editableCategoryProperties.value.metaTitle = categoryData.meta_title;
  editableCategoryProperties.value.parentId = getParentInfo(
    categoryData.parent_id,
  );
  editableCategoryProperties.value.metaDescription =
    categoryData.meta_description;
  editableCategoryProperties.value.visibilityStatus =
    categoryData.visibility_status === "public"
      ? {
          name: "Active",
          code: "public",
        }
      : {
          name: "De-active",
          code: "hidden",
        };
  editableCategoryProperties.value.image = categoryData.image_url;
  visibleCategoryEditModal.value = true;
};

const removeExistingImage = () => {
  editableCategoryProperties.value.image = "";
};

const editACategory = async () => {
  const body = new FormData();
  body.append("name", editableCategoryProperties.value.name);
  body.append("meta_title", editableCategoryProperties.value.metaTitle);
  body.append(
    "meta_description",
    editableCategoryProperties.value.metaDescription,
  );
  body.append(
    "visibility_status",
    editableCategoryProperties.value.visibilityStatus.code,
  );
  body.append("parent_id", editableCategoryProperties.value.parentId.id);
  if (fileToEditUp.value) {
    body.append("image", fileToEditUp.value, fileToEditUp.value.name);
  }
  body.append("_method", "PUT");

  const { data } = await useFetch(
    `/api/proxy/admin/categories/${editableCategoryProperties.value.slug}`,
    {
      method: "POST",
      body,
      onResponse({ response }) {
        // Process the response data
        if (response.status === 200) {
          toast.add({
            severity: "success",
            summary: "Category Edited",
            detail: `${response._data.message}`,
            life: 3000,
          });
          refreshAllData();
          visibleCategoryEditModal.value = false;
          fileToEditUp.value = null;
          categoryInfo.value = {};
        }
      },
      onResponseError({ response }) {
        console.log("Error");
        toast.add({
          severity: "error",
          summary: "Could not edit category.",
          detail: `${response._data.message}`,
          life: 3000,
        });

        // Handle the response errors
      },
    },
  );
};

// end edits!!
const getParentName = (id: string | number | null) => {
  if (!id) {
    return "None";
  }

  return store.productCategories.find((cat: MinifiedCategory) => cat.id === id)
    ?.name;
};

const showDeleteConfirmationModal = ref(false);
const categorySlugToDelete = ref<null | string>(null);
const handleDeleteButtonClick = (slug: string) => {
  showDeleteConfirmationModal.value = true;
  categorySlugToDelete.value = slug;
};
const hideDeleteConfirmationModal = () => {
  showDeleteConfirmationModal.value = false;
  categorySlugToDelete.value = null;
};
const handleDeleteConfirmation = async () => {
  try {
    store.loading = true;
    const response = await $apiClient(
      `/admin/categories/${categorySlugToDelete.value}`,
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
    await refreshAllData();
  } catch (error) {
    store.loading = false;

    toast.add({
      severity: "error",
      summary: "Request Failed",
      detail: error.statusMessage,
      life: 3000,
    });
  }
};
</script>

<template>
  <div class="category-table">
    <DataTable
      v-model:expandedRows="expandedRows"
      v-model:filters="filters"
      :value="categories"
      :global-filter-fields="['name', 'values.name']"
      table-style="min-width: 50rem"
      data-key="id"
      striped-rows
    >
      <Column expander style="width: 2rem" />
      <Column header="SL">
        <template #body="slotProps">
          <div>
            {{ slotProps.index + 1 }}
          </div>
        </template>
      </Column>
      <Column header="Image">
        <template #body="slotProps">
          <img
            class="h-12 w-44"
            :src="slotProps.data.image_url"
            :alt="slotProps.data.name"
          />
        </template>
      </Column>
      <Column header="Name" style="min-width: 40%">
        <template #body="slotProps">
          {{ slotProps.data.name }}
        </template>
      </Column>
      <Column header="Status">
        <template #body="slotProps">
          {{
            slotProps.data.visibility_status === "public"
              ? "Active"
              : "De-actived"
          }}
        </template>
      </Column>
      <Column header="Parent">
        <template #body="slotProps">
          {{ getParentName(slotProps.data.parent_id) }}
        </template>
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <button class="action-button">
              <i
                class="pi pi-file-edit block block-edit"
                title="Edit Category Information"
                @click="openEditModal(slotProps.data)"
              />
            </button>

            <button class="action-button">
              <i
                class="pi pi-trash block block-delete"
                title="Delete This Category"
                @click="() => handleDeleteButtonClick(slotProps.data.slug)"
              />
            </button>
          </div>
        </template>
      </Column>
      <template #expansion="slotProps">
        <div v-if="slotProps.data.childrens.length" class="pb-3">
          <h5 class="pb-2">Children of {{ slotProps.data.name }}</h5>
          <PagesProductsCategoriesListingTable
            :categories="slotProps.data.childrens"
            @refresh-all-category="refreshAllData"
          />
        </div>
        <h3 v-else>No Children found for {{ slotProps.data.name }}</h3>
      </template>
    </DataTable>
    <ClientOnly>
      <Dialog
        v-model:visible="visibleCategoryEditModal"
        maximizable
        modal
        :header="`Edit Category - ${(categoryInfo as CategoryData).name}`"
        :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        dismissable-mask
        close-on-escape
      >
        <div class="w-full">
          <form
            class="flex flex-col gap-3"
            enctype="multipart/form-data"
            @submit.prevent="editACategory()"
          >
            <div class="flex flex-col gap-1">
              <label for="categoryName">Category Name</label>
              <InputText
                id="categoryName"
                v-model="editableCategoryProperties.name"
                class="mt-1"
                aria-describedby="text-name"
                placeholder="Enter Category Name"
                required
                type="text"
              />
            </div>
            <div class="card">
              <div class="flex flex-col gap-1">
                <label for="categoryImage">Category Image</label>
                <FileUpload
                  :file-limit="1"
                  name="categoryImage"
                  url="/api/upload"
                  accept="image/*"
                  :max-file-size="1000000"
                  required
                  @select="onSelectedFilesforEdit"
                >
                  <template #header="{ chooseCallback, clearCallback, files }">
                    <div
                      class="flex flex-wrap justify-between items-center flex-1 gap-2"
                    >
                      <div class="flex gap-2">
                        <Button
                          icon="pi pi-images"
                          rounded
                          outlined
                          @click="chooseCallback()"
                        ></Button>
                        <Button
                          icon="pi pi-times"
                          rounded
                          outlined
                          severity="danger"
                          :disabled="!files || files.length === 0"
                          @click="clearCallback()"
                        ></Button>
                      </div>
                    </div>
                  </template>
                  <template #content="{ files, removeFileCallback }">
                    <div v-if="files.length > 0">
                      <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                        <div
                          v-for="(file, index) of files"
                          :key="file.name + file.type + file.size"
                          class="card w-full m-0 px-6 flex justify-between border-1 surface-border items-center gap-3"
                        >
                          <div>
                            <img
                              role="presentation"
                              :alt="file.name"
                              :src="file.objectURL"
                              width="100"
                              height="50"
                            />
                          </div>
                          <span class="font-semibold">{{ file.name }}</span>
                          <div>{{ formatSize(file.size) }}</div>
                          <Button
                            icon="pi pi-times"
                            outlined
                            rounded
                            severity="danger"
                            @click="
                              onRemoveTemplatingFileEdit(
                                removeFileCallback,
                                index,
                              )
                            "
                          />
                        </div>
                      </div>
                    </div>
                    <div v-else-if="editableCategoryProperties.image">
                      <div
                        class="card w-full m-0 px-6 flex justify-between border-1 surface-border items-center gap-3"
                      >
                        <div>
                          <img
                            role="presentation"
                            :alt="editableCategoryProperties.name"
                            :src="editableCategoryProperties.image"
                            width="100"
                            height="50"
                          />
                        </div>
                        <span class="font-semibold">{{
                          (categoryInfo as CategoryData).name
                        }}</span>
                        <Button
                          icon="pi pi-times"
                          outlined
                          rounded
                          severity="danger"
                          @click="removeExistingImage"
                        />
                      </div>
                    </div>
                  </template>
                  <template #empty>
                    <div
                      v-if="!editableCategoryProperties.image"
                      class="flex items-center justify-center flex-col"
                    >
                      <i
                        class="pi pi-cloud-upload border-2 rounded-full p-5 text-3xl text-400 border-400"
                      />
                      <p class="mt-4 mb-0">
                        Drag and drop Category Picture to here to upload.
                      </p>
                    </div>
                  </template>
                </FileUpload>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mt-1">
              <div class="flex flex-col gap-1">
                <label for="meta-title">Category Meta Title</label>
                <InputText
                  id="meta-title"
                  v-model="editableCategoryProperties.metaTitle"
                  aria-describedby="text-meta-title"
                  placeholder="Enter Meta-title of the Category"
                  required
                  type="text"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label for="status-dropdown">Category Visibility Status</label>
                <Dropdown
                  id="status-dropdown"
                  v-model="editableCategoryProperties.visibilityStatus"
                  :options="statuses"
                  option-label="name"
                  placeholder="Select a Status"
                  checkmark
                  :highlight-on-select="false"
                />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <label for="parent">Parent Category</label>
              <Dropdown
                id="parent"
                v-model="editableCategoryProperties.parentId"
                :options="[
                  { id: null, name: 'None', parent_id: 0 },
                  ...store.productCategories,
                ]"
                filter
                option-label="name"
                placeholder="Select Parent Category"
                class="w-full md:w-14rem"
              >
                <template #value="slotProps">
                  <div v-if="slotProps.value" class="flex align-items-center">
                    <div>{{ slotProps.value.name }}</div>
                  </div>
                  <span v-else>
                    {{ slotProps.placeholder }}
                  </span>
                </template>
                <template #option="slotProps">
                  <div class="flex align-items-center">
                    <div>{{ slotProps.option.name }}</div>
                  </div>
                </template>
              </Dropdown>
            </div>
            <div class="flex flex-col gap-1">
              <label for="meta-desc">Category Meta Description</label>
              <Textarea
                id="meta-desc"
                v-model="editableCategoryProperties.metaDescription"
                aria-describedby="text-meta-description"
                auto-resize
                placeholder="Enter Meta Description"
                required
                rows="3"
              />
            </div>
            <Button
              class="button-style edit-category-button"
              :disabled="
                (categoryInfo as CategoryData).name ===
                  editableCategoryProperties.name &&
                (categoryInfo as CategoryData).meta_title ===
                  editableCategoryProperties.metaTitle &&
                (categoryInfo as CategoryData).meta_description ===
                  editableCategoryProperties.metaDescription &&
                (categoryInfo as CategoryData).visibility_status ===
                  editableCategoryProperties.visibilityStatus.code &&
                (categoryInfo as CategoryData).parent_id ===
                  editableCategoryProperties.parentId.id &&
                ((categoryInfo as CategoryData).image_url ===
                  editableCategoryProperties.image ||
                  !fileToEditUp)
              "
              label="Edit Category"
              type="submit"
            />
          </form>
        </div>
      </Dialog>

      <!--      delete modal -->
      <CommonDeleteConfirmationModal
        v-model:visible="showDeleteConfirmationModal"
        :disabled="store.loading"
        @on-confirm="handleDeleteConfirmation"
        @on-cancel="hideDeleteConfirmationModal"
      />
    </ClientOnly>
  </div>
</template>

<style scoped>
.category-table {
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

  .action-button {
    width: 24px;
    height: 24px;

    &:hover {
      color: var(--primary-color-navy-blue);
    }
  }
}

.edit-category-button,
.add-category-button {
  background-color: var(--primary-color-envitect-sam-blue);
}
.block-edit,
.block-delete {
  transition: 0.5s;
}
.block-edit:hover,
.block-delete:hover {
  transform: scale(1.05);
  color: var(--primary-color-envitect-sam-blue);
}
.block-delete:hover {
  color: var(--color-danger);
}

.modal-items {
  background-color: #fff;
  border-radius: 6px;
  padding: 61px 63px;
  @include media-query(sm) {
    padding: 61px 20px;
    border-radius: 12px;
  }
}

.modal-text {
  color: var(--navy-blue-80);
  margin-bottom: 40px;
}

.modal-button {
  display: inline-flex;
  padding: 12px 40px;
  justify-content: center;
  align-items: center;
  gap: 12px;
  border-radius: 6px;
}

.cancel {
  background-color: var(--envitect-sam-blue-5);
  color: var(--primary-color-envitect-sam-blue);
}

.delete-category {
  color: var(--primary-color-white);
  background-color: var(--color-danger);
}
</style>
