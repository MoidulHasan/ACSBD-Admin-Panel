<script setup lang="ts">
import * as yup from "yup";
import { useToast } from "#imports";
import type { IVisitorMessage } from "~/app/interfaces/webManagement";

const { $apiClient } = useNuxtApp();

interface IProps {
  messageData?: IVisitorMessage;
}
const props = defineProps<IProps>();
const emits = defineEmits<{
  (e: "onFormSubmit"): void;
}>();

const toast = useToast();
const store = useStore();

const messageStatuses = ["Pending", "Contacted"];

const validationSchema = yup.object({
  status: yup.string().required("Status Field is Required"),
  contactNote: yup.string(),
});

const { handleSubmit, errors, resetForm, meta } = useForm({
  validationSchema,
  initialValues: {
    status: props.messageData?.status ?? "",
    contactNote: props.messageData?.contact_note ?? "",
  },
});
const { value: status } = useField("status");
const { value: contactNote } = useField("contactNote");

const onSubmit = handleSubmit(async (values, actions) => {
  const requestBody = {
    status: values.status,
    contact_note: values.contactNote,
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

  const response = await makeRequest(
    `/admin/visitors-message/${props.messageData?.id}`,
    "PUT",
    requestBody,
  );

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
      if (fieldName === "status") {
        actions.setFieldError("status", response.errors[fieldName]);
      }
      if (fieldName === "contactNote") {
        actions.setFieldError("contactNote", response.errors[fieldName]);
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
    <form class="flex flex-col gap-3 p-2" @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-3">
        <div class="cursor-not-allowed">
          <InputText
            :value="messageData.name"
            disabled
            class="w-full"
            aria-describedby="visitor_name"
            required
            type="text"
          />
        </div>
        <div class="cursor-not-allowed">
          <InputText
            :value="messageData.phone"
            disabled
            class="w-full"
            aria-describedby="phone"
            type="number"
          />
        </div>
      </div>
      <div class="cursor-not-allowed">
        <InputText
          :value="messageData.email"
          disabled
          class="w-full"
          aria-describedby="email"
          type="email"
        />
      </div>
      <div class="cursor-not-allowed">
        <Textarea
          :value="messageData?.message"
          disabled
          class="w-full"
          aria-describedby="message"
          auto-resize
          rows="3"
        />
      </div>

      <div class="mt-5 flex flex-col gap-2">
        <label for="message-status">Message Status</label>
        <Dropdown
          id="message-status"
          v-model="status"
          :options="messageStatuses"
          :invalid="!!errors[`status`]"
          checkmark
          :highlight-on-select="false"
          class="w-full"
        />
        <span class="text-red-400 text-xs">{{ errors.status }}</span>
      </div>

      <div>
        <label for="contact-note">Contact Note</label>
        <Textarea
          id="contact-note"
          v-model="contactNote"
          class="w-full mt-2"
          aria-describedby="contact_note"
          auto-resize
          placeholder="Note for Visitor Contact (if any)"
          rows="3"
        />
        <span class="text-red-400 text-xs pt-1 w-full">{{
          errors.contactNote
        }}</span>
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
