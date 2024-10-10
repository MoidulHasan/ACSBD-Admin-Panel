<script setup lang="ts">
import * as yup from "yup";
import type {
  IBannerSliderImage,
  IDeleteResponse,
} from "~/app/interfaces/common";

interface FormData {
  images: File[] | string[];
}

interface IProps {
  heroImages?: IBannerSliderImage[];
  type: "banner" | "slider";
}

const { $apiClient } = useNuxtApp();

const props = defineProps<IProps>();
const emits = defineEmits<{
  (e: "onFormSubmit"): void;
  (e: "deleteImageFile"): void;
}>();

const store = useStore();
const toast = useToast();
const showDeleteConfirmModal = ref(false);
const imageIdToDelete = ref<number | null>(null);

// Create a reactive validation schema using yup.lazy
const validationSchema = computed(() =>
  yup.object({
    images: yup
      .array()
      .of(yup.mixed())
      .min(1)
      .max(props.type === "banner" ? 3 - (props.heroImages?.length || 0) : 6),
  }),
);

const { handleSubmit, errors, handleReset, meta } = useForm<FormData>({
  validationSchema,
});

const { value: images } = useField<File[] | string[]>("images");

const onSubmit = handleSubmit(async (values, actions) => {
  try {
    if (values.images?.length) {
      // Create an array of promises for all image uploads
      const uploadPromises = values.images.map((file) => {
        const formData = new FormData();

        if (typeof file !== "string") {
          formData.append("image", file);
          formData.append("type", props.type);
        }

        // Return the API call promise
        return $apiClient<IDeleteResponse>(`/admin/banner-and-sliders`, {
          method: "POST",
          body: formData,
        }).catch((error) => error.data); // Handle individual promise rejection
      });

      // Wait for all promises to resolve or reject
      const responses = await Promise.all(uploadPromises);

      // Handle each response
      responses.forEach((response) => {
        if (!response.errors && response.message) {
          toast.add({
            severity: "success",
            summary: "Image Uploaded",
            detail: response.message,
            life: 3000,
          });
        } else if (response.errors) {
          Object.keys(response.errors).forEach((fieldName) => {
            const mappedFieldName = fieldName;

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
        } else {
          toast.add({
            severity: "error",
            summary: "Request failed",
            detail: response.statusText,
            life: 3000,
          });
        }
      });

      // Emit the event after all uploads are complete
      emits("onFormSubmit");

      // Reset the form after processing all uploads
      actions.resetForm();
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Request failed",
      detail: error.message || "An unknown error occurred",
      life: 3000,
    });
  }
});

const deleteImage = async (fileId: string | number) => {
  if (!props?.heroImages.length) return;

  const response = await $apiClient<IDeleteResponse>(
    `/admin/banner-and-sliders/${fileId}`,
    {
      method: "DELETE",
    },
  ).catch((error) => error.data);

  if (response?.status) {
    // Update hero images or props if needed
    toast.add({
      severity: "success",
      summary: "Image Deleted",
      detail: response.message,
      life: 3000,
    });
    emits("deleteImageFile");
  } else {
    toast.add({
      severity: "error",
      summary: "Request failed",
      detail: response?.error || "An unknown error occurred",
      life: 3000,
    });
  }
  showDeleteConfirmModal.value = false;
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const showImageDeleteModal = (id: number) => {
  imageIdToDelete.value = id;
  showDeleteConfirmModal.value = true;
};

const handleDeleteConfirmation = async () => {
  await deleteImage(imageIdToDelete.value!);
};

const hideDeleteConfirmModal = () => {
  imageIdToDelete.value = null;
  showDeleteConfirmModal.value = false;
};
</script>

<template>
  <div class="form-container">
    <h2 class="form-title">
      {{ props.type === "banner" ? "Banner" : "Slider" }} Images
      {{ props.type === "banner" ? "(3 Items)" : "" }}
    </h2>
    <div class="grid grid-cols-3 gap-5 my-3">
      <div
        v-for="img in heroImages"
        :key="img.id"
        class="w-full image-container relative"
      >
        <span
          class="absolute right-4 top-4 cross-icon rounded-full text-red-600 hover:text-red-500 hover:scale-110 cursor-pointer transition duration-200 ease-in-out"
          title="Delete this image"
          @click="showImageDeleteModal(img?.id)"
        >
          <i class="pi pi-times-circle text-3xl font-extrabold" />
        </span>

        <NuxtImg
          class="w-full rounded-lg h-[30vh] border border-sky-950 hover:shadow-lg transition duration-200 ease-in-out"
          alt="Banner"
          :src="img.path"
        />
      </div>
    </div>

    <form
      v-if="
        (type === 'banner' &&
          props.heroImages &&
          props.heroImages.length < 3) ||
        type === 'slider'
      "
      @submit.prevent="onSubmit"
    >
      <div class="grid grid-cols gap-5 mt-5">
        <CommonFormInput
          id="gallery-image"
          :label="`Upload ${capitalizeFirstLetter(type)} Images`"
          required
          :error="errors.images"
        >
          <CommonCustomFileUpload
            v-model="images"
            class="custom-file-upload-component"
            accept="image/*"
            multiple
            name="images"
          />
        </CommonFormInput>
      </div>

      <div class="mt-4 flex justify-end gap-2">
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
  <ClientOnly>
    <CommonDeleteConfirmationModal
      v-model:visible="showDeleteConfirmModal"
      message="Are you sure to delete this image?"
      :disabled="store.loading"
      @on-confirm="handleDeleteConfirmation"
      @on-cancel="hideDeleteConfirmModal"
    />
  </ClientOnly>
</template>

<style scoped lang="postcss">
.form-container {
  background: var(--primary-color-white);

  width: 100%;
  height: 100%;
  border-radius: 12px;
  padding: 24px 40px;

  .image-container {
    border-radius: 0.5rem;
  }

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

  .custom-file-upload-component {
    :deep(img) {
      width: 100%;
      height: 20vh;
      border-radius: 0.5rem;
    }
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
