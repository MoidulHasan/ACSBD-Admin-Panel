export default defineNuxtPlugin(() => {
  const { appUrl } = useRuntimeConfig().public;

  const apiClient = $fetch.create({
    baseURL: appUrl + "/api/proxy",

    onRequest({ request, options, error }) {
      console.log("API call happened, here is all data - ", {
        request,
        options,
        error,
      });

      // Todo: preprocess request
    },

    async onResponseError({ response }) {
      console.log("Error Response - ", response);

      // Todo: handle error response
    },
  });

  return {
    provide: {
      apiClient,
    },
  };
});
