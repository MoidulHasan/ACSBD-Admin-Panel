<script setup lang="ts">
import type { IMenuItem } from "~/app/interfaces/sidebar";

const items = ref<IMenuItem[]>([
  {
    label: "Dashboard",
    icon: "pi pi-th-large",
    navigateTo: "/",
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
        navigateTo: "/products/categories",
      },
      {
        label: "Brands",
        navigateTo: "/products/brands",
      },
      {
        label: "Attributes",
        navigateTo: "/products/attributes",
      },
      {
        label: "Collections",
        navigateTo: "/products/product-collections",
      },
      {
        label: "Products",
        navigateTo: "/products",
      },
    ],
  },
  {
    label: "Orders",
    icon: "pi pi-book",
    items: [
      {
        label: "Product",
        navigateTo: "/orders/products",
      },
      {
        label: "Services",
        navigateTo: "/orders/services",
      },
    ],
  },
  {
    label: "Feedbacks",
    icon: "pi pi-comments",
    items: [
      {
        label: "Product Reviews",
        navigateTo: "/product/reviews",
      },
      {
        label: "Customer Testimonials",
        navigateTo: "/feedbacks/testimonials",
      },
    ],
  },
]);
</script>

<template>
  <aside
    class="sidebar-container flex h-screen flex-col overflow-y-hidden bg-primary-color-navy-blue duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 text-color-light-gray"
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

<style scoped>
.sidebar-container {
  width: 280px;
}

.sidebar-logo {
  padding: 24px 17px;
}
</style>
