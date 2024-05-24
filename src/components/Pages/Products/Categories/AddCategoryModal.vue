<script setup lang="ts">
import { usePrimeVue } from "primevue/config";
import { useToast } from "primevue/usetoast";
import { useStore } from "#imports";
const toast = useToast();

defineOptions({
  inheritAttrs: false,
});
const $primevue = usePrimeVue();
const emits = defineEmits<{
  (e: "closeCategoyAddModal"): void;
}>();

const statuses = ref([
  { name: "Active", code: "public" },
  { name: "De-active", code: "hidden" },
]);

const files = ref([]);
const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
  removeFileCallback(index);
};
const fileToUp = ref<File | null>(null);
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

const categoryToAdd = ref({
  categoryName: "",
  categoryMetaTitle: "",
  categoryMetaDescription: "",
  categoryVisibilityStatus: {},
  parent: {},
});
const addACategory = async (event) => {
  const body = new FormData();
  body.append("name", categoryToAdd.value.categoryName);
  body.append("meta_title", categoryToAdd.value.categoryMetaTitle);
  body.append("meta_description", categoryToAdd.value.categoryMetaDescription);
  body.append(
    "visibility_status",
    categoryToAdd.value.categoryVisibilityStatus.code,
  );
  if (
    categoryToAdd.value.parent.name &&
    categoryToAdd.value.parent.id !== 0
  ) {
    body.append("parent_id", categoryToAdd.value.parent.id);
  }
  body.append("image", fileToUp.value, fileToUp.value.name);
  const { data } = await useFetch("/api/proxy/admin/categories", {
    method: "POST",
    body,
    onResponse({ response }) {
      // Process the response data
      if (response.status === 200) {
        toast.add({
          severity: "success",
          summary: "Category Created",
          detail: `${response._data.message}`,
          life: 3000,
        });
        categoryToAdd.value = {
          categoryName: "",
          categoryMetaTitle: "",
          categoryMetaDescription: "",
          categoryVisibilityStatus: {},
          parent: {},
        };
        emits("closeCategoyAddModal");
        files.value = null;
        fileToUp.value = null;
      } else if (response.status === 422) {
        toast.add({
          severity: "error",
          summary: "Couldn't create category",
          detail: `${response._data.errors.name}`,
          life: 3000,
        });
      }
    },
    onResponseError({ request, response, options }) {
      // Handle the response errors
      files.value = null;
      fileToUp.value = null;
    },
  });
};
const store = useStore();
</script>

<template>
  <div>
    <Dialog
      v-bind="$attrs"
      maximizable
      modal
      header="Add a Category"
      :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
      dismissable-mask
      close-on-escape
    >
      <div class="w-full">
        <form
          class="flex flex-col gap-3"
          enctype="multipart/form-data"
          @submit.prevent="addACategory"
        >
          <InputText
            v-model="categoryToAdd.categoryName"
            class="mt-1"
            aria-describedby="text-name"
            placeholder="Enter Category Name"
            required
            type="text"
          />
          <div class="card">
            <FileUpload
              :file-limit="1"
              name="categoryImage"
              url="/api/upload"
              accept="image/*"
              :max-file-size="1000000"
              required
              @select="onSelectedFiles"
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
                          onRemoveTemplatingFile(
                            file,
                            removeFileCallback,
                            index,
                          )
                        "
                      />
                    </div>
                  </div>
                </div>
              </template>
              <template #empty>
                <div class="flex items-center justify-center flex-col">
                  <i
                    class="pi pi-cloud-upload border-2 rounded-full p-5 text-3xl text-400 border-400"
                  />
                  <p class="mt-4 mb-0">
                    Drag and drop Category Logo to here to upload.
                  </p>
                </div>
              </template>
            </FileUpload>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <InputText
              id="meta-title"
              v-model="categoryToAdd.categoryMetaTitle"
              aria-describedby="text-meta-title"
              placeholder="Enter Meta-title of the category"
              required
              type="text"
            />
            <Dropdown
              v-model="categoryToAdd.categoryVisibilityStatus"
              :options="statuses"
              option-label="name"
              placeholder="Select a Status"
              checkmark
              :highlight-on-select="false"
            />
          </div>
          <Dropdown
            id="parent"
            v-model="categoryToAdd.parent"
            :options="[
              { id: 0, name: 'None', parent_id: null },
              ...store.productCategories,
            ]"
            filter
            option-label="name"
            placeholder="Select Parent Category"
            checkmark
          />
          <Textarea
            v-model="categoryToAdd.categoryMetaDescription"
            aria-describedby="text-meta-description"
            auto-resize
            placeholder="Enter Meta Description"
            required
            rows="3"
          />

          <Button
            class="button-style add-category-button"
            :disabled="
              !categoryToAdd.categoryName ||
              !categoryToAdd.categoryMetaTitle ||
              !categoryToAdd.categoryMetaDescription ||
              !fileToUp ||
              !categoryToAdd.categoryVisibilityStatus.code
            "
            label="Add Category"
            type="submit"
          />
        </form>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.add-category-button {
  background-color: var(--primary-color-envitect-sam-blue);
}
</style>
