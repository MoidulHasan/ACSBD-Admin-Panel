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
    navigateTo: "/analysis-board",
  },
  {
    label: "Manage Customers",
    icon: "pi pi-user",
    navigateTo: "/customers",
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
      {
        label: "Stock Management",
        navigateTo: "/products/stock",
      },
    ],
  },
  {
    label: "Promotion",
    icon: "li:promotion",
    items: [
      {
        label: "Discounts",
        navigateTo: "/promotions/discounts",
      },
      {
        label: "Campaigns",
        navigateTo: "/promotions/campaigns",
      },
    ],
  },
  {
    label: "Promo Code",
    icon: "li:promo-code",
    navigateTo: "/promo-code",
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
        navigateTo: "/feedbacks/product-reviews",
      },
      {
        label: "Customer Testimonials",
        navigateTo: "/feedbacks/testimonials",
      },
    ],
  },
  {
    label: "Website Management",
    icon: "pi pi-globe",
    items: [
      {
        label: "Banner Images",
        navigateTo: "/website-management/banner-images",
      },
      {
        label: "Slider Images",
        navigateTo: "/website-management/slider-images",
      },
      {
        label: "Our Blogs",
        navigateTo: "/website-management/our-blogs",
      },
      {
        label: "Our Clients",
        navigateTo: "/website-management/our-clients",
      },
    ],
  },
  {
    label: "Work Pricing",
    icon: "li:work-pricing",
    navigateTo: "/work-pricing",
  },
  {
    label: "Contact Us",
    icon: "li:contact-us",
    navigateTo: "/contact-us",
  },
  {
    label: "FAQs",
    icon: "li:faq",
    navigateTo: "/faqs",
  },
  {
    label: "Chat Options",
    icon: "li:chat-options",
    items: [
      {
        label: "Visitors Message",
        navigateTo: "/chat-options/visitors-message",
      },
    ],
  },
  {
    label: "Showroom Management",
    icon: "li:showroom",
    navigateTo: "/showroom-management",
  },
]);
</script>

<template>
  <aside
    class="sidebar-container flex h-screen flex-col bg-primary-color-navy-blue duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 text-color-light-gray"
  >
    <div
      class="sidebar-logo flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5"
    >
      <NuxtLink :to="{ name: 'dashboard' }">
        <img src="~/assets/images/logo/acsbd-logo-white.svg" alt="Logo" />
      </NuxtLink>
    </div>

    <ul class="layout-menu flex-grow overflow-y-auto">
      <template v-for="(item, index) in items" :key="item.label">
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

.layout-menu::-webkit-scrollbar {
  width: 8px;
}

.layout-menu::-webkit-scrollbar-track {
  background: transparent;
}

.layout-menu::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.layout-menu {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.5) transparent;
}
</style>
