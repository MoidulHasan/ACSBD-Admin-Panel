<template>
  <div class="bg-white rounded-xl py-6 h-96">
    <div class="flex flex-col items-center justify-center h-full">
      <h1 class="message-title mb-5">Coming Soon</h1>
      <p class="message-subtitle mb-8">
        This page is under construction, it will be live soon...
      </p>

      <NuxtLink class="back-button" :to="{ name: 'dashboard' }">
        Back To Home
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.message-title {
  font-style: normal;
  font-weight: 700;
  font-size: 28px;
  line-height: 36px;

  text-align: center;

  color: var(--primary-color-navy-blue);
}

.message-subtitle {
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  text-align: center;

  color: var(--dark-gray-80);
}

.back-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 48px;
  gap: 12px;

  width: 212px;
  height: 48px;

  color: var(--primary-color-white);
  background: var(--primary-color-envitect-sam-blue);
  border-radius: 4px;
}
</style>
