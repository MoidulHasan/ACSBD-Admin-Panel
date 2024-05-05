<script setup lang="ts">
import {getBrands} from "~/app/api/getBrands";
import {FilterMatchMode} from "primevue/api";
import { usePrimeVue } from 'primevue/config';
import { useToast } from "primevue/usetoast";

definePageMeta({
  name: "brands",
});

const $primevue = usePrimeVue();
const toast = useToast();
const runtimeConfig = useRuntimeConfig();

const {data: brands, refresh} = await getBrands();

const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS},
  name: {value: null, matchMode: FilterMatchMode.STARTS_WITH}
});

const visibleBrandCreationModal = ref(false);
const visibleBrandEditModal = ref(false);

const statuses = ref([
  { name: 'Active', code: 'public' },
  { name: 'De-active', code: 'hidden' },
]);

const formatSize = (bytes) => {
  const k = 1024;
  const dm = 3;
  const sizes = $primevue.config.locale.fileSizeTypes;

  if (bytes === 0) {
    return `0 ${sizes[0]}`;
  }
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${formattedSize} ${sizes[i]}`;
};

const openBrandCreationModal = () => {
  visibleBrandCreationModal.value = true;
}

const closeBrandCreationModal = () => {
  refresh();
  visibleBrandCreationModal.value = false;
}

//starts edits
const editableBrandProperties = ref({
  name: '',
  metaDescription: '',
  metaTitle: '',
  visibilityStatus: {},
  image: ''
})
const brandInfo = ref({});

const filesForEdit = ref([]);
const onRemoveTemplatingFileEdit = (file, removeFileCallback, index) => {
  removeFileCallback(index);
};
const fileToEditUp = ref<File|null>(null);
const onSelectedFilesforEdit = (event) => {
  const [_file] = event.files;
  console.log(_file, "EDIT SELECT")
  fileToEditUp.value = _file;
  filesForEdit.value = event.files;
};

const openEditModal = (brandData) => {
  brandInfo.value = brandData;
  editableBrandProperties.value.name = brandData.name;
  editableBrandProperties.value.metaTitle = brandData.meta_title;
  editableBrandProperties.value.metaDescription = brandData.meta_description;
  if(brandData.visibility_status === 'public') {
    editableBrandProperties.value.visibilityStatus = { name: 'Active', code: 'public' };
  } else {
    editableBrandProperties.value.visibilityStatus = { name: 'De-active', code: 'hidden' };
  }

  editableBrandProperties.value.image = brandData.image_url;

  visibleBrandEditModal.value = true;
}

const removeExistingImage = () => {
  editableBrandProperties.value.image = '';
}

const editABrand = async (event) => {
  const body = new FormData();
  body.append('name', editableBrandProperties.value.name);
  body.append('meta_title', editableBrandProperties.value.metaTitle);
  body.append('meta_description', editableBrandProperties.value.metaDescription);
  body.append('visibility_status', editableBrandProperties.value.visibilityStatus.code);
  if(fileToEditUp.value) {
    body.append('image', fileToEditUp.value, fileToEditUp.value.name);
  }
  body.append('_method', 'PUT');

  const {data: responseFromBrandAdded, error } = await useFetch(
      runtimeConfig.public.appUrl + `/api/proxy/admin/brands/${brandInfo.value.slug}`,
      {
        method: 'POST',
        body,
        onResponse({ request, response, options }) {
          // Process the response data
          if(response.status === 200) {
            visibleBrandEditModal.value = false;
            toast.add({ severity: "success", summary: "Brand Edited", detail: `${response._data.message}`, life: 3000 });
            refresh();
            fileToEditUp.value = null;
          }
        },
        onResponseError({ request, response, options }) {
          console.log('Error');
          fileToEditUp.value = null;
          // Handle the response errors
        }
      },
  )
}

// end edits!!

const visibleDeleteModal = ref(false);
const openDeleteModal = (brandData) => {
 brandInfo.value = brandData;
 visibleDeleteModal.value = true;
}
const deleteTheBrand = async () => {
  const {data: deleteResponse, error } = await useFetch(
      runtimeConfig.public.appUrl + `/api/proxy/admin/brands/${brandInfo.value.slug}`,
      {
        method: 'DELETE',
        onResponse({ request, response, options }) {
          // Process the response data
          if(response.status === 200) {
            visibleDeleteModal.value = false;
            toast.add({ severity: "success", summary: "Brand Deleted", detail: `${response._data.message}`, life: 3000 });
            refresh();
          }
        },
        onResponseError({ request, response, options }) {
          toast.add({severity:'error', summary:"Error", detail:`Could Not delete brand`, life: 3000})
          // Handle the response errors
        }
      },
  )
}

const hideDeleteModal = () => {
  visibleDeleteModal.value = false;
  brandInfo.value = {};
}


</script>

<template>
  <div class="brand-list-container">
    <div class="order-table">
      <ClientOnly>
        <Toast />
      </ClientOnly>
      <DataTable :value="brands" v-model:filters="filters" :globalFilterFields="['name']">
        <template #header>
          <div class="flex justify-between items-center">
            <h4 class="text-primary-color-envitect-sam-blue">Brands</h4>
            <div class="flex gap-3 brands-search-add">
              <IconField iconPosition="right">
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters['global'].value" placeholder="Search Brands" />
              </IconField>
              <Button class="add-brand-button px-6" label="Add a Brand" icon="pi pi-plus"  @click="openBrandCreationModal"/>
            </div>

          </div>
        </template>
        <Column header="SL">
          <template #body="slotProps">
            {{slotProps.index + 1}}
          </template>
        </Column>
        <Column header="Logo">
          <template #body="slotProps">
            <img class="h-12 w-42" :src="slotProps.data.image_url" :alt="slotProps.data.name"/>
          </template>
        </Column>
        <Column header="Name" style="min-width: 40%">
          <template #body="slotProps">
            {{slotProps.data.name}}
          </template>
        </Column>
        <Column header="Status">
          <template #body="slotProps">
            {{slotProps.data.visibility_status === 'public' ? 'Active' : 'De-actived'}}
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <i class="block pi pi-file-edit text-xl block-edit"  title="Edit Brand Information" @click="openEditModal(slotProps.data)"/>
              <i class="block pi pi-trash text-xl block-delete" title="Delete This Brand" @click="openDeleteModal(slotProps.data)"/>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <ClientOnly>
<!--      Add Brand Modal -->
      <PagesProductBrandsAddBrandModal v-model:visible="visibleBrandCreationModal"  @close-brand-add-modal="closeBrandCreationModal"/>
<!--      Edit Brand Modal -->
      <Dialog v-model:visible="visibleBrandEditModal" maximizable modal :header="`Edit Brand - ${brandInfo.name}`" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" dismissableMask closeOnEscape>
        <div class="w-full">
          <form class="flex flex-col gap-3" @submit.prevent="editABrand()" enctype="multipart/form-data">
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
                <FileUpload :file-limit="1" name="brandImage" url="/api/upload" @upload="onTemplatedUploadEdit($event)"  accept="image/*" :maxFileSize="1000000" @select="onSelectedFilesforEdit" required>
                  <template #header="{ chooseCallback, clearCallback, files }">
                    <div class="flex flex-wrap justify-between items-center flex-1 gap-2">
                      <div class="flex gap-2">
                        <Button @click="chooseCallback()" icon="pi pi-images" rounded outlined></Button>
                        <Button @click="clearCallback()" icon="pi pi-times" rounded outlined severity="danger" :disabled="!files || files.length === 0"></Button>
                      </div>
                    </div>
                  </template>
                  <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
                    <div v-if="files.length > 0">
                      <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                        <div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="card w-full m-0 px-6 flex justify-between border-1 surface-border items-center gap-3">
                          <div>
                            <img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" />
                          </div>
                          <span class="font-semibold">{{ file.name }}</span>
                          <div>{{ formatSize(file.size) }}</div>
                          <Button icon="pi pi-times" @click="onRemoveTemplatingFileEdit(file, removeFileCallback, index)" outlined rounded  severity="danger" />
                        </div>
                      </div>
                    </div>
                    <div v-else-if="editableBrandProperties.image">
                      <div   class="card w-full m-0 px-6 flex justify-between border-1 surface-border items-center gap-3">
                        <div>
                          <img role="presentation" :alt="editableBrandProperties.name" :src="editableBrandProperties.image" width="100" height="50" />
                        </div>
                        <span class="font-semibold">{{ brandInfo.name }}</span>
                        <Button icon="pi pi-times" @click="removeExistingImage" outlined rounded  severity="danger" />
                      </div>
                    </div>
                  </template>
                  <template #empty>
                    <div v-if="!editableBrandProperties.image" class="flex items-center justify-center flex-col">
                      <i class="pi pi-cloud-upload border-2 rounded-full p-5 text-3xl text-400 border-400"/>
                      <p class="mt-4 mb-0">Drag and drop Brand Logo to here to upload.</p>
                    </div>
                  </template>
                </FileUpload>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mt-1">
              <div class="flex flex-col gap-1">
                <label for="meta-title">Brand Meta Title</label>
                <InputText
                    v-model="editableBrandProperties.metaTitle"
                    id="meta-title"
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
                    optionLabel="name"
                    placeholder="Select a Status"
                    checkmark :highlightOnSelect="false"/>
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
                :disabled="brandInfo.name === editableBrandProperties.name && brandInfo.meta_title === editableBrandProperties.metaTitle && brandInfo.meta_description === editableBrandProperties.metaDescription && brandInfo.visibility_status === editableBrandProperties.visibilityStatus.code && (brandInfo.image_url === editableBrandProperties.image ||  !fileToEditUp)"
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
                you want to Delete Brand - {{brandInfo.name}}?
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

<style scoped>
.brand-list-container {
  background-color: var(--primary-color-white);
  border-radius: 12px;
  padding: 1.5rem;
}
.edit-brand-button, .add-brand-button{
  background-color: var(--primary-color-envitect-sam-blue);
}
.block-edit, .block-delete {
  transition: .5s;
}
.block-edit:hover, .block-delete:hover{
  transform: scale(1.05);
  color: var(--primary-color-envitect-sam-blue)
}
.block-delete:hover {
  color: var(--color-danger)
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
  background-color: var(--color-danger)
}
</style>
