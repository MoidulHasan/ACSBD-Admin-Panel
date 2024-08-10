<script setup lang="ts">
const props = defineProps<{
  item: IMenuItem;
  index: number;
  isRoot: boolean;
}>();

const route = useRoute();

const isActiveRoute = computed(() => route.path === props.item.navigateTo);

const isExpanded = ref(hasActiveChild(props.item));

const handleNavItemClick = async () => {
  if (props.item.items?.length) {
    isExpanded.value = !isExpanded.value;
  }

  if (props.item.navigateTo) {
    await navigateTo(props.item.navigateTo);
  }
};

function hasActiveChild(menuItem: IMenuItem) {
  if (route.path === menuItem.navigateTo) {
    return true;
  }

  if (menuItem.items) {
    for (const child of menuItem.items) {
      if (hasActiveChild(child)) {
        return true;
      }
    }
  }

  return false;
}
</script>

<template>
  <li>
    <div
      class="nav-item cursor-pointer flex items-center justify-between"
      :class="[{ 'active-nav': isActiveRoute }, { rounded: !isRoot }]"
      @click="handleNavItemClick"
    >
      <div class="flex items-center">
        <nuxt-icon
          v-if="item.icon && item.icon?.startsWith('li:')"
          :name="item.icon?.split(':')[1]"
        />
        <i v-else-if="item.icon" :class="item.icon" />
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
