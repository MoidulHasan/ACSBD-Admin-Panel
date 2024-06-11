<script setup lang="ts">
import * as yup from "yup";
import type { ICollection, IStatus } from "~/app/interfaces/products";
import { useToast } from "#imports";
import type { ICreateResponse } from "~/app/interfaces/common";

interface IProps {
  collectionData?: ICollection;
}
const props = defineProps<IProps>();
const emits = defineEmits<{
  (e: "onFormSubmit"): void;
}>();

const toast = useToast();
const { $apiClient } = useNuxtApp();
const store = useStore();

const statuses = ref<IStatus[]>([
  { name: "Active", code: "public" },
  { name: "Inactive", code: "private" },
]);

const getVisibilityStatus = (status: string) => {
  return status === "Active" ? "public" : "private";
};

const validationSchema = yup.object({
  collectionTitle: yup.string().required("Collection Name Is Required"),
  collectionStatus: yup.string().required("Collection Status Is Required"),
});

const { handleSubmit, errors, handleReset, meta } = useForm({
  validationSchema,
  initialValues: {
    collectionTitle: props.collectionData?.title ?? "",
    collectionStatus: props.collectionData
      ? getVisibilityStatus(props.collectionData?.status)
      : "",
  },
});
const { value: collectionTitle } = useField("collectionTitle");
const { value: collectionStatus } = useField("collectionStatus");

const onSubmit = handleSubmit(async (values, actions) => {
  const handleResponseErrors = (responseErrors) => {
    Object.keys(responseErrors).forEach((fieldName) => {
      if (fieldName === "title") {
        actions.setFieldError("collectionTitle", responseErrors[fieldName]);
      }
      if (fieldName === "status") {
        actions.setFieldError("collectionStatus", responseErrors[fieldName]);
      }
      toast.add({
        severity: "error",
        summary: "Request Failed",
        detail: responseErrors[fieldName].join(" , "),
        life: 3000,
      });
    });
  };
  const handleSuccess = (message: string) => {
    toast.add({
      severity: "success",
      summary: "Request Success",
      detail: message,
      life: 3000,
    });

    emits("onFormSubmit");
  };

  const makeRequest = async (url, method, body) => {
    store.loading = true;
    const response = await $apiClient<ICreateResponse>(url, {
      method,
      body,
    }).catch((error) => error.data);
    store.loading = false;
    return response;
  };

  const requestBody = {
    title: values.collectionTitle,
    status: values.collectionStatus,
  };

  let response;

  if (!props.collectionData) {
    response = await makeRequest("/admin/collections", "POST", requestBody);
  } else {
    response = await makeRequest(
      `/admin/collections/${props.collectionData.slug}`,
      "PUT",
      requestBody,
    );
  }

  if (response.errors) {
    handleResponseErrors(response.errors);
    return;
  }

  handleSuccess(response.message);
});
</script>

<template>
  <div class="bg-white">
    <form @submit.prevent="onSubmit">
      <div class="flex flex-col gap-2">
        <label for="coll-name">Collection Name</label>
        <InputText
          id="coll-name"
          v-model="collectionTitle"
          :invalid="!!errors[`collectionTitle`]"
          placeholder="Summer Collection"
        />
        <span class="text-red-400 text-xs">{{ errors.collectionTitle }}</span>
      </div>
      <div class="mt-5 flex flex-col gap-2">
        <label for="coll-status">Collection Status</label>
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
