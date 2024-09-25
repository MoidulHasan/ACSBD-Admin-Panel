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

const refreshWork = async () => {
  await refresh();
};
</script>

<template>
  <div>
    <PagesRecentWorksForm
      :work-data="productData?.data"
      @on-form-submit="refreshWork"
      @on-image-delete="refreshWork"
    />
  </div>
</template>

<style scoped></style>
