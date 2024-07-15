<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{
  error: NuxtError;
}>();
</script>

<template>
  <div class="h-screen">
    <CommonError :error="error" />
  </div>
</template>
