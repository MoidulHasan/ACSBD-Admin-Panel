<script setup lang="ts">
defineProps<{
  tableHeader?: string;
  addButtonLabel?: string;
  hideActions?: boolean;
}>();

const emits = defineEmits<{
  (e: "onAddButtonClicked"): void;
}>();

const searchText = defineModel("searchText", { type: String });
</script>

<template>
  <div>
    <div class="table-header">
      <h3 class="table-title">
        {{ tableHeader }}
      </h3>

      <div v-if="!hideActions" class="flex gap-3">
        <slot name="actions">
          <IconField icon-position="right">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="searchText" placeholder="Search..." />
          </IconField>

          <Button
            v-if="addButtonLabel"
            class="bg-primary-color-envitect-sam-blue px-6"
            :label="addButtonLabel"
            icon="pi pi-plus"
            @click="() => emits('onAddButtonClicked')"
          />
        </slot>
      </div>
    </div>

    <hr />
  </div>
</template>

<style scoped lang="postcss">
.table-header {
  height: 40px;
  @apply flex justify-between items-center px-5 mb-5;

  .table-title {
    @apply font-semibold text-xl leading-7 text-[#4a5d85];
  }
}
</style>
