<script setup lang="ts">
useHead({
  titleTemplate: (title) => `${title} | AC Service BD Admin Panel`,
});
</script>

<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
  </NuxtLayout>
</template>
