<template>
  <div class="flex h-screen overflow-hidden">
    <LayoutsLeftSidebar />

    <div
      class="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
    >
      <LayoutsHeader />

      <main>
        <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
