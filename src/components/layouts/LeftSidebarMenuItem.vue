<template>
  <li>
    <div
      class="nav-item cursor-pointer flex items-center justify-between"
      :class="{ rounded: !isRoot }"
      @click="handleNavItemClick"
    >
      <div class="flex items-center">
        <i v-if="item.icon" :class="item.icon" />
        <img
          v-else-if="item.iconImageUrl"
          :src="item.iconImageUrl"
          :alt="item.label"
        />

        <span class="item-label">
          {{ item.label }}
        </span>
      </div>

      <i
        v-if="item.items"
        :class="['pi ', isExpanded ? 'pi-angle-up' : 'pi-angle-down']"
      />
    </div>

    <ul v-show="item.items" class="sub-items" :class="{ hidden: !isExpanded }">
      <LayoutsLeftSidebarMenuItem
        v-for="(item, index) in item.items"
        :key="item.label"
        :item="item"
        :index="index"
        :is-root="false"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import type { IMenuItem } from "~/app/interfaces/sidebar";

const props = defineProps<{
  item: IMenuItem;
  index: number;
  isRoot: boolean;
}>();

const isExpanded = ref(false);

const handleNavItemClick = () => {
  if (props.item.items?.length) {
    isExpanded.value = !isExpanded.value;
  }

  if (props.item.navigateTo) {
    navigateTo(props.item.navigateTo);
  }
};
</script>

<style lang="scss" scoped>
.nav-item {
  height: 40px;
  padding: 24px 10px;

  &:hover {
    background-color: #1476bf;
    color: white;
  }
}

.item-label {
  margin-left: 12px;
}

.sub-items {
  padding: 10px 24px;
}
</style>
