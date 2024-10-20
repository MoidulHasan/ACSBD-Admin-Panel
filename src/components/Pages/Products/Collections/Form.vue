<script setup lang="ts">
import * as yup from "yup";
import type { ICollection, IStatus } from "~/app/interfaces/products";
import { useToast } from "#imports";
import { useCollectionStore } from "~/stores/collectionStore";

interface IProps {
  collectionData?: ICollection;
}
const props = defineProps<IProps>();
const emits = defineEmits<{
  (e: "onFormSubmit"): void;
}>();

const toast = useToast();
const store = useStore();
const { collections, createCollection, updateCollection } =
  useCollectionStore();

const statuses = ref<IStatus[]>([
  { name: "Public", code: "public" },
  { name: "Hidden", code: "private" },
]);

const validationSchema = yup.object({
  collectionTitle: yup
    .string()
    .required("Collection Name Is Required")
    .test("isExit", "The name has already been taken", (value) => {
      return !collections.some((collection) => {
        const lowerCaseValue = value.toLowerCase();
        const collectionTitle = collection.title.toLowerCase();

        if (props?.collectionData) {
          return (
            lowerCaseValue !== props?.collectionData.title.toLowerCase() &&
            lowerCaseValue === collectionTitle
          );
        }

        return lowerCaseValue === collectionTitle;
      });
    }),
  collectionStatus: yup.string().required("Collection Status Is Required"),
});

const { handleSubmit, errors, handleReset, meta } = useForm({
  validationSchema,
  initialValues: {
    collectionTitle: props.collectionData?.title ?? "",
    collectionStatus: props.collectionData?.status ?? "",
  },
});
const { value: collectionTitle } = useField("collectionTitle");
const { value: collectionStatus } = useField("collectionStatus");

const onSubmit = handleSubmit(async (values, actions) => {
  const requestBody = {
    title: values.collectionTitle,
    status: values.collectionStatus,
  };

  const response = props.collectionData
    ? await updateCollection(props.collectionData.slug, requestBody)
    : await createCollection(requestBody);

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
      if (fieldName === "title") {
        actions.setFieldError("collectionTitle", response.errors[fieldName]);
      }
      if (fieldName === "status") {
        actions.setFieldError("collectionStatus", response.errors[fieldName]);
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
</script>

<template>
  <div class="bg-white">
    <form @submit.prevent="onSubmit">
      <div class="flex flex-col gap-2">
        <label for="coll-name">*Collection Name</label>
        <InputText
          id="coll-name"
          v-model="collectionTitle"
          :invalid="!!errors[`collectionTitle`]"
          placeholder="Summer Collection"
        />
        <span class="text-red-400 text-xs">{{ errors.collectionTitle }}</span>
      </div>
      <div class="mt-5 flex flex-col gap-2">
        <label for="coll-status">*Collection Status</label>
        <Dropdown
          id="coll-status"
          v-model="collectionStatus"
          :options="statuses"
          :invalid="!!errors[`collectionStatus`]"
          option-label="name"
          option-value="code"
          placeholder="Select a Status"
          checkmark
          :highlight-on-select="false"
          class="w-full"
        />
        <span class="text-red-400 text-xs">{{ errors.collectionStatus }}</span>
      </div>
      <div class="mt-5 flex justify-end gap-2">
        <Button
          :disabled="store.loading"
          class="action-button"
          type="button"
          @click="handleReset"
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
