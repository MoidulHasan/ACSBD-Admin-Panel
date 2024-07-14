<script setup lang="ts">
import * as yup from "yup";
import type { IStock } from "~/app/interfaces/products";
import { type ICreateResponse, useToast } from "#imports";
const { $apiClient } = useNuxtApp();

interface IProps {
  stockData?: IStock;
}
const props = defineProps<IProps>();
const emits = defineEmits<{
  (e: "onFormSubmit"): void;
}>();

const toast = useToast();
const store = useStore();

const validationSchema = yup.object({
  productId: yup.number().required("Product ID Is Required"),
  quantity: yup.number().required("Stock Quantity Is Required"),
});

const { handleSubmit, errors, handleReset, meta } = useForm({
  validationSchema,
  initialValues: {
    productId: props.stockData?.product_id ?? "",
    quantity: props.stockData?.quantity ?? "",
  },
});
const { value: productId } = useField("productId");
const { value: quantity } = useField("quantity");

const onSubmit = handleSubmit(async (values, actions) => {
  const requestBody = {
    product_id: values.productId,
    quantity: values.quantity,
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

  const response = props.stockData
    ? await makeRequest(
        `/admin/stocks/${props.stockData.product_id}`,
        "PUT",
        requestBody,
      )
    : await makeRequest("/admin/stocks", "POST", requestBody);

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
      if (fieldName === "productId") {
        actions.setFieldError("productId", response.errors[fieldName]);
      }
      if (fieldName === "quantity") {
        actions.setFieldError("quantity", response.errors[fieldName]);
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
        <label for="productId">Product Id</label>
        <InputNumber
          id="productId"
          v-model="productId"
          :class="{ 'cursor-not-allowed': stockData?.product_id }"
          :disabled="stockData?.product_id"
          :invalid="!!errors[`productId`]"
          placeholder="Enter Product Id"
        />
        <span class="text-red-400 text-xs">{{ errors.productId }}</span>
      </div>
      <div class="flex flex-col gap-2">
        <label for="quantity">Product Stock Quantity</label>
        <InputNumber
          id="quantity"
          v-model="quantity"
          :invalid="!!errors[`quantity`]"
          placeholder="Enter Product Quantity"
        />
        <span class="text-red-400 text-xs">{{ errors.quantity }}</span>
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
