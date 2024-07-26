<script setup lang="ts">
import * as yup from "yup";
import type { IStockWithName } from "~/app/interfaces/products";
import { type ICreateResponse, useToast } from "#imports";
const { $apiClient } = useNuxtApp();

interface IProps {
  stockData?: IStockWithName;
  operationType?: "Increase" | "Decrease";
}
const props = defineProps<IProps>();
const emits = defineEmits<{
  (e: "onFormSubmit"): void;
}>();

const toast = useToast();
const store = useStore();

const validationSchema = yup.object({
  productId: yup
    .number()
    .required("Product ID is required")
    .min(1, "Product ID cannot be negative or zero"),
  quantity: yup
    .number()
    .required("Stock Quantity is required")
    .min(1, "Quantity cannot be negative or zero")
    .max(10000, "Quantity cannot exceed 10000"),
});

const { handleSubmit, errors, handleReset, meta } = useForm({
  validationSchema,
  initialValues: {
    productId: props.stockData?.product_id ?? "",
    quantity: "",
  },
});
const { value: productId } = useField("productId");
const { value: quantity } = useField("quantity");

const onSubmit = handleSubmit(async (values, actions) => {
  const formData = new FormData();
  formData.append("product_id", values.productId);
  formData.append("quantity", values.quantity);

  // console.log(requestBody);

  const makeRequest = async (url, method, formData) => {
    store.loading = true;
    const response = await $apiClient<ICreateResponse>(url, {
      method,
      body: formData,
    }).catch((error) => error.data);
    store.loading = false;
    return response;
  };

  const response =
    props.operationType === "Increase"
      ? await makeRequest(`/admin/stocks`, "POST", formData)
      : await makeRequest(`/admin/stocks/delete`, "POST", formData);

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
      <div class="grid grid-cols-2 gap-2">
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
        <div
          class="flex flex-col gap-2"
          :title="stockData?.name"
          :class="{ 'cursor-not-allowed': stockData?.product_id }"
        >
          <label for="productName">Product Name</label>
          <InputText
            id="productName"
            :title="stockData?.name"
            :value="stockData?.name"
            :disabled="stockData?.product_id"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="quantity">
            {{ operationType }} Product Stock Quantity
          </label>
          <InputGroup id="quantity" class="w-full md:w-30rem">
            <InputGroupAddon>
              Existing Stock: {{ stockData?.quantity }}
            </InputGroupAddon>
            <InputGroupAddon>
              <i
                :class="
                  operationType === 'Increase' ? 'pi pi-plus' : 'pi pi-minus'
                "
              ></i>
            </InputGroupAddon>
            <InputNumber
              v-model="quantity"
              :invalid="!!errors[`quantity`]"
              :placeholder="
                operationType === 'Increase'
                  ? 'Additional Stock'
                  : 'Stock to Delete'
              "
              :max="operationType === 'Decrease' ? stockData?.quantity : 10000"
            />
          </InputGroup>
          <span class="text-red-400 text-xs">{{ errors.quantity }}</span>
        </div>
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
