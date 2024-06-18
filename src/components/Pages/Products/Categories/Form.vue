<script setup lang="ts">
import * as yup from "yup";
import { formatSize } from "~/utils/formatSize";
import { statusOptions } from "~/app/constants/common";

export interface PropCategory {
  id: number;
  image_url: string;
  meta_description: string;
  meta_title: string;
  name: string;
  parent_id: number;
  slug: string;
  visibility_status: string;
}
interface Props {
  categoryData?: PropCategory;
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "onFormSubmit"): void;
}>();

const store = useStore();
const { flattenCategories, createCategory, updateCategory } =
  useCategoryStore();
const toast = useToast();

const files = ref([]);
const fileToUp = ref<File | null>(null);

const validationSchema = yup.object({
  categoryName: yup
    .string()
    .required("Category name is required")
    .test("isExist", "The name has already been taken.", (value) => {
      return !flattenCategories.some((category) => {
        const lowerCaseValue = value.toLowerCase();
        const categoryName = category.name.toLowerCase();

        if (props?.categoryData) {
          return (
            lowerCaseValue !== props?.categoryData.name.toLowerCase() &&
            lowerCaseValue === categoryName
          );
        }

        return lowerCaseValue === categoryName;
      });
    }),
  categoryMetaTitle: yup.string().required("Meta Title is required"),
  categoryMetaDescription: yup
    .string()
    .required("Meta Description is required"),
  categoryVisibilityStatus: yup
    .string()
    .required("Visibility Status is required"),
  categoryImage: yup
    .mixed()
    .test("required", "Image is required", function (value) {
      return (
        fileToUp.value !== null || (typeof value === "string" && value !== "")
      );
    }),
  categoryParent: yup.mixed(),
});

const { handleSubmit, errors, resetForm, meta } = useForm({
  validationSchema,
  initialValues: {
    categoryName: props.categoryData?.name ?? "",
    categoryMetaTitle: props.categoryData?.meta_title ?? "",
    categoryMetaDescription: props.categoryData?.meta_description ?? "",
    categoryVisibilityStatus: props.categoryData?.visibility_status ?? "",
    categoryImage: props.categoryData?.image_url ?? "",
    categoryParent: props.categoryData?.parent_id ?? "",
  },
});

const { value: categoryName } = useField("categoryName");
const { value: categoryMetaTitle } = useField("categoryMetaTitle");
const { value: categoryMetaDescription } = useField("categoryMetaDescription");
const { value: categoryVisibilityStatus } = useField(
  "categoryVisibilityStatus",
);
const { value: categoryImage } = useField("categoryImage");
const { value: categoryParent } = useField("categoryParent");

const onSubmit = handleSubmit(async (values, actions) => {
  const requestBody = new FormData();
  requestBody.append("name", values.categoryName);
  requestBody.append("meta_title", values.categoryMetaTitle);
  requestBody.append("meta_description", values.categoryMetaDescription);
  requestBody.append("visibility_status", values.categoryVisibilityStatus);
  requestBody.append("parent_id", values.categoryParent);
  if (fileToUp.value) {
    requestBody.append("image", fileToUp.value, fileToUp.value.name);
  }

  if (props.categoryData) {
    requestBody.append("_method", "PUT");
  }

  const response = props.categoryData
    ? await updateCategory(props.categoryData.slug, requestBody)
    : await createCategory(requestBody);

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

  if (response.errors) {
    Object.keys(response.errors).forEach((fieldName) => {
      if (fieldName === "name") {
        actions.setFieldError("categoryName", response.errors[fieldName]);
      }
      if (fieldName === "image") {
        actions.setFieldError("categoryImage", response.errors[fieldName]);
      }
      if (fieldName === "visibility_status") {
        actions.setFieldError(
          "categoryVisibilityStatus",
          response.errors[fieldName],
        );
      }
      if (fieldName === "meta_title") {
        actions.setFieldError("categoryMetaTitle", response.errors[fieldName]);
      }
      if (fieldName === "meta_description") {
        actions.setFieldError(
          "categoryMetaDescription",
          response.errors[fieldName],
        );
      }
      if (fieldName === "parent_id") {
        actions.setFieldError("categoryParent", response.errors[fieldName]);
      }
      toast.add({
        severity: "error",
        summary: "Request failed",
        detail: response.errors[fieldName].join(" , "),
        life: 3000,
      });
    });

    return;
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
  if (props.categoryData) {
    props.categoryData.image_url = "";
  }
};

const onSelectedFiles = (event: any) => {
  const [_file] = event.files;
  fileToUp.value = _file;
  files.value = event.files;
  categoryImage.value = _file.name;
};
</script>

<template>
  <div>
    <form
      class="flex flex-col gap-3"
      enctype="multipart/form-data"
      @submit.prevent="onSubmit"
    >
      <InputText
        v-model="categoryName"
        class="mt-1"
        aria-describedby="text-name"
        placeholder="Enter Category Name"
        required
        type="text"
      />
      <span class="text-red-400 text-xs">{{ errors.categoryName }}</span>

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
                    @click="onRemoveTemplatingFile(removeFileCallback, index)"
                  />
                </div>
              </div>
            </div>
            <div v-else-if="categoryData?.image_url">
              <div
                class="card w-full m-0 px-6 flex justify-between border-1 surface-border items-center gap-3"
              >
                <div>
                  <img
                    role="presentation"
                    :alt="categoryData.name"
                    :src="categoryData.image_url"
                    width="100"
                    height="50"
                  />
                </div>
                <span class="font-semibold">{{ categoryData.name }}</span>
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
              v-if="!categoryData?.image_url"
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
      <span class="text-red-400 text-xs">{{ errors.categoryImage }}</span>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <InputText
            id="meta-title"
            v-model="categoryMetaTitle"
            aria-describedby="text-meta-title"
            placeholder="Enter Meta-title of the category"
            required
            type="text"
            class="w-full"
          />
          <span class="text-red-400 text-xs">{{
            errors.categoryMetaTitle
          }}</span>
        </div>
        <div>
          <Dropdown
            v-model="categoryVisibilityStatus"
            :options="statusOptions"
            option-label="name"
            option-value="value"
            placeholder="Select a Status"
            checkmark
            :highlight-on-select="false"
            class="w-full"
          />
          <span class="text-red-400 text-xs">{{
            errors.categoryVisibilityStatus
          }}</span>
        </div>
      </div>

      <Dropdown
        id="parent"
        v-model="categoryParent"
        :options="[
          { id: '', name: 'None', parent_id: null },
          ...flattenCategories,
        ]"
        filter
        option-label="name"
        option-value="id"
        placeholder="Select Parent Category"
        checkmark
      />
      <span class="text-red-400 text-xs">{{ errors.categoryParent }}</span>

      <Textarea
        v-model="categoryMetaDescription"
        aria-describedby="text-meta-description"
        auto-resize
        placeholder="Enter Meta Description"
        required
        rows="3"
      />
      <span class="text-red-400 text-xs">{{
        errors.categoryMetaDescription
      }}</span>

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
</style>
