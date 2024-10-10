<script setup lang="ts">
import type { IPaginatedResponse } from "~/app/interfaces/common";
import type { IBlog } from "~/app/interfaces/webManagement";

useHead({
  title: "Edit | Blogs",
});

definePageMeta({
  name: "blog-edit",
});

const { $apiClient } = useNuxtApp();
const route = useRoute();

const { data: blogData, refresh } = await useAsyncData<
  IPaginatedResponse<IBlog>
>(`/admin/blogs/${route.params.slug}`, () =>
  $apiClient(`/admin/blogs/${route.params.slug}`),
);
</script>

<template>
  <div>
    <PagesWebManagementBlogsForm
      :blog-data="blogData?.data"
      @on-form-submit="refresh"
    />
  </div>
</template>

<style scoped></style>
