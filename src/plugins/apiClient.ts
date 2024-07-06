export default defineNuxtPlugin(() => {
  const { appUrl } = useRuntimeConfig().public;

  const apiClient = $fetch.create({
    baseURL: appUrl + "/api/proxy",

    onRequest({ request, options, error }) {
      // eslint-disable-next-line
      console.log("API call happened, here is all data - ", {
        request,
        options,
        error,
      });

      // Todo: preprocess request
    },

    // eslint-disable-next-line require-await
    async onResponseError({ response }) {
      // eslint-disable-next-line
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
