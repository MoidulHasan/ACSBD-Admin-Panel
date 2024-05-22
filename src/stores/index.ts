export const useStore = defineStore("mainStore", () => {
  const loading = ref(false);

  return { loading };
});
