<script setup lang="ts">
import type {
  IBannerSliderImage,
  IDataResponse,
} from "~/app/interfaces/common";

useHead({
  title: "Slider Images | Website Management",
});
definePageMeta({
  name: "slider-images",
});

const { $apiClient } = useNuxtApp();

const {
  data: sliderImages,
  error,
  pending,
  refresh,
} = await useAsyncData<IDataResponse<IBannerSliderImage[]>>(
  "slider-image",
  () => $apiClient(`/admin/banner-and-sliders`),
  {
    transform: (data) => {
      return {
        ...data,
        data: data.data.filter((iData: IBannerSliderImage) => {
          return iData.type === "slider";
        }),
      };
    },
  },
);
console.log("IMAGES", sliderImages);
if (error.value) {
  console.error(error.value);
}
</script>

<template>
  <PagesWebManagementBannerSlidersForm
    :hero-images="sliderImages?.data"
    type="slider"
    @delete-image-file="refresh"
    @on-form-submit="refresh"
  />
</template>

<style scoped></style>
