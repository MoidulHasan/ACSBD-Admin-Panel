<script setup lang="ts">
import type { IPaginatedResponse } from "~/app/interfaces/common";
import type { IProduct } from "~/app/interfaces/products";

useHead({
  title: "Edit | Products",
});

definePageMeta({
  name: "product-edit",
});

const { $apiClient } = useNuxtApp();
const route = useRoute();

const { data: productData, refresh } = await useAsyncData<
  IPaginatedResponse<IProduct>
>(`/admin/products/${route.params.slug}`, () =>
  $apiClient(`/admin/products/${route.params.slug}`),
);
</script>

<template>
  <div>
    <PagesProductsForm
      v-if="productData?.data"
      :product-data="productData.data"
      @on-form-submit="refresh"
    />

    <div v-else>
      <CommonNoDataFound />
    </div>
  </div>
</template>

<style scoped></style>
