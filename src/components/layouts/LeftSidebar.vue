<template>
  <aside
    class="sidebar-container flex h-screen flex-col overflow-y-hidden bg-primary-navy-blue-100 duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 text-light-gray"
  >
    <div
      class="sidebar-logo flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5"
    >
      <NuxtLink :to="{ name: 'home-page' }">
        <img src="~/assets/images/logo/acsbd-logo-white.svg" alt="Logo" />
      </NuxtLink>
    </div>

    <ul class="layout-menu">
      <template v-for="(item, index) in items" :key="item">
        <LayoutsLeftSidebarMenuItem
          :item="item"
          :index="index"
          :is-root="true"
        />
      </template>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import type { IMenuItem } from "~/app/interfaces/sidebar";

const items = ref<IMenuItem[]>([
  {
    label: "Dashboard",
    icon: "pi pi-th-large",
  },
  {
    label: "Analysis Board",
    icon: "pi pi-chart-pie",
  },
  {
    label: "Manage Customers",
    icon: "pi pi-user",
  },
  {
    label: "Product",
    icon: "pi pi-shopping-cart",
    items: [
      {
        label: "Categories",
        navigateTo: "/product/categories",
      },
      {
        label: "Brands",
        navigateTo: "/product/brands",
      },
      {
        label: "Attributes",
        navigateTo: "/product/attributes",
      },
      {
        label: "Collections",
        navigateTo: "/product/product-collections",
      },
      {
        label: "Products",
        navigateTo: "/product/products",
      },
    ],
  },
]);
</script>

<style scoped lang="scss">
.sidebar-container {
  width: 280px;
}

.sidebar-logo {
  padding: 24px 17px;
}
</style>
