<script setup lang="ts">
import * as yup from "yup";
import { useToast } from "#imports";
import type { IFAQ } from "~/app/interfaces/common";

const { $apiClient } = useNuxtApp();

interface IProps {
  faqData?: IFAQ;
}
const props = defineProps<IProps>();
const emits = defineEmits<{
  (e: "onFormSubmit"): void;
}>();

const toast = useToast();
const store = useStore();
const categoryOptions = [
  { name: "Service", code: "service" },
  { name: "AC Rent", code: "ac_rent" },
  { name: "Product", code: "product" },
  { name: "Policy", code: "policy" },
];
const questionStatus = [
  { name: "Public", code: true },
  { name: "Hidden", code: false },
];

const validationSchema = yup.object({
  question: yup.string().required("Question is Required"),
  status: yup.string().required("Status is Required"),
  answer: yup.string().required("Answer is Required"),
  category: yup.string().required("Category is Required"),
});

const { handleSubmit, errors, resetForm, meta } = useForm({
  validationSchema,
  initialValues: {
    question: props.faqData?.question ?? "",
    status: props.faqData?.status ?? "",
    answer: props.faqData?.answer ?? "",
    category: props.faqData?.category ?? "",
  },
});
const { value: question } = useField<string>("question");
const { value: status } = useField<boolean>("status");
const { value: answer } = useField<string | null>("answer");
const { value: category } = useField<string | null>("category");

const onSubmit = handleSubmit(async (values, actions) => {
  const requestBody = new FormData();

  requestBody.append("question", values.question);
  requestBody.append("status", values.status === true ? 1 : 0);
  requestBody.append("answer", values.answer);
  requestBody.append("category", values.category);

  if (props.faqData) {
    requestBody.append("id", props.faqData.id);
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

  const response = await makeRequest("/admin/faqs", "POST", requestBody);

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
      if (fieldName === "question") {
        actions.setFieldError("question", response.errors[fieldName]);
      }
      if (fieldName === "status") {
        actions.setFieldError("status", response.errors[fieldName]);
      }
      if (fieldName === "answer") {
        actions.setFieldError("answer", response.errors[fieldName]);
      }
      if (fieldName === "category") {
        actions.setFieldError("category", response.errors[fieldName]);
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
    <form
      class="flex flex-col gap-3 mb-1"
      enctype="multipart/form-data"
      @submit.prevent="onSubmit"
    >
      <div class="flex flex-col gap-1">
        <label for="meta-title">*Question</label>
        <InputText
          id="question"
          v-model="question"
          class="w-full"
          aria-describedby="text-question"
          placeholder="Enter Question"
          required
          type="text"
        />
        <span class="text-red-400 text-xs pt-1 w-full">{{
          errors.question
        }}</span>
      </div>

      <div class="flex flex-col gap-1">
        <label for="answer">*Answer to the Question Above</label>
        <Textarea
          id="answer"
          v-model="answer"
          aria-describedby="text-answer"
          placeholder="Enter Answer of the question"
          type="text"
          required
        />
        <span class="text-red-400 text-xs pt-1 w-full">{{
          errors.answer
        }}</span>
      </div>

      <div class="grid grid-cols-2 gap-3 mt-1">
        <div class="flex flex-col gap-1">
          <label for="cat-dropdown">*Question Category</label>
          <Dropdown
            id="cat-dropdown"
            v-model="category"
            :options="categoryOptions"
            option-label="name"
            option-value="code"
            placeholder="Select a Question Category"
            checkmark
            :highlight-on-select="false"
            required
          />
        </div>
        <div class="flex flex-col gap-1">
          <label for="status-dropdown">*Question Visibility Status</label>
          <Dropdown
            id="status-dropdown"
            v-model="status"
            :options="questionStatus"
            option-label="name"
            option-value="code"
            placeholder="Select a Status"
            checkmark
            :highlight-on-select="false"
            required
          />
        </div>
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
