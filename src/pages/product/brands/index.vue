<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";
import { usePrimeVue } from "primevue/config";
import { useToast } from "primevue/usetoast";
import DataTableHeader from "~/components/Common/DataTableHeader.vue";

definePageMeta({
  name: "Product Brands",
});

useHead({
  title: "Product Brands",
});

const currentPage = ref(1);

const $primevue = usePrimeVue();
const toast = useToast();

// const {data: brands, refresh} = await getBrands();

const {
  data: brands,
  pending,
  refresh: refreshAllData,
} = await useFetch(() => `/api/proxy/admin/brands?page=${currentPage.value}`, {
  watch: [currentPage],
});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  "values.name": { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const visibleBrandCreationModal = ref(false);
const visibleBrandEditModal = ref(false);

const statuses = ref([
  { name: "Active", code: "public" },
  { name: "De-active", code: "hidden" },
]);

const formatSize = (bytes: number): string => {
  const k = 1024;
  const dm = 3;
  const sizes = $primevue.config.locale?.fileSizeTypes;

  if (bytes === 0) {
    return `0 ${sizes[0]}`;
  }
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${formattedSize} ${sizes[i]}`;
};

const openBrandCreationModal = () => {
  visibleBrandCreationModal.value = true;
};

const closeBrandCreationModal = () => {
  refreshAllData();
  visibleBrandCreationModal.value = false;
};

// starts edits
const editableBrandProperties = ref({
  slug: "",
  name: "",
  metaDescription: "",
  metaTitle: "",
  visibilityStatus: {},
  image: "",
});
const brandInfo = ref({});

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

export interface BrandData {
  slug: string;
  name: string;
  meta_title: string;
  meta_description: string;
  visibility_status: "public" | "hidden";
  image_url: string;
}
const openEditModal = (brandData: BrandData) => {
  // console.log(brandData, "To GO")
  brandInfo.value = brandData;
  editableBrandProperties.value.slug = brandData.slug;
  editableBrandProperties.value.name = brandData.name;
  editableBrandProperties.value.metaTitle = brandData.meta_title;
  editableBrandProperties.value.metaDescription = brandData.meta_description;
  if (brandData.visibility_status === "public") {
    editableBrandProperties.value.visibilityStatus = {
      name: "Active",
      code: "public",
    };
  } else {
    editableBrandProperties.value.visibilityStatus = {
      name: "De-active",
      code: "hidden",
    };
  }

  editableBrandProperties.value.image = brandData.image_url;

  visibleBrandEditModal.value = true;
};

const removeExistingImage = () => {
  editableBrandProperties.value.image = "";
};

const editABrand = async () => {
  const body = new FormData();
  body.append("name", editableBrandProperties.value.name);
  body.append("meta_title", editableBrandProperties.value.metaTitle);
  body.append(
    "meta_description",
    editableBrandProperties.value.metaDescription,
  );
  body.append(
    "visibility_status",
    editableBrandProperties.value.visibilityStatus?.code,
  );
  if (fileToEditUp.value) {
    body.append("image", fileToEditUp.value, fileToEditUp.value.name);
  }
  body.append("_method", "PUT");

  const { data } = await useFetch(
    `/api/proxy/admin/brands/${editableBrandProperties.value.slug}`,
    {
      method: "POST",
      body,
      onResponse({ response }) {
        // Process the response data
        if (response.status === 200) {
          toast.add({
            severity: "success",
            summary: "Brand Edited",
            detail: `${response._data.message}`,
            life: 3000,
          });
          refreshAllData();
          visibleBrandEditModal.value = false;
          fileToEditUp.value = null;
          brandInfo.value = {};
        }
      },
      onResponseError() {
        console.log("Error");

        // Handle the response errors
      },
    },
  );
};

// end edits!!

const visibleDeleteModal = ref(false);
const brandForDelete = ref<BrandData | {}>({});
const openDeleteModal = (brandData: BrandData) => {
  brandForDelete.value = brandData;
  visibleDeleteModal.value = true;
};
const deleteTheBrand = async () => {
  const { data } = await useFetch(
    `/api/proxy/admin/brands/${brandForDelete.value.slug}`,
    {
      method: "DELETE",
      onResponse({ response }) {
        // Process the response data
        if (response.status === 200) {
          visibleDeleteModal.value = false;
          toast.add({
            severity: "success",
            summary: "Brand Deleted",
            detail: `${response._data.message}`,
            life: 3000,
          });
          brandForDelete.value = {};
        }
      },
      onResponseError() {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: `Could Not delete brand`,
          life: 3000,
        });
        // Handle the response errors
      },
    },
  );
  refreshAllData();
};

const hideDeleteModal = () => {
  visibleDeleteModal.value = false;
};
</script>

<template>
  <div class="table-container">
    <ClientOnly>
      <Toast />
    </ClientOnly>
    <DataTable
      v-model:filters="filters"
      :value="brands?.data"
      :global-filter-fields="['name', 'values.name']"
      table-style="min-width: 50rem"
      :rows="10"
      data-key="id"
      :loading="pending"
      striped-rows
    >
      <template #header>
        <DataTableHeader
          v-model:search-text="filters['global'].value"
          :add-button-label="'Add A Brand'"
          :table-header="'Product Brands'"
          @on-add-button-clicked="openBrandCreationModal"
        />
      </template>

      <Column header="SL">
        <template #body="slotProps">
          <div>
            {{ (currentPage - 1) * 10 + slotProps.index + 1 }}
          </div>
        </template>
      </Column>
      <Column header="Logo">
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

      <!--      <Column field="name" header="Name" />-->
      <Column header="Status">
        <template #body="slotProps">
          {{
            slotProps.data.visibility_status === "public"
              ? "Active"
              : "De-actived"
          }}
        </template>
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <button class="action-button">
              <i
                class="pi pi-file-edit block block-edit"
                title="Edit Brand Information"
                @click="openEditModal(slotProps.data)"
              />
            </button>

            <button class="action-button">
              <i
                class="pi pi-trash block block-delete"
                title="Delete This Brand"
                @click="openDeleteModal(slotProps.data)"
              />
            </button>
          </div>
        </template>
      </Column>

      <template #footer>
        <CommonPagination
          v-model:current-page="currentPage"
          :total-page="brands?.meta.last_page"
        />
      </template>
    </DataTable>
    <ClientOnly>
      <!--      Add Brand Modal -->
      <PagesProductBrandsAddBrandModal
        v-model:visible="visibleBrandCreationModal"
        @close-brand-add-modal="closeBrandCreationModal"
      />
      <!--      Edit Brand Modal -->
      <Dialog
        v-model:visible="visibleBrandEditModal"
        maximizable
        modal
        :header="`Edit Brand - ${brandInfo?.name}`"
        :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        dismissable-mask
        close-on-escape
      >
        <div class="w-full">
          <form
            class="flex flex-col gap-3"
            enctype="multipart/form-data"
            @submit.prevent="editABrand()"
          >
            <div class="flex flex-col gap-1">
              <label for="brandName">Brand Name</label>
              <InputText
                id="brandName"
                v-model="editableBrandProperties.name"
                class="mt-1"
                aria-describedby="text-name"
                placeholder="Enter Brand Name"
                required
                type="text"
              />
            </div>
            <div class="card">
              <div class="flex flex-col gap-1">
                <label for="brandImage">Brand Image</label>
                <FileUpload
                  :file-limit="1"
                  name="brandImage"
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
                    <div v-else-if="editableBrandProperties.image">
                      <div
                        class="card w-full m-0 px-6 flex justify-between border-1 surface-border items-center gap-3"
                      >
                        <div>
                          <img
                            role="presentation"
                            :alt="editableBrandProperties.name"
                            :src="editableBrandProperties.image"
                            width="100"
                            height="50"
                          />
                        </div>
                        <span class="font-semibold">{{ brandInfo?.name }}</span>
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
                      v-if="!editableBrandProperties.image"
                      class="flex items-center justify-center flex-col"
                    >
                      <i
                        class="pi pi-cloud-upload border-2 rounded-full p-5 text-3xl text-400 border-400"
                      />
                      <p class="mt-4 mb-0">
                        Drag and drop Brand Logo to here to upload.
                      </p>
                    </div>
                  </template>
                </FileUpload>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mt-1">
              <div class="flex flex-col gap-1">
                <label for="meta-title">Brand Meta Title</label>
                <InputText
                  id="meta-title"
                  v-model="editableBrandProperties.metaTitle"
                  aria-describedby="text-meta-title"
                  placeholder="Enter Meta-title of the brand"
                  required
                  type="text"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label for="status-dropdown">Brand Visibility Status</label>
                <Dropdown
                  id="status-dropdown"
                  v-model="editableBrandProperties.visibilityStatus"
                  :options="statuses"
                  option-label="name"
                  placeholder="Select a Status"
                  checkmark
                  :highlight-on-select="false"
                />
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <label for="meta-desc">Brand Meta Description</label>
              <Textarea
                id="meta-desc"
                v-model="editableBrandProperties.metaDescription"
                aria-describedby="text-meta-description"
                auto-resize
                placeholder="Enter Meta Description"
                required
                rows="3"
              />
            </div>
            <Button
              class="button-style edit-brand-button"
              :disabled="
                brandInfo.name === editableBrandProperties.name &&
                brandInfo.meta_title === editableBrandProperties.metaTitle &&
                brandInfo.meta_description ===
                  editableBrandProperties.metaDescription &&
                brandInfo.visibility_status ===
                  editableBrandProperties.visibilityStatus.code &&
                (brandInfo.image_url === editableBrandProperties.image ||
                  !fileToEditUp)
              "
              label="Edit Brand"
              type="submit"
            />
          </form>
        </div>
      </Dialog>

      <!--      delete modal -->
      <Dialog
        v-model:visible="visibleDeleteModal"
        class="delete-brand-modal"
        close-on-escape
        modal
      >
        <template #container>
          <div class="modal-items">
            <p class="modal-text font-heading-7 font-semibold text-center">
              Are sou sure, <br />
              you want to Delete Brand - {{ brandForDelete?.name }}?
            </p>

            <div class="flex justify-center items-center gap-3">
              <Button
                class="modal-button cancel font-heading-7 font-semibold"
                @click="hideDeleteModal"
              >
                Cancel
              </Button>
              <Button
                class="modal-button delete-brand font-heading-7 font-semibold"
                @click="deleteTheBrand"
              >
                Delete
              </Button>
            </div>
          </div>
        </template>
      </Dialog>
    </ClientOnly>
  </div>
</template>

<style scoped lang="postcss">
.table-container {
  @apply bg-white rounded-xl  py-6;

  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;

  color: var(--dark-gray-80);

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

.edit-brand-button,
.add-brand-button {
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

.delete-brand {
  color: var(--primary-color-white);
  background-color: var(--color-danger);
}
</style>
