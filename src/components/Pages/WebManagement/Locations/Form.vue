<script setup lang="ts">
import * as yup from "yup";
import { type ILocation, useToast } from "#imports";

const { $apiClient } = useNuxtApp();

interface IProps {
  locationData?: ILocation;
}
const props = defineProps<IProps>();
const emits = defineEmits<{
  (e: "onFormSubmit"): void;
}>();

const toast = useToast();
const store = useStore();

const locationTypes = ["Showroom", "Service Center"];

const validationSchema = yup.object({
  locationType: yup.string().required("Location Type is Required"),
  title: yup.string().required("Title is Required"),
  subTitle: yup.string().required("Sub Title is Required"),
  address: yup.string().required("Address is Required"),
  phone: yup.string().required("Phone Number is Required"),
  mapUrl: yup.string().required("Map URL  is Required"),
});

const { handleSubmit, errors, resetForm, meta } = useForm({
  validationSchema,
  initialValues: {
    locationType: props.locationData?.location_type ?? "",
    title: props.locationData?.title ?? "",
    subTitle: props.locationData?.subtitle ?? "",
    address: props.locationData?.address ?? "",
    phone: props.locationData?.phone ?? "",
    mapUrl: props.locationData?.map_url ?? "",
  },
});
const { value: locationType } = useField("locationType");
const { value: title } = useField("title");
const { value: subTitle } = useField("subTitle");
const { value: address } = useField("address");
const { value: phone } = useField("phone");
const { value: mapUrl } = useField("mapUrl");

const onSubmit = handleSubmit(async (values, actions) => {
  const requestBody = {
    location_type: values.locationType,
    title: values.title,
    subtitle: values.subTitle,
    address: values.address,
    phone: values.phone,
    map_url: values.mapUrl,
  };

  const makeRequest = async (url, method, body) => {
    store.loading = true;
    const response = await $apiClient<ICreateResponse>(url, {
      method,
      body,
    }).catch((error) => error.data);
    store.loading = false;
    return response;
  };

  const response = props.locationData
    ? await makeRequest(
        `/admin/our-locations/${props.locationData.id}`,
        "PUT",
        requestBody,
      )
    : await makeRequest("/admin/our-locations", "POST", requestBody);

  if (!response.errors && response.message) {
    toast.add({
      severity: "success",
      summary: "Request Success",
      detail: response.message,
      life: 3000,
    });

    emits("onFormSubmit");
    return;
  }

  // let response;

  if (response.errors) {
    Object.keys(response.errors).forEach((fieldName) => {
      if (fieldName === "locationType") {
        actions.setFieldError("locationType", response.errors[fieldName]);
      }
      if (fieldName === "title") {
        actions.setFieldError("title", response.errors[fieldName]);
      }
      if (fieldName === "subTitle") {
        actions.setFieldError("subTitle", response.errors[fieldName]);
      }
      if (fieldName === "address") {
        actions.setFieldError("address", response.errors[fieldName]);
      }
      if (fieldName === "phone") {
        actions.setFieldError("phone", response.errors[fieldName]);
      }
      if (fieldName === "mapUrl") {
        actions.setFieldError("mapUrl", response.errors[fieldName]);
      }
      toast.add({
        severity: "error",
        summary: "Request Failed",
        detail: response.errors[fieldName].join(" , "),
        life: 3000,
      });
    });
  }

  toast.add({
    severity: "error",
    summary: "Request failed",
    detail: response.statusText,
    life: 3000,
  });
});
</script>

<template>
  <div class="bg-white">
    <form
      class="flex flex-col gap-3 p-2"
      enctype="multipart/form-data"
      @submit.prevent="onSubmit"
    >
      <div class="grid grid-cols-2 gap-3">
        <div>
          <Dropdown
            id="coll-status"
            v-model="locationType"
            :options="locationTypes"
            :invalid="!!errors[`locationType`]"
            placeholder="Select a Location Type"
            checkmark
            :highlight-on-select="false"
            class="w-full"
          />
          <span class="text-red-400 text-xs">{{ errors.locationType }}</span>
        </div>
        <div class="">
          <InputText
            v-model="title"
            class="w-full"
            aria-describedby="location-tite"
            placeholder="Enter Location Title"
            required
            type="text"
          />
          <span class="text-red-400 text-xs pt-1 w-full">{{
            errors.title
          }}</span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="">
          <InputText
            v-model="subTitle"
            class="w-full"
            aria-describedby="location-subtitle"
            placeholder="Enter Location Sub Title"
            required
            type="text"
          />
          <span class="text-red-400 text-xs pt-1 w-full">{{
            errors.subTitle
          }}</span>
        </div>
        <div class="">
          <InputText
            v-model="phone"
            class="w-full"
            aria-describedby="location-number"
            placeholder="Enter Location Contact Number"
            required
            type="text"
          />
          <span class="text-red-400 text-xs pt-1 w-full">{{
            errors.phone
          }}</span>
        </div>
      </div>
      <div>
        <Textarea
          v-model="address"
          class="w-full"
          aria-describedby="location address"
          auto-resize
          placeholder="Enter Full Address of the Location"
          required
          rows="3"
        />
        <span class="text-red-400 text-xs pt-1 w-full">{{
          errors.address
        }}</span>
      </div>
      <div>
        <Textarea
          v-model="mapUrl"
          class="w-full"
          aria-describedby="review-description"
          auto-resize
          placeholder="Enter Google Map Shared URL"
          required
          rows="3"
        />
        <span class="text-red-400 text-xs pt-1">{{ errors.mapUrl }}</span>
      </div>
      <div v-if="mapUrl">
        <div class="rounded-lg w-full min-h-[40vh]">
          <iframe
            class="w-full map min-h-[40vh] rounded-lg"
            :src="mapUrl"
            style="border: 0"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      <div class="mt-5 flex justify-end gap-2">
        <Button
          :disabled="store.loading"
          class="action-button"
          type="button"
          @click="resetForm"
        >
          Reset
        </Button>
        <Button
          :disabled="store.loading || !meta.valid || !meta.dirty"
          :loading="store.loading"
          class="action-button submit-button"
          type="submit"
        >
          Submit
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.submit-button {
  background: var(--primary-color-envitect-sam-blue);
  color: var(--primary-color-white);
}
:deep(.p-rating-icon) {
  color: var(--color-orange);
}
</style>
