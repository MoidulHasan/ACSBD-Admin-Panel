<script setup lang="ts">
import type { IMenuItem } from "~/app/interfaces/sidebar";

const props = defineProps<{
  item: IMenuItem;
  index: number;
  isRoot: boolean;
}>();

const route = useRoute();

const isExpanded = ref(false);
const isActiveRoute = computed(() => route.path === props.item.navigateTo);

const handleNavItemClick = () => {
  if (props.item.items?.length) {
    isExpanded.value = !isExpanded.value;
  }

  if (props.item.navigateTo) {
    navigateTo(props.item.navigateTo);
  }
};
</script>

<template>
  <li>
    <div
      class="nav-item cursor-pointer flex items-center justify-between"
      :class="[{ 'active-nav': isActiveRoute }, { rounded: !isRoot }]"
      @click="handleNavItemClick"
    >
      <div class="flex items-center">
        <i v-if="item.icon" :class="item.icon" />
        <img
          v-else-if="item.iconImageUrl"
          :src="item.iconImageUrl"
          :alt="item.label"
        />

        <span class="item-label"> {{ item.label }} </span>
      </div>

      <i
        v-if="item.items"
        :class="['pi ', isExpanded ? 'pi-angle-up' : 'pi-angle-down']"
      />
    </div>

    <ul v-show="item.items" class="sub-items" :class="{ hidden: !isExpanded }">
      <LayoutsLeftSidebarMenuItem
        v-for="subItem in item.items"
        :key="subItem.label"
        :item="subItem"
        :index="index"
        :is-root="false"
      />
    </ul>
  </li>
</template>

<style scoped>
.nav-item {
  height: 40px;
  padding: 24px 10px;

  &:hover {
    background-color: #1476bf;
    color: white;
  }
}

.active-nav {
  background-color: #1476bf;
  color: white;
}

.item-label {
  margin-left: 12px;
}

.sub-items {
  padding: 10px 24px;
}
</style>
