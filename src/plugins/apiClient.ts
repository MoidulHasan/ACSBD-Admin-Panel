export default defineNuxtPlugin((nuxtApp) => {
  const { appUrl } = useRuntimeConfig().public;

  const apiClient = $fetch.create({
    baseURL: appUrl + "/api/proxy",

    onRequest({ request, options, error }) {
      const token = useCookie("token");

      // eslint-disable-next-line
      console.log("API call happened, here is all data - ", {
        request,
        options,
        error,
      });

      if (token.value) {
        const headers = (options.headers ||= {});

        if (Array.isArray(headers)) {
          headers.push(["Authorization", `Bearer ${token.value}`]);
        } else if (headers instanceof Headers) {
          headers.set("Authorization", `Bearer ${token.value}`);
        } else {
          headers.Authorization = `Bearer ${token.value}`;
        }
      }
    },

    async onResponseError({ response }) {
      // eslint-disable-next-line
      console.log("Error Response - ", response);

      if (response.status === 401) {
        await nuxtApp.runWithContext(() => navigateTo({ name: "login" }));
      }
    },
  });

  return {
    provide: {
      apiClient,
    },
  };
});
