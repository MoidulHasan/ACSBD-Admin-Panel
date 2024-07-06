<script setup lang="ts">
defineProps<{
  id?: string;
  readonly?: boolean;
  minimalToolbar?: boolean;
  height?: number;
}>();

const model = defineModel<string>();
</script>

<template>
  <div>
    <Editor
      :id="id"
      v-model="model"
      class="p-rich-editor"
      :readonly="readonly"
      :editor-style="`height: ${height}px`"
    >
      <template v-if="minimalToolbar" #toolbar>
        <span class="ql-formats">
          <button v-tooltip.bottom="'Bold'" class="ql-bold" />
          <button v-tooltip.bottom="'Italic'" class="ql-italic" />
          <button v-tooltip.bottom="'Underline'" class="ql-underline" />
        </span>

        <span class="ql-formats">
          <select class="ql-color" />
          <select class="ql-background" />
        </span>

        <span class="ql-formats">
          <button class="ql-list" value="ordered" type="button" />
          <button class="ql-list" value="bullet" type="button" />
        </span>

        <span class="ql-formats">
          <button class="ql-clean" type="button" />
        </span>
      </template>
    </Editor>
  </div>
</template>

<style scoped lang="postcss">
.p-rich-editor {
  :deep(.p-editor-toolbar) {
    border-top-right-radius: 0.5rem;
    border-top-left-radius: 0.5rem;
    border-color: rgb(var(--surface-200));
  }

  :deep(.p-editor-content) {
    border-bottom-right-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
    border-color: rgb(var(--surface-200));
  }
}
</style>
