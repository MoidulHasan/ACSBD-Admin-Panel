<script setup lang="ts">
// import type { IStock } from "~/app/interfaces/products";
import { type ICreateResponse, type IProduct, useToast } from "#imports";
const { $apiClient } = useNuxtApp();
interface Stock {
  product_id: number;
  quantity: number;
}

const props = defineProps<{
  productData: IProduct[];
}>();

const emits = defineEmits<{
  (e: "onStockAdd"): void;
}>();

const toast = useToast();
const stockData = ref<Stock[]>([]);
const store = useStore();
const addStockField = () => {
  stockData.value.push({
    product_id: 0,
    quantity: 0,
  });
};

const deleteStockField = (index: number) => {
  stockData.value.splice(index, 1);
};

const onSubmit = async () => {
  const requestBody = stockData.value;
  const makeRequest = async (url, method, body) => {
    store.loading = true;
    const response = await $apiClient<ICreateResponse>(url, {
      method,
      body,
    }).catch((error) => error.data);
    store.loading = false;
    return response;
  };

  const response = await makeRequest(`/admin/stocks`, "POST", requestBody);
  if (!response.errors && response.status && response.message) {
    toast.add({
      severity: "success",
      summary: "Request Success",
      detail: response.message,
      life: 3000,
    });

    emits("onStockAdd");
    return;
  }

  if (response.errors) {
    Object.keys(response.errors).forEach((fieldName) => {
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
};

onMounted(() => {
  addStockField();
});

const templateId = ref(1);
const options = [
  { id: 1, name: "Kuddus" },
  { id: 2, name: "Jabbar" },
];
</script>

<template>
  <div class="bg-while">
    <form @submit.prevent="onSubmit">
      <div
        v-for="(stock, index) in stockData"
        :key="`stock-${index}`"
        class="grid grid-cols-12 gap-4 mt-5"
      >
        <div class="col-span-5 flex flex-col gap-2">
          <label :for="`productId-${index}`">Product Name</label>
          <Dropdown
            :id="`productId-${index}`"
            v-model="stock.product_id"
            filter
            :options="productData"
            option-label="name"
            option-value="id"
            :virtual-scroller-options="{ itemSize: 40 }"
            class="w-full md:w-14rem"
          />
          <span v-if="stock.product_id < 1" class="text-red-400 text-xs">
            Invalid Product Name
          </span>
        </div>
        <div class="col-span-5 flex flex-col gap-2">
          <label :for="`quantity-${index}`">Product Stock Quantity</label>
          <InputNumber
            :id="`quantity-${index}`"
            v-model="stock.quantity"
            placeholder="Enter Product Quantity"
            :min="1"
            :max="10000"
          />
          <span v-if="stock.quantity < 1" class="text-red-400 text-xs">
            Invalid Quantity
          </span>
        </div>
        <div
          :class="[
            'col-span-2 text-center',
            stock.product_id < 1 || stock.quantity < 1
              ? 'place-content-center'
              : 'place-content-end',
          ]"
        >
          <Button
            v-if="index === stockData.length - 1"
            icon="pi pi-plus-circle"
            aria-label="Add"
            severity="info"
            :disabled="stock.product_id < 1 || stock.quantity < 1"
            @click="addStockField"
          />
          <Button
            v-else
            icon="pi pi-minus-circle"
            aria-label="Delete"
            severity="danger"
            @click="deleteStockField"
          />
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <Button
          :disabled="
            store.loading ||
            stockData.some(
              (stock) => stock.product_id < 1 || stock.quantity < 1,
            )
          "
          :loading="store.loading"
          class="action-button form-submit-button"
          type="submit"
        >
          Submit
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
