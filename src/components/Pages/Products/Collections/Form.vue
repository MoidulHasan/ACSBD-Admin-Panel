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
    .required("Collection name is required")
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
  collectionStatus: yup.string().required("Collection status is required"),
  isFeatured: yup.boolean().required("Feature status is required"),
  campaignEndingDate: yup.string().nullable(),
});

const { handleSubmit, errors, handleReset, meta } = useForm({
  validationSchema,
  initialValues: {
    collectionTitle: props.collectionData?.title ?? "",
    collectionStatus: props.collectionData?.status ?? "",
    isFeatured: props.collectionData?.is_featured ?? false,
    campaignEndingDate: props.collectionData?.campaign_ending_date ?? null,
  },
});
const { value: collectionTitle } = useField<string>("collectionTitle");
const { value: collectionStatus } = useField("collectionStatus");
const { value: isFeatured } = useField<boolean>("isFeatured");
const { value: campaignEndingDate } = useField<null | Date>(
  "campaignEndingDate",
);

const onSubmit = handleSubmit(async (values, actions) => {
  const requestBody = {
    title: values.collectionTitle,
    status: values.collectionStatus,
    is_featured: values.isFeatured,
    campaign_ending_date: values.campaignEndingDate,
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
      <CommonFormInput
        id="collectionTitle"
        label="Collection Title"
        required
        :error="errors.collectionTitle"
      >
        <InputText
          id="collectionTitle"
          v-model="collectionTitle"
          placeholder="Enter collection title"
          :invalid="!!errors.collectionTitle"
        />
      </CommonFormInput>

      <div class="grid grid-cols-3 gap-2 mt-5">
        <CommonFormInput
          id="collectionStatus"
          label="Status"
          required
          :error="errors.collectionStatus"
        >
          <Dropdown
            id="coll-status"
            v-model="collectionStatus"
            :options="statuses"
            :invalid="!!errors[`collectionStatus`]"
            option-label="name"
            option-value="code"
            placeholder="Select status"
            checkmark
            :highlight-on-select="false"
            class="w-full"
          />
        </CommonFormInput>

        <CommonFormInput
          id="isFeatured"
          label="Featured Collection"
          required
          :error="errors.isFeatured"
        >
          <SelectButton
            v-model="isFeatured"
            input-id="isPercent"
            :options="[
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ]"
            class="select-button"
            option-label="label"
            option-value="value"
          />
        </CommonFormInput>

        <CommonFormInput
          id="campaignEndingDate"
          label="End Date"
          required
          :error="errors.campaignEndingDate"
        >
          <Calendar
            v-model="campaignEndingDate"
            show-icon
            show-time
            icon-display="input"
            :invalid="!!errors.campaignEndingDate"
            date-format="yy-mm-dd"
            class="w-full"
          />
        </CommonFormInput>
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
