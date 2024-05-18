export const useStore = defineStore("mainStore", {
  state: () => ({
    loading: false,
  }),

  actions: {
    setLoading(value: boolean) {
      this.loading = value;
    },
  },
});
