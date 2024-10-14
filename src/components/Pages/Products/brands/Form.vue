<script setup lang="ts">
import * as yup from "yup";
import { formatSize, useToast, type IBrand } from "#imports";
import { statusOptions } from "~/app/constants/common";

const { $apiClient } = useNuxtApp();

interface IProps {
  brandData?: IBrand;
}

const props = defineProps<IProps>();
const emits = defineEmits<{
  (e: "onFormSubmit"): void;
}>();

const toast = useToast();
const store = useStore();

const files = ref([]);
const fileToUp = ref<File | null>(null);

const validationSchema = yup.object({
  name: yup.string().required("Name is Required"),
  image: yup.mixed().test("required", "Image is required", function (value) {
    return (
      fileToUp.value !== null || (typeof value === "string" && value !== "")
    );
  }),
  visibilityStatus: yup.string().required("Status is Required"),
  metaTitle: yup.string().nullable(),
  metaDescription: yup.string().nullable(),
});

const { handleSubmit, errors, resetForm, meta } = useForm({
  validationSchema,
  initialValues: {
    name: props.brandData?.name ?? "",
    image: props.brandData?.image_url ?? "",
    visibilityStatus: props.brandData?.visibility_status ?? "",
    metaTitle: props.brandData?.meta_title ?? "",
    metaDescription: props.brandData?.meta_description ?? "",
  },
});
const { value: name } = useField<string>("name");
const { value: image } = useField("image");
const { value: visibilityStatus } = useField("visibilityStatus");
const { value: metaTitle } = useField<string | null>("metaTitle");
const { value: metaDescription } = useField<string | null>("metaDescription");

const onSubmit = handleSubmit(async (values, actions) => {
  const requestBody = new FormData();

  requestBody.append("name", values.name);
  requestBody.append("visibility_status", values.visibilityStatus);
  requestBody.append("meta_title", values.metaTitle);
  requestBody.append("meta_description", values.metaDescription);

  if (fileToUp.value) {
    requestBody.append("image", fileToUp.value, fileToUp.value.name);
  }

  if (props.brandData) {
    requestBody.append("_method", "PUT");
  }

  const makeRequest = async (url, method, body) => {
    store.loading = true;
    const response = await $apiClient<ICreateResponse>(url, {
      method,
      body,
    }).catch((error) => error.data);
    store.loading = false;
    return response;
  };

  const response = props.brandData
    ? await makeRequest(
        `/admin/brands/${props.brandData.slug}`,
        "POST",
        requestBody,
      )
    : await makeRequest("/admin/brands", "POST", requestBody);

  if (!response.errors && response.message) {
    toast.add({
      severity: "success",
      summary: "Request Success",
      detail: response.message,
      life: 3000,
    });

    emits("onFormSubmit");
    return;
  }

  // let response;

  if (response.errors) {
    Object.keys(response.errors).forEach((fieldName) => {
      if (fieldName === "name") {
        actions.setFieldError("name", response.errors[fieldName]);
      }
      if (fieldName === "image") {
        actions.setFieldError("image", response.errors[fieldName]);
      }
      if (fieldName === "visibilityStatus") {
        actions.setFieldError("visibilityStatus", response.errors[fieldName]);
      }
      if (fieldName === "metaTitle") {
        actions.setFieldError("metaTitle", response.errors[fieldName]);
      }
      if (fieldName === "metaDescription") {
        actions.setFieldError("metaDescription", response.errors[fieldName]);
      }
      toast.add({
        severity: "error",
        summary: "Request Failed",
        detail: response.errors[fieldName].join(" , "),
        life: 3000,
      });
    });
  }

  toast.add({
    severity: "error",
    summary: "Request failed",
    detail: response.statusText,
    life: 3000,
  });
});

const onRemoveTemplatingFile = (
  removeFileCallback: Function,
  index: number,
) => {
  removeFileCallback(index);
};

const removeExistingImage = () => {
  if (props.brandData) {
    props.brandData.image_url = "";
  }
};

const onSelectedFiles = (event: any) => {
  const [_file] = event.files;
  fileToUp.value = _file;
  files.value = event.files;
  image.value = _file.name;
};
</script>

<template>
  <div class="bg-white">
    <form
      class="flex flex-col gap-3"
      enctype="multipart/form-data"
      @submit.prevent="onSubmit"
    >
      <div class="">
        <InputText
          v-model="name"
          class="mt-1 w-full"
          aria-describedby="text-name"
          placeholder="Enter brand name"
          required
          type="text"
        />
        <span class="text-red-400 text-xs pt-1 w-full">{{ errors.name }}</span>
      </div>

      <div class="card">
        <FileUpload
          :file-limit="1"
          name="image"
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
                    @click="onRemoveTemplatingFile(removeFileCallback, index)"
                  />
                </div>
              </div>
            </div>
            <div v-else-if="brandData?.image_url">
              <div
                class="card w-full m-0 px-6 flex justify-between border-1 surface-border items-center gap-3"
              >
                <div>
                  <img
                    role="presentation"
                    :alt="brandData.name"
                    :src="brandData.image_url"
                    width="100"
                    height="50"
                  />
                </div>
                <span class="font-semibold">{{ brandData.name }}</span>
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
              v-if="!brandData?.image_url"
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
      <span class="text-red-400 text-xs pt-1">{{ errors.image }}</span>
      <div class="grid grid-cols-2 gap-3 mt-1">
        <div class="flex flex-col gap-1">
          <label for="meta-title">Brand Meta Title</label>
          <InputText
            id="meta-title"
            v-model="metaTitle"
            aria-describedby="text-meta-title"
            placeholder="Enter meta title of the brand"
            type="text"
          />
          <span class="text-red-400 text-xs pt-1 w-full">
            {{ errors.metaTitle }}
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <label for="status-dropdown">Brand Visibility Status</label>
          <Dropdown
            id="status-dropdown"
            v-model="visibilityStatus"
            :options="statusOptions"
            option-label="name"
            option-value="value"
            placeholder="Select a status"
            checkmark
            :highlight-on-select="false"
          />
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label for="meta-desc">Brand Meta Description</label>
        <Textarea
          id="meta-desc"
          v-model="metaDescription"
          aria-describedby="text-meta-description"
          auto-resize
          placeholder="Enter meta description"
          rows="3"
        />
      </div>
      <div class="mt-5 flex justify-end gap-2">
        <Button
          :disabled="store.loading"
          class="action-button"
          type="button"
          @click="resetForm"
        >
          Reset
        </Button>
        <Button
          :disabled="store.loading || !meta.valid || !meta.dirty"
          :loading="store.loading"
          class="action-button submit-button"
          type="submit"
        >
          Submit
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.submit-button {
  background: var(--primary-color-envitect-sam-blue);
  color: var(--primary-color-white);
}

:deep(.p-rating-icon) {
  color: var(--color-orange);
}
</style>
