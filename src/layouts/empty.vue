<template>
  <div class="h-screen overflow-hidden">
    <main>
      <slot />
    </main>

    <ClientOnly>
      <Toast />
    </ClientOnly>
  </div>
</template>
