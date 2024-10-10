<script setup lang="ts">
import type {
  IBannerSliderImage,
  IDataResponse,
} from "~/app/interfaces/common";

useHead({
  title: "Banner Images | Website Management",
});
definePageMeta({
  name: "banner-images",
});

const { $apiClient } = useNuxtApp();

const { data: bannerImages, refresh } = await useAsyncData<
  IDataResponse<IBannerSliderImage[]>
>(
  "banner-image",
  () =>
    $apiClient(`/admin/banner-and-sliders`, {
      params: {
        is_latest: true,
      },
    }),
  {
    transform: (data) => {
      return {
        ...data,
        data: data.data.filter((iData: IBannerSliderImage) => {
          return iData.type === "banner";
        }),
      };
    },
  },
);

const maxItemsToUpload = computed(() => {
  return 3 - bannerImages.value?.data.length;
});
</script>

<template>
  <PagesWebManagementBannerSlidersForm
    :hero-images="bannerImages?.data"
    :max="maxItemsToUpload"
    type="banner"
    @delete-image-file="refresh"
    @on-form-submit="refresh"
  />
</template>

<style scoped></style>
