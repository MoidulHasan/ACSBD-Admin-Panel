<template>
  <header
    class="header-container sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none"
  >
    <div
      class="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11"
    >
      <button class="border-0">
        <img src="~/assets/images/icons/menu-close.png" alt="menu close" />
      </button>
    </div>

    <div class="flex justify-between align-middle">
      <select
        v-model="colorMode.preference"
        class="border w-24 h-8 dark:bg-gray-900 dark:text-white dark:border-gray-700"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  </header>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
</script>

<style scoped lang="scss">
.header-container {
  height: 70px;
  padding: 24px 19px;
}
</style>
