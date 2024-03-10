export const getBrands = async () => {
    const runtimeConfig = useRuntimeConfig();

    const { data, pending, error, refresh } = await useFetch(
        runtimeConfig.public.appUrl + "/api/proxy/admin/brands",
        {
            transform: (data)=> {
                return data.data;
            }
        }
    );

    return { data, pending, error, refresh };
};
