<script setup lang="ts">
definePageMeta({
  name: "create-new-work",
});

useHead({
  title: "Create New Work History",
});

const redirect = async () => {
  await navigateTo({ name: "recent-works" });
};
</script>

<template>
  <div>
    <PagesRecentWorksForm @on-form-submit="redirect" />
  </div>
</template>

<style scoped></style>
