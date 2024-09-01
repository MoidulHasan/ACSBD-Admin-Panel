<script setup lang="ts">
import type { IPaginatedResponse } from "~/app/interfaces/common";
import type { IProduct } from "~/app/interfaces/products";

useHead({
  title: "Update Recent Work",
});

definePageMeta({
  name: "update-work",
});

const { $apiClient } = useNuxtApp();
const route = useRoute();

const { data: productData, refresh } = await useAsyncData(
  `/admin/works/${route.params.id}`,
  () => $apiClient(`/admin/works/${route.params.id}`),
);
</script>

<template>
  <div>
    <PagesRecentWorksForm
      :work-data="productData?.data"
      @on-form-submit="refresh"
    />
  </div>
</template>

<style scoped></style>
