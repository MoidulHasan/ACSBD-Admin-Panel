<script setup lang="ts">
definePageMeta({
  name: "create-new-work",
});

useHead({
  title: "Create New Work History",
});

const route = useRoute();
</script>

<template>
  <div>
    <h1>Create New</h1>
    {{ route.params.id }}
  </div>
</template>

<style scoped></style>
