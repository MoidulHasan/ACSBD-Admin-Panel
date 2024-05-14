<script setup lang="ts">
interface Props {
  totalPage: number;
}

withDefaults(defineProps<Props>(), {
  totalPage: 1,
});

const currentPage = defineModel("currentPage", { type: Number, default: 1 });

const numberRange = (start: number, end: number) => {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};
</script>

<template>
  <ul class="flex items-center justify-end">
    <li
      :class="[
        'pagination-item active-pagination-item',
        { 'pagination-item-disabled': currentPage === 1 },
      ]"
      @click="currentPage -= 1"
    >
      <i class="pi pi-angle-left" />
    </li>

    <li
      v-for="i in numberRange(
        Math.max(1, currentPage - 2),
        Math.min(currentPage + 2, totalPage),
      )"
      :key="i"
      :class="[
        'pagination-item',
        { 'active-pagination-item': i === currentPage },
      ]"
      @click="() => (currentPage = i)"
    >
      {{ i }}
    </li>

    <li
      :class="[
        'pagination-item active-pagination-item',
        { 'pagination-item-disabled': totalPage === currentPage },
      ]"
      @click="currentPage += 1"
    >
      <i class="pi pi-angle-right" />
    </li>
  </ul>
</template>

<style scoped lang="postcss">
.pagination-item {
  width: 32px;
  height: 32px;

  background: var(--dark-gray-10);
  border-radius: 2px;

  display: flex;
  justify-content: center;
  align-items: center;

  margin-left: 12px;

  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  text-align: center;

  cursor: pointer;

  &:hover {
    background: var(--primary-color-navy-blue);
    color: var(--primary-color-white);
  }
}

.active-pagination-item {
  background: var(--primary-color-navy-blue);
  color: var(--primary-color-white);
}

.pagination-item-disabled {
  background: var(--dark-gray-10);
  color: var(--primary-color-dark-gray);
  opacity: 0.5;
  pointer-events: none;
}
</style>
