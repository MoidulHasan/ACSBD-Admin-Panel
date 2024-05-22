<script setup lang="ts"></script>

<template>
  <div class="flex h-screen overflow-hidden">
    <LayoutsLeftSidebar />

    <div
      class="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
    >
      <LayoutsHeader />

      <main>
        <div class="page-container mx-auto px-8 py-4">
          <slot />
        </div>
      </main>
    </div>

    <ClientOnly>
      <Toast />
    </ClientOnly>
  </div>
</template>

<style scoped>
.page-container {
  background: #e5e5e5;
  min-height: calc(100vh - 70px);
}
</style>
