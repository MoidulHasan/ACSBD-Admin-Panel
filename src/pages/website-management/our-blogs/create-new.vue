<script setup lang="ts">
useHead({
  title: "Create New Blog",
});

definePageMeta({
  name: "create-new-blog",
});

const redirectToBlogList = async () => {
  await navigateTo({ name: "our-blogs" });
};
</script>

<template>
  <div>
    <PagesWebManagementBlogsForm @on-form-submit="redirectToBlogList" />
  </div>
</template>

<style scoped></style>
