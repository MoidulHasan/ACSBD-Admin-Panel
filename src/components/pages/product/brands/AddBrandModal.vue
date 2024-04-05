<script setup lang="ts">
import {usePrimeVue} from "primevue/config";
import {useToast} from "primevue/usetoast";
const toast = useToast();

defineOptions({
  inheritAttrs: false
});
const $primevue = usePrimeVue();
const emits = defineEmits<{
  (e:'closeBrandAddModal'):void,
}>();

const runtimeConfig = useRuntimeConfig();
const statuses = ref([
  { name: 'Active', code: 'public' },
  { name: 'De-active', code: 'hidden' },
]);

const files = ref([]);
const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
  removeFileCallback(index);
};
const fileToUp = ref<File|null>(null);
const onSelectedFiles = (event) => {
  const [_file] = event.files;
  fileToUp.value = _file;
  files.value = event.files;
};

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

const brandToAdd = ref({
  brandName: '',
  brandMetaTitle: '',
  brandMetaDescription: '',
  brandVisibilityStatus: {}
});
const addABrand = async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const body = new FormData();
  body.append('name', brandToAdd.value.brandName);
  body.append('meta_title', brandToAdd.value.brandMetaTitle);
  body.append('meta_description', brandToAdd.value.brandMetaDescription);
  body.append('visibility_status', brandToAdd.value.brandVisibilityStatus.code);
  body.append('image', fileToUp.value, fileToUp.value.name);
  const {data: responseFromBrandAdded, error } = await useFetch(
      runtimeConfig.public.appUrl + "/api/proxy/admin/brands",
      {
        method: 'POST',
        body,
        onResponse({ request, response, options }) {
          // Process the response data
          if(response.status === 200) {

            toast.add({ severity: "success", summary: "Brand Created", detail: `${response._data.message}`, life: 3000 });
            brandToAdd.value = {
              brandName: '',
              brandMetaTitle: '',
              brandMetaDescription: '',
              brandVisibilityStatus: {}
            }
            emits('closeBrandAddModal')
            files.value = null;
            fileToUp.value = null;
          }
          else if(response.status === 422) {
            toast.add({ severity: "error", summary: "Couldn't create brand", detail: `${response._data.errors.name}`, life: 3000 });
          }
        },
        onResponseError({ request, response, options }) {

          // Handle the response errors
          files.value = null;
          fileToUp.value = null;
        }
      },
  )
}
</script>


<template>
  <div>
    <Dialog  v-bind="$attrs" maximizable modal header="Add a Brand" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" dismissableMask closeOnEscape>
      <div class="w-full">
        <form class="flex flex-col gap-3" @submit.prevent="addABrand" enctype="multipart/form-data">
          <InputText
              v-model="brandToAdd.brandName"
              class="mt-1"
              aria-describedby="text-name"
              placeholder="Enter Brand Name"
              required
              type="text"
          />
          <div class="card">
            <FileUpload :file-limit="1" name="brandImage" url="/api/upload"   accept="image/*" :maxFileSize="1000000" @select="onSelectedFiles" required>
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
                      <Button icon="pi pi-times" @click="onRemoveTemplatingFile(file, removeFileCallback, index)" outlined rounded  severity="danger" />
                    </div>
                  </div>
                </div>
              </template>
              <template #empty>
                <div  class="flex items-center justify-center flex-col">
                  <i class="pi pi-cloud-upload border-2 rounded-full p-5 text-3xl text-400 border-400"/>
                  <p class="mt-4 mb-0">Drag and drop Brand Logo to here to upload.</p>
                </div>
              </template>
            </FileUpload>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <InputText
                v-model="brandToAdd.brandMetaTitle"
                id="meta-title"
                aria-describedby="text-meta-title"
                placeholder="Enter Meta-title of the brand"
                required
                type="text"
            />
            <Dropdown
                v-model="brandToAdd.brandVisibilityStatus"
                :options="statuses"
                optionLabel="name"
                placeholder="Select a Status"
                checkmark :highlightOnSelect="false"/>
          </div>
          <Textarea
              v-model="brandToAdd.brandMetaDescription"
              aria-describedby="text-meta-description"
              auto-resize
              placeholder="Enter Meta Description"
              required
              rows="3"
          />

          <Button
              class="button-style add-brand-button"
              :disabled="!brandToAdd.brandName || !brandToAdd.brandMetaTitle || !brandToAdd.brandMetaDescription || !fileToUp || !brandToAdd.brandVisibilityStatus.code"
              label="Add Brand"
              type="submit" />
        </form>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>

</style>