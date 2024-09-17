<script setup lang="ts">
import * as yup from "yup";
import { requiredString } from "~/app/utils/form-helpers";
import type { ICreateResponse, IDeleteResponse } from "~/app/interfaces/common";
import type { IWorkData, FormData } from "~/app/interfaces/recentWorks";

interface IProps {
  workData?: IWorkData;
}

const props = defineProps<IProps>();

const emits = defineEmits<{
  (e: "onFormSubmit"): void;
  (e: "onImageDelete"): void;
}>();

const { $apiClient } = useNuxtApp();
const store = useStore();
const toast = useToast();

const workStatusOption = [
  { title: "Public", value: true },
  { title: "Hidden", value: false },
];

const workCategoryOption = [
  { title: "Commercial", value: "commercial" },
  { title: "Residential", value: "residential" },
];

const validationSchema = yup.object({
  title: requiredString("Work title"),
  subTitle: requiredString("Work Subtitle"),
  formDate: yup.string().nullable(),
  toDate: yup.string().nullable(),
  type: requiredString("Work Type"),
  status: requiredString("Work visibility status"),
  description: requiredString("Description"),
  completedBy: requiredString("Completed By"),
  client: requiredString("Work Client"),
  image: yup.array().of(yup.mixed()).min(1).max(1),
  galleryImages: yup.array().of(yup.mixed()),
});

const { handleSubmit, errors, handleReset, meta } = useForm<FormData>({
  validationSchema,
  initialValues: {
    title: props.workData?.title ?? "",
    subTitle: props.workData?.sub_title ?? "",
    fromDate: props.workData?.from_date ?? undefined,
    toDate: props.workData?.to_date ?? undefined,
    type: props.workData?.type ?? "",
    status: props.workData?.status ?? undefined,
    description: props.workData?.description ?? "",
    completedBy: props.workData?.completed_by ?? "",
    client: props.workData?.client ?? "",
    image: props.workData?.image ? [props.workData?.image] : [],
    galleryImages: props?.workData?.gallery_images
      ? props.workData?.gallery_images.map((image) => image.path)
      : [],
  },
});

const { value: title } = useField<string>("title");
const { value: subTitle } = useField<string>("subTitle");
const { value: fromDate } = useField<string | Date>("fromDate");
const { value: toDate } = useField<string | Date>("toDate");
const { value: status } = useField<string | boolean | number>("status");
const { value: type } = useField<string>("type");
const { value: description } = useField<string>("description");
const { value: completedBy } = useField<string>("completedBy");
const { value: client } = useField<string>("client");
const { value: image } = useField<File[] | string[]>("image");
const { value: galleryImages } = useField<File[] | string[]>("galleryImages");

const deleteWorkImage = async (id: number) => {
  return await $apiClient<IDeleteResponse>(
    "/admin/works/" + id + "/gallery-image",
    {
      method: "DELETE",
    },
  ).catch((error) => error.data);
};

const createOrUpdateWork = async (workData: FormData) => {
  try {
    const response = await $apiClient<ICreateResponse>("/admin/works", {
      method: "POST",
      body: workData,
    }).catch((error) => error.data);

    if (!response?.errors) {
      // refreshWrokData();
    }

    return response;
  } catch (err) {
    return err;
  }
};

const formatDateForFormData = (date: Date) => {
  return new Date(date).toISOString().split("T")[0];
};

const onSubmit = handleSubmit(async (values, actions) => {
  try {
    const formData = new FormData();

    formData.append("title", values.title);
    formData.append("sub_title", values.subTitle);
    formData.append("type", values.type);
    formData.append("description", values.description);
    formData.append("client", values.client);
    formData.append("completed_by", values.completedBy);
    formData.append("from_date", formatDateForFormData(values.fromDate));
    formData.append("status", values.status ? 1 : 0);

    if (values.toDate)
      formData.append("to_date)", formatDateForFormData(values.toDate));

    // id will be passed when data need to be updated
    if (props.workData) formData.append("id", props.workData.id);

    // image and gallery image handle
    if (values.image.length && typeof values.image[0] !== "string") {
      formData.append("image", values.image[0]);
    }
    if (values.galleryImages?.length) {
      values.galleryImages.forEach((file) => {
        if (typeof file !== "string") formData.append("gallery_images[]", file);
      });
    }

    console.log(formData, "FORM DATA");
    const response = await createOrUpdateWork(formData);

    if (!response.errors && response.message) {
      toast.add({
        severity: "success",
        summary: "Request Success",
        detail: response.message,
        life: 3000,
      });

      emits("onFormSubmit");
      if (props?.workData) {
        await navigateTo({ title: "recent-works" });
        return;
      }

      actions.resetForm();
      return;
    }

    if (response.errors) {
      const fieldErrorMapping: Record<string, string> = {
        title: "title",
        sub_title: "subTitle",
        from_date: "fromDate",
        to_date: "toDate",
        status: "status",
        type: "type",
        description: "description",
        completed_by: "completedBy",
        client: "client",
      };

      Object.keys(response.errors).forEach((fieldName) => {
        const mappedFieldName = fieldErrorMapping[fieldName] || fieldName;

        actions.setFieldError(
          mappedFieldName,
          response.errors[fieldName].join(", "),
        );
      });

      toast.add({
        severity: "error",
        summary: "Request failed",
        detail: Object.values(response.errors).flat().join(", "),
        life: 3000,
      });

      return;
    }

    toast.add({
      severity: "error",
      summary: "Request failed",
      detail: response.statusText,
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Request failed",
      detail: error.message || "An unknown error occurred",
      life: 3000,
    });
  }
});

const deleteImage = async (fileUrl: string) => {
  if (
    image.value &&
    typeof image.value[0] === "string" &&
    fileUrl === image.value[0]
  ) {
    image.value = [];
    return;
  }

  if (!props?.workData?.gallery_images.length) return;

  const imageIdx = props.workData.gallery_images.findIndex(
    (img) => img.path === fileUrl,
  );

  if (imageIdx === -1) return;

  const response = await deleteWorkImage(
    props?.workData?.gallery_images[imageIdx].id,
  );

  if (response?.status) {
    // emits("onImageDelete");

    // console.log(imageIdx, props.workData?.gallery_images, "Gallery Image");
    // props?.workData?.gallery_images.splice(imageIdx, 1);
    // console.log(props?.workData?.gallery_images, "After SPLICE");

    // props.workData.gallery_images.splice(imageIdx, 1);
    // props.workData.gallery_images = [...props.workData.gallery_images];

    // Update the gallery images to trigger reactivity
    props.workData.gallery_images = [
      ...props.workData.gallery_images.slice(0, imageIdx),
      ...props.workData.gallery_images.slice(imageIdx + 1),
    ];

    toast.add({
      severity: "success",
      summary: "Request Success",
      detail: response.message,
      life: 3000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Request failed",
      detail: response?.error || "An unknown error occurred",
      life: 3000,
    });
  }
};
</script>

<template>
  <div class="form-container">
    <h2 class="form-title">{{ workData ? "Edit" : "Add" }} Recent Work</h2>

    <form @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-5">
        <CommonFormInput
          id="title"
          label="Work Title"
          required
          :error="errors.title"
        >
          <InputText
            id="title"
            v-model="title"
            placeholder="Enter Work Title"
            :invalid="!!errors.title"
          />
        </CommonFormInput>

        <CommonFormInput
          id="subTitle"
          label="Work Subtitle"
          required
          :error="errors.subTitle"
        >
          <InputText
            id="subTitle"
            v-model="subTitle"
            placeholder="Enter Work Subtitle"
            :invalid="!!errors.subTitle"
          />
        </CommonFormInput>
      </div>

      <div class="grid grid-cols-2 gap-5 mt-4">
        <CommonFormInput
          id="fromDate"
          label="Enter Project Start Date"
          required
          :error="errors.fromDate"
        >
          <Calendar
            v-model="fromDate"
            show-icon
            icon-display="input"
            :invalid="!!errors.fromDate"
            date-format="yy-mm-dd"
          />
        </CommonFormInput>
        <CommonFormInput
          id="toDate"
          label="Enter Project Ending Date"
          :error="errors.toDate"
        >
          <Calendar
            v-model="toDate"
            show-icon
            icon-display="input"
            :invalid="!!errors.toDate"
            date-format="yy-mm-dd"
          />
        </CommonFormInput>
      </div>

      <div class="grid grid-cols-2 gap-5">
        <CommonFormInput
          id="client"
          label="Work Client"
          required
          :error="errors.client"
        >
          <InputText
            id="client"
            v-model="client"
            placeholder="Enter Work Client Name"
            :invalid="!!errors.client"
          />
        </CommonFormInput>

        <CommonFormInput
          id="completedBy"
          label="Completed By"
          required
          :error="errors.completedBy"
        >
          <InputText
            id="completedBy"
            v-model="completedBy"
            placeholder="Completed By Company"
            :invalid="!!errors.completedBy"
          />
        </CommonFormInput>
      </div>

      <div class="grid grid-cols-2 gap-5 mt-4">
        <CommonFormInput
          id="type"
          label="Work Type"
          required
          :error="errors.type"
        >
          <Dropdown
            id="type"
            v-model="type"
            :options="workCategoryOption"
            :loading="store.loading"
            option-label="title"
            option-value="value"
            placeholder="Select Work Type"
            :invalid="!!errors.type"
          />
        </CommonFormInput>

        <CommonFormInput
          id="status"
          label="Visibility Status"
          required
          :error="errors.status"
        >
          <Dropdown
            id="status"
            v-model="status"
            :options="workStatusOption"
            :loading="store.loading"
            option-label="title"
            option-value="value"
            placeholder="Select Visibility Status"
            :invalid="!!errors.status"
          />
        </CommonFormInput>
      </div>

      <div class="grid grid-cols mt-4">
        <CommonFormInput
          id="description"
          label="Description"
          required
          :error="errors.description"
        >
          <Textarea
            v-model="description"
            class="w-full"
            aria-describedby="work-description"
            auto-resize
            placeholder="Write work description"
            required
            rows="5"
          />
        </CommonFormInput>
      </div>

      <div class="grid grid-cols-2 gap-5 mt-5">
        <CommonFormInput
          id="main-image"
          label="Main Product Images"
          required
          :error="errors.image"
        >
          <CommonCustomFileUpload
            v-model="image"
            accept="image/*"
            title="image"
            @delete-existing-file="deleteImage"
          />
        </CommonFormInput>

        <CommonFormInput
          id="gallery-image"
          label="Gallery Images"
          required
          :error="errors.galleryImages"
        >
          <CommonCustomFileUpload
            v-model="galleryImages"
            accept="image/*"
            multiple
            title="galleryImages"
            @delete-existing-file="deleteImage"
          />
        </CommonFormInput>
      </div>

      <div class="mt-16 flex justify-end gap-2">
        <Button
          :disabled="store.loading"
          class="form-action-button"
          type="button"
          @click="handleReset"
        >
          Reset
        </Button>

        <Button
          class="form-action-button form-submit-button"
          :disabled="store.loading || !meta.valid || !meta.dirty"
          :loading="store.loading"
          type="submit"
        >
          Submit
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped lang="postcss">
.form-container {
  background: var(--primary-color-white);

  width: 100%;
  height: 100%;
  border-radius: 12px;
  padding: 24px 40px;

  .form-title {
    width: 280px;
    height: 48px;
    margin-bottom: 32px;

    font-style: normal;
    font-weight: 600;
    font-size: 32px;
    line-height: 48px;

    display: flex;
    align-items: center;

    color: #3e3e3e;
  }
}
</style>

<style>
.select-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .p-button {
    width: 100%;
  }
}
</style>
