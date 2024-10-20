<script setup lang="ts">
import * as yup from "yup";
import type { IStatus } from "~/app/interfaces/products";
import {
  formatSize,
  type ITestimonial,
  type IUpdateResponse,
  useToast,
} from "#imports";

import { statusOptions } from "~/app/constants/common";
const { $apiClient } = useNuxtApp();

interface IProps {
  testimonialData?: ITestimonial;
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
  reviewerName: yup.string().required("Reviewer Name is Required"),
  reviewerTitle: yup.string().required("Reviewer Title is Required"),
  review: yup.string().required("Review is Required"),
  reviewerImage: yup
    .mixed()
    .test("required", "Image is required", function (value) {
      return (
        fileToUp.value !== null || (typeof value === "string" && value !== "")
      );
    }),
  reviewStatus: yup.string().required("Review Status Is Required"),
  reviewStars: yup.number().required("Review Stars is required"),
});

const { handleSubmit, errors, resetForm, meta } = useForm({
  validationSchema,
  initialValues: {
    reviewerName: props.testimonialData?.reviewer_name ?? "",
    reviewerTitle: props.testimonialData?.reviewer_title ?? "",
    review: props.testimonialData?.review ?? "",
    reviewerImage: props.testimonialData?.reviewer_image ?? "",
    reviewStatus: props.testimonialData?.visibility_status ?? "",
    reviewStars: props.testimonialData?.star ?? 5,
  },
});
const { value: reviewerName } = useField("reviewerName");
const { value: reviewerTitle } = useField("reviewerTitle");
const { value: review } = useField("review");
const { value: reviewerImage } = useField("reviewerImage");
const { value: reviewStatus } = useField("reviewStatus");
const { value: reviewStars } = useField("reviewStars");

const onSubmit = handleSubmit(async (values, actions) => {
  const requestBody = new FormData();

  requestBody.append("reviewer_name", values.reviewerName);
  requestBody.append("reviewer_title", values.reviewerTitle);
  requestBody.append("review", values.review);
  requestBody.append("visibility_status", values.reviewStatus);
  requestBody.append("star", values.reviewStars);

  if (fileToUp.value) {
    requestBody.append("reviewer_image", fileToUp.value, fileToUp.value.name);
  }

  if (props.testimonialData) {
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

  const response = props.testimonialData
    ? await makeRequest(
        `/admin/testimonials/${props.testimonialData.id}`,
        "POST",
        requestBody,
      )
    : await makeRequest("/admin/testimonials", "POST", requestBody);

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
      if (fieldName === "reviewer_name") {
        actions.setFieldError("reviewerName", response.errors[fieldName]);
      }
      if (fieldName === "reviewer_title") {
        actions.setFieldError("reviewerTitle", response.errors[fieldName]);
      }
      if (fieldName === "review") {
        actions.setFieldError("review", response.errors[fieldName]);
      }
      if (fieldName === "reviewer_image") {
        actions.setFieldError("reviewerImage", response.errors[fieldName]);
      }
      if (fieldName === "visibility_status") {
        actions.setFieldError("reviewStatus", response.errors[fieldName]);
      }
      if (fieldName === "star") {
        actions.setFieldError("reviewStars", response.errors[fieldName]);
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
  if (props.testimonialData) {
    props.testimonialData.reviewer_image = "";
  }
};

const onSelectedFiles = (event: any) => {
  const [_file] = event.files;
  fileToUp.value = _file;
  files.value = event.files;
  reviewerImage.value = _file.name;
};
</script>

<template>
  <div class="bg-white">
    <form
      class="flex flex-col gap-3"
      enctype="multipart/form-data"
      @submit.prevent="onSubmit"
    >
      <div class="grid grid-cols-2 gap-3">
        <div class="">
          <label for="reviewer-name">*Reviewer Name</label>
          <InputText
            id="reviewer-name"
            v-model="reviewerName"
            class="mt-1 w-full"
            aria-describedby="text-name"
            placeholder="Enter Reviewer Name"
            required
            type="text"
          />
          <span class="text-red-400 text-xs pt-1 w-full">{{
            errors.reviewerName
          }}</span>
        </div>
        <div class="">
          <label for="reviewer-title">*Reviewer Title</label>
          <InputText
            id="reviewer-title"
            v-model="reviewerTitle"
            class="mt-1 w-full"
            aria-describedby="text-name"
            placeholder="Enter Reviewer Title"
            required
            type="text"
          />
          <span class="text-red-400 text-xs pt-1 w-full">{{
            errors.reviewerTitle
          }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="reviewer-image">*Reviewer Photo</label>
        <FileUpload
          id="reviewer-image"
          :file-limit="1"
          name="reviewerImage"
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
            <div v-else-if="testimonialData?.reviewer_image">
              <div
                class="card w-full m-0 px-6 flex justify-between border-1 surface-border items-center gap-3"
              >
                <div>
                  <img
                    role="presentation"
                    :alt="testimonialData.reviewer_name"
                    :src="testimonialData.reviewer_image"
                    width="100"
                    height="50"
                  />
                </div>
                <span class="font-semibold">{{
                  testimonialData.reviewer_name
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
              v-if="!testimonialData?.reviewer_image"
              class="flex items-center justify-center flex-col"
            >
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
      <span class="text-red-400 text-xs pt-1">{{ errors.reviewerImage }}</span>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label for="review_star">*Review Stars</label>
          <Rating
            id="review_star"
            v-model="reviewStars"
            class="pt-2"
            aria-describedby="Star Review"
            title="Click to give reviews in stars"
            required
          />
          <span class="text-red-400 text-xs pt-1">{{
            errors.reviewStars
          }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label for="review-status">*Review Visibility Status</label>
          <Dropdown
            id="review-status"
            v-model="reviewStatus"
            :options="statusOptions"
            option-label="name"
            option-value="value"
            placeholder="Select a Status"
            checkmark
            :highlight-on-select="false"
            class="w-full"
          />
          <span class="text-red-400 text-xs pt-1">{{
            errors.reviewStatus
          }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="review-message">*Review Message</label>
        <Textarea
          id="review-message"
          v-model="review"
          aria-describedby="review-description"
          auto-resize
          placeholder="Enter Full Review"
          required
          rows="3"
        />
        <span class="text-red-400 text-xs pt-1">{{ errors.review }}</span>
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
