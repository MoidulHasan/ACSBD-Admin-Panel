<script setup lang="ts">
import * as yup from "yup";
import type { CategoryData, IBrand } from "~/app/interfaces/products";

interface FormData {
  name: string;
  sku: string;
  category: number;
  brand: number;
  regularPrice: number;
}

const { $apiClient } = useNuxtApp();
const store = useStore();

const { data: categoryOptions } = useAsyncData<
  { data: CategoryData[] },
  { message: string },
  CategoryData[]
>("product-categories", () => $apiClient("/admin/categories"), {
  transform: (data) => {
    const flatList: CategoryData[] = [];

    function processItem(item: CategoryData) {
      flatList.push({
        id: item.id,
        name: item.name,
        slug: item.slug,
        image_url: item.image_url,
        parent_id: item.parent_id,
        visibility_status: item.visibility_status,
        meta_title: item.meta_title,
        meta_description: item.meta_description,
        created_at: item.created_at,
        updated_at: item.updated_at,
      });

      if (item.childrens && item.childrens.length > 0) {
        item.childrens.forEach((child) => processItem(child));
      }
    }

    data.data.forEach((item) => processItem(item));

    return flatList;
  },
});

const { data: brandOptions } = await useAsyncData<
  { data: IBrand[] },
  { message: string },
  IBrand[]
>("product-brands", () => $apiClient("/admin/brands"), {
  transform: (data) => {
    return data.data;
  },
});

const validationSchema = yup.object({
  name: yup.string().required("Product name is required"),
  sku: yup.string().required("Product SKU is required"),
  category: yup.number().required("Product category is required"),
  brand: yup.number().required("Product brand is required"),
  regularPrice: yup.number().required("Regular price is required"),
});

const { handleSubmit, errors, handleReset, meta } = useForm<FormData>({
  validationSchema,
  initialValues: {},
});

const { value: name } = useField("name");
const { value: sku } = useField("sku");
const { value: category } = useField("category");
const { value: brand } = useField("brand");
const { value: regularPrice } = useField("regularPrice");

const onSubmit = handleSubmit(async (values, actions) => {
  console.log(values);
  console.log(actions);
});
</script>

<template>
  <div class="form-container">
    <h2 class="form-title">Add New Product</h2>

    <form @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-5">
        <div class="flex flex-col gap-2">
          <label class="field-label" for="name">*Product Name</label>

          <InputText
            id="name"
            v-model="name"
            placeholder="Product Name"
            :invalid="!!errors.name"
          />
          <span class="text-red-400 text-xs">{{ errors.name }}</span>
        </div>

        <div class="flex flex-col gap-2">
          <label class="field-label" for="sku">*Product SKU</label>

          <InputText
            id="sku"
            v-model="sku"
            placeholder="Product SKU"
            :invalid="!!errors.sku"
          />
          <span class="text-red-400 text-xs">{{ errors.sku }}</span>
        </div>

        <div class="flex flex-col gap-2">
          <label class="field-label" for="category">*Product Category</label>
          <Dropdown
            id="category"
            v-model="category"
            :options="categoryOptions"
            :invalid="!!errors.category"
            option-label="name"
            option-value="id"
            placeholder="Select Category"
          >
            <template #option="slotProps">
              <div class="flex items-center gap-2">
                <img
                  v-if="slotProps.option.image_url"
                  :alt="slotProps.option.name"
                  :src="slotProps.option.image_url"
                  style="width: 18px"
                />
                <span> {{ slotProps.option.name }} </span>
              </div>
            </template>
          </Dropdown>

          <span class="text-red-400 text-xs">{{ errors.category }}</span>
        </div>

        <div class="flex flex-col gap-2">
          <label class="field-label" for="brand">*Brand</label>
          <Dropdown
            id="brand"
            v-model="brand"
            :options="brandOptions"
            option-label="name"
            option-value="id"
            placeholder="Select Brand"
            :invalid="!!errors.brand"
          >
            <template #option="slotProps">
              <div class="flex items-center gap-2">
                <img
                  v-if="slotProps.option.image_url"
                  :alt="slotProps.option.name"
                  :src="slotProps.option.image_url"
                  style="width: 18px"
                />
                <span> {{ slotProps.option.name }} </span>
              </div>
            </template>
          </Dropdown>

          <span class="text-red-400 text-xs">{{ errors.brand }}</span>
        </div>

        <div class="flex flex-col gap-2">
          <label class="field-label" for="brand">*Regular Price</label>
          <InputNumber
            id="regular-price"
            v-model="regularPrice"
            placeholder="Regular Price"
            :invalid="!!errors.regularPrice"
          />

          <span class="text-red-400 text-xs">{{ errors.regularPrice }}</span>
        </div>
      </div>

      <div class="mt-16 flex justify-end gap-2">
        <Button
          :disabled="store.loading"
          class="action-button"
          type="button"
          @click="handleReset"
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

<style scoped lang="postcss">
.form-container {
  background: var(--primary-color-white);

  width: 100%;
  height: 100%;
  border-radius: 12px;
  padding: 24px 40px;

  .form-title {
    width: 280px;
    height: 48px;
    margin-bottom: 32px;

    font-style: normal;
    font-weight: 600;
    font-size: 32px;
    line-height: 48px;

    display: flex;
    align-items: center;

    color: #3e3e3e;
  }

  .field-label {
    height: 24px;

    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;

    display: flex;
    align-items: center;

    color: #787878;
  }
}
</style>
