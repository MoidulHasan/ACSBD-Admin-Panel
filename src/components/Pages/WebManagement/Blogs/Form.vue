<script setup lang="ts">
import * as yup from "yup";

import { requiredString } from "~/app/utils/form-helpers";
import { processHtmlContent } from "~/utils/common";
import type { IBlog } from "~/app/interfaces/webManagement";

const { $apiClient } = useNuxtApp();

interface FormData {
  title: string;
  sub_title: string;
  category: string;
  description: string;
  tags: string[] | null;
  image: File[] | string[];
}

interface IProps {
  blogData?: IBlog;
}

const props = defineProps<IProps>();

const emits = defineEmits<{
  (e: "onFormSubmit"): void;
}>();

const store = useStore();
const toast = useToast();

const validationSchema = yup.object({
  title: requiredString("Blog title"),
  sub_title: requiredString("Blog sub_title"),
  category: requiredString("Blog category"),
  description: requiredString("Description"),
  tags: yup.array().of(yup.string()).nullable(),
  image: yup.array().of(yup.mixed()).min(1).max(1),
});

const { handleSubmit, errors, handleReset, meta } = useForm<FormData>({
  validationSchema,
  initialValues: {
    title: props.blogData?.title ?? "",
    sub_title: props.blogData?.sub_title ?? "",

    category: props.blogData?.category ?? undefined,

    description: props.blogData?.description ?? "",

    image: props.blogData?.image ? [props.blogData?.image] : [],

    tags: props?.blogData?.tags ?? undefined,
  },
});

const { value: title } = useField<string>("title");
const { value: sub_title } = useField<string>("sub_title");
const { value: category } = useField<string>("category");
const { value: description } = useField<string>("description");
const { value: tags } = useField("tags");
const { value: image } = useField<File[] | string[]>("image");

const onSubmit = handleSubmit(async (values, actions) => {
  try {
    const formatedHtml = await processHtmlContent(values.description);

    const formData = new FormData();

    formData.append("title", values.title);
    formData.append("sub_title", values.sub_title);
    formData.append("category", values.category.toString());
    formData.append("description", formatedHtml);

    if (values.tags?.length) {
      values.tags?.forEach((metaTag, index) => {
        formData.append(`tags[${index}]`, metaTag);
      });
    }

    if (values.image.length && typeof values.image[0] !== "string") {
      formData.append("image", values.image[0]);
    }
    if (props.blogData) {
      formData.append("id", props.blogData.id);
    }

    const makeRequest = async (url: string, method: "POST" | "post", body) => {
      store.loading = true;
      const response = await $apiClient<ICreateResponse>(url, {
        method,
        body,
      }).catch((error) => error.data);
      store.loading = false;
      return response;
    };

    const response = await makeRequest("/admin/blogs", "POST", formData);

    if (!response.errors && response.message) {
      toast.add({
        severity: "success",
        summary: "Request Success",
        detail: response.message,
        life: 3000,
      });

      emits("onFormSubmit");
      if (props?.blogData) {
        await navigateTo({ name: "our-blogs" });
        return;
      }

      actions.resetForm();
      return;
    }

    if (response.errors) {
      const fieldErrorMapping: Record<string, string> = {
        title: "title",
        sub_title: "sub_title",
        category: "category",
        description: "description",
        tags: "tags",
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
  }
};
</script>

<template>
  <div class="form-container">
    <h2 class="form-title">
      {{ blogData ? `Edit Blog: ${blogData.title}` : "Add New Blog" }}
    </h2>

    <form @submit.prevent="onSubmit">
      <div class="grid grid-cols gap-5">
        <CommonFormInput
          id="title"
          label="Blog title"
          required
          :error="errors.title"
        >
          <InputText
            id="title"
            v-model="title"
            placeholder="Enter Blog title"
            :invalid="!!errors.title"
          />
        </CommonFormInput>

        <CommonFormInput
          id="sub_title"
          label="Blog sub_title"
          required
          :error="errors.sub_title"
        >
          <Textarea
            id="sub_title"
            v-model="sub_title"
            placeholder="Enter Blog sub_title"
            :invalid="!!errors.sub_title"
          />
        </CommonFormInput>
      </div>

      <div class="grid grid-cols-2 gap-5 mt-4">
        <CommonFormInput
          id="category"
          label="Blog Category"
          required
          :error="errors.category"
        >
          <InputText
            id="category"
            v-model="category"
            placeholder="Enter Blog Category"
            :invalid="!!errors.category"
          />
        </CommonFormInput>
        <CommonFormInput id="tags" label="Tags" :error="errors.tags">
          <Chips
            id="metaTitle"
            v-model="tags"
            placeholder="Meta Title"
            :invalid="!!errors.tags"
          />
        </CommonFormInput>
      </div>

      <div class="grid grid-cols gap-5 mt-5">
        <CommonFormInput
          id="main-image"
          label="Main Blog Image"
          required
          :error="errors.image"
        >
          <CommonCustomFileUpload
            v-model="image"
            accept="image/*"
            name="image"
            @delete-existing-file="deleteImage"
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
          <CommonEditor
            id="description"
            v-model="description"
            :readonly="store.loading"
            :height="200"
            placeholder="Write Blog description"
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
    //width: 280px;
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
