<script setup lang="ts">
interface IProps {
  required?: boolean;
  label?: string;
  error?: string;
  id?: string;
}

defineProps<IProps>();
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col gap-2">
      <label v-if="label" class="input-field-label" :for="id">
        <span v-if="required">*</span> {{ label }}
      </label>

      <slot />
    </div>

    <span class="h-4">
      <span v-if="error" class="text-red-400 text-xs">{{ error }}</span>
    </span>
  </div>
</template>
