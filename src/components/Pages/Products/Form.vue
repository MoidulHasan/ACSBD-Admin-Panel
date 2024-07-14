<script setup lang="ts">
import * as yup from "yup";
import { type IProduct, useCategoryStore, useCollectionStore } from "#imports";
import {
  requiredBoolean,
  requiredNumber,
  requiredString,
} from "~/app/utils/form-helpers";
import { statusOptions } from "~/app/constants/common";
import { useProductStore } from "~/stores/productStore";

interface IAttributeValue {
  attribute_id: number;
  value_ids: number[];
}

interface FormData {
  name: string;
  sku: string;
  category: number;
  brand: number;
  regularPrice: number;
  isPercent: boolean;
  discountAmount: number;
  finalPrice: number;
  visibilityStatus: string;
  installment?: string;
  description: string;
  shortDescription: string | null;
  metaTitle: string | null;
  metaTags: string[] | null;
  warrantyAndServices: string;
  collections: number[];
  attributes: IAttributeValue[];
  mainImage: File;
  galleryImages: File[];
}

interface IProps {
  productData?: IProduct;
}

const props = defineProps<IProps>();

const emits = defineEmits<{
  (e: "onFormSubmit"): void;
}>();

const store = useStore();
const toast = useToast();
const { createProduct, updateProduct } = useProductStore();

const discountTypeOptions = ref([
  { label: "Fixed", value: false },
  { label: "Percent", value: true },
]);

const { flattenCategories: categoryOptions, fetchCategories } =
  useCategoryStore();

const { brands: brandOptions, fetchBrands } = useBrandStore();
const { collections: collectionOptions, fetchCollections } =
  useCollectionStore();

const { attributes: attributeOptions, fetchAttributes } = useAttributeStore();

await Promise.all([
  useAsyncData("category-data", fetchCategories),
  useAsyncData("brand-data", fetchBrands),
  useAsyncData("collection-data", fetchCollections),
  useAsyncData("attributes-data", fetchAttributes),
]);

const validationSchema = yup.object({
  name: requiredString("Product name"),
  sku: requiredString("Product SKU"),
  category: requiredNumber("Product category"),
  brand: requiredNumber("Product brand"),
  regularPrice: requiredNumber("Regular price"),
  isPercent: requiredBoolean("Discount type"),
  discountAmount: requiredNumber("Discount amount")
    .test(
      "isPercentGreaterThan100",
      "Discount percent cannot be more than 100",
      function (value) {
        return this.parent.isPercent ? value <= 100 : true;
      },
    )
    .test(
      "isDiscountGreaterThanBasePrice",
      "Discount amount cannot be more than base price",
      function (value) {
        return this.parent.isPercent || !this.parent.regularPrice
          ? true
          : value <= this.parent.regularPrice;
      },
    ),
  finalPrice: requiredNumber("Final price"),
  visibilityStatus: requiredString("Product visibility status"),
  installment: yup.string().nullable(),
  description: requiredString("Description"),
  shortDescription: requiredString("Short Description"),
  warrantyAndServices: requiredString("Warranty And Services"),
  collections: yup.array().of(yup.number()),
  metaTitle: yup.string().nullable(),
  metaTags: yup.array().of(yup.string()).nullable(),
  attributes: yup.array().of(
    yup.object().shape({
      attribute_id: yup.number(),
      value_ids: yup.array().of(yup.number()),
    }),
  ),
  mainImage: yup.mixed(),
  galleryImages: yup.array().of(yup.mixed()),
});

const { handleSubmit, errors, handleReset, meta } = useForm<FormData>({
  validationSchema,
  initialValues: {
    name: props.productData?.name ?? "",
    sku: props.productData?.sku ?? "",

    category: props.productData?.category.id ?? undefined,
    brand: props.productData?.brand.id ?? undefined,

    regularPrice: props.productData?.price.base_price
      ? Number(props.productData?.price.base_price)
      : undefined,
    isPercent: !!props.productData?.price.is_percent,
    discountAmount: props.productData?.price.discount_amount
      ? Number(props.productData?.price.discount_amount)
      : 0,
    finalPrice: props.productData?.price.final_price
      ? Number(props.productData?.price.final_price)
      : undefined,

    installment: props.productData?.installment ?? "",
    visibilityStatus: props.productData?.visibility_status ?? undefined,

    shortDescription: props.productData?.short_description ?? "",
    warrantyAndServices: props.productData?.warranty_and_services ?? "",
    description: props.productData?.description ?? "",

    collections:
      props.productData?.collections?.map((collection) =>
        Number(collection.id),
      ) ?? undefined,

    attributes: attributeOptions.map((option) => ({
      attribute_id: option.id,
      value_ids:
        props.productData?.attributes
          .find((attribute) => attribute.id === option.id)
          ?.values?.map((value) => value.id) || [],
    })),

    mainImage: props.productData?.images[0].image_url
      ? [props.productData?.images[0].image_url]
      : undefined,

    metaTitle: props?.productData?.meta_title ?? undefined,
    metaTags: props?.productData?.meta_tags ?? undefined,
  },
});

const { value: name } = useField<string>("name");
const { value: sku } = useField<string>("sku");
const { value: category } = useField("category");
const { value: brand } = useField("brand");
const { value: visibilityStatus } = useField("visibilityStatus");
const { value: regularPrice } = useField<number>("regularPrice");
const { value: isPercent } = useField<boolean>("isPercent");
const { value: discountAmount } = useField<number>("discountAmount");
const { value: finalPrice, setValue: setFinalPrice } =
  useField<number>("finalPrice");
const { value: installment } = useField<string>("installment");
const { value: description } = useField<string>("description");
const { value: shortDescription } = useField<string>("shortDescription");
const { value: warrantyAndServices } = useField<string>("warrantyAndServices");
const { value: collections } = useField("collections");
const { value: metaTitle } = useField("metaTitle");
const { value: metaTags } = useField("metaTags");
const { fields: attributes } = useFieldArray<IAttributeValue[]>("attributes");
const { value: mainImage } = useField<File[]>("mainImage");
const { value: galleryImages } = useField<File[]>("galleryImages");

const computedFinalPrice = computed(() => {
  return isPercent.value
    ? regularPrice.value - (regularPrice.value * discountAmount.value) / 100
    : regularPrice.value - discountAmount.value;
});

const onSubmit = handleSubmit(async (values, actions) => {
  try {
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("sku", values.sku);
    formData.append("category_id", values.category.toString());
    formData.append("brand_id", values.brand.toString());
    formData.append("description", values.description);
    formData.append("warranty_and_services", values.warrantyAndServices);
    formData.append("visibility_status", values.visibilityStatus);
    formData.append("price[base_price]", values.regularPrice.toString());
    formData.append("price[is_percent]", JSON.stringify(values.isPercent));
    formData.append("price[discount_amount]", values.discountAmount.toString());
    formData.append("price[final_price]", values.finalPrice.toString());

    if (values.installment) formData.append("installment", values.installment);

    values.attributes.forEach((attribute: IAttributeValue, index) => {
      formData.append(
        `attributes[${index}][attribute_id]`,
        attribute.attribute_id.toString(),
      );
      attribute.value_ids.forEach((valueId, valueIndex) => {
        formData.append(
          `attributes[${index}][value_ids][${valueIndex}]`,
          valueId.toString(),
        );
      });
    });

    values.collections?.forEach((collectionId: number, index: number) => {
      formData.append(`collections[${index}]`, collectionId.toString());
    });

    formData.append("short_description", values.shortDescription || "");
    formData.append("meta_title", values.metaTitle || "");

    values.metaTags?.forEach((metaTag, index) => {
      formData.append(`meta_tags[${index}]`, metaTag);
    });

    if (values.mainImage && values.mainImage.length > 0) {
      formData.append("images[0]", values.mainImage[0]);
    }

    values.galleryImages.forEach((file, index) => {
      formData.append(`images[${index + 1}]`, file);
    });

    console.log("Formatted form data:", Object.fromEntries(formData.entries()));

    const response = props.productData
      ? await updateProduct(props.productData.slug, formData)
      : await createProduct(formData);

    if (!response.errors && response.message) {
      toast.add({
        severity: "success",
        summary: "Request Success",
        detail: response.message,
        life: 3000,
      });

      emits("onFormSubmit");
      actions.resetForm();
      return;
    }

    if (response.errors) {
      const fieldErrorMapping: Record<string, string> = {
        name: "name",
        sku: "sku",
        category_id: "category",
        brand_id: "brand",
        visibility_status: "visibilityStatus",
        "price[base_price]": "regularPrice",
        "price[is_percent]": "isPercent",
        "price[discount_amount]": "discountAmount",
        "price[final_price]": "finalPrice",
        description: "description",
        short_description: "shortDescription",
        warranty_and_services: "warrantyAndServices",
        meta_title: "metaTitle",
        meta_tags: "metaTags",
      };

      Object.keys(response.errors).forEach((fieldName) => {
        const mappedFieldName = fieldErrorMapping[fieldName] || fieldName;

        actions.setFieldError(
          mappedFieldName,
          response.errors[fieldName].join(", "),
        );
      });

      toast.add({
        severity: "error",
        summary: "Request failed",
        detail: Object.values(response.errors).flat().join(", "),
        life: 3000,
      });

      return;
    }

    toast.add({
      severity: "error",
      summary: "Request failed",
      detail: response.statusText,
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Request failed",
      detail: error.message || "An unknown error occurred",
      life: 3000,
    });
  }
});

watch(computedFinalPrice, (newVal) => setFinalPrice(newVal));
</script>

<template>
  <div class="form-container">
    <h2 class="form-title">Add New Product</h2>

    <form @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-5">
        <CommonFormInput
          id="name"
          label="Product Name"
          required
          :error="errors.name"
        >
          <InputText
            id="name"
            v-model="name"
            placeholder="Enter Product Name"
            :invalid="!!errors.name"
          />
        </CommonFormInput>

        <CommonFormInput
          id="sku"
          label="Product SKU"
          required
          :error="errors.sku"
        >
          <InputText
            id="sku"
            v-model="sku"
            placeholder="Enter Product SKU"
            :invalid="!!errors.sku"
          />
        </CommonFormInput>
      </div>

      <div class="grid grid-cols-2 gap-5 mt-4">
        <CommonFormInput
          id="category"
          label="Product Category"
          required
          :error="errors.category"
        >
          <Dropdown
            id="category"
            v-model="category"
            :options="categoryOptions"
            :invalid="!!errors.category"
            :loading="store.loading"
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
        </CommonFormInput>

        <CommonFormInput
          id="brand"
          label="Brand"
          required
          :error="errors.category"
        >
          <Dropdown
            id="brand"
            v-model="brand"
            :options="brandOptions"
            :loading="store.loading"
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
        </CommonFormInput>
      </div>

      <div class="grid grid-cols-4 gap-5 mt-4">
        <CommonFormInput
          id="regular-price"
          label="Regular Price"
          required
          :error="errors.regularPrice"
        >
          <InputNumber
            id="regular-price"
            v-model="regularPrice"
            placeholder="Enter Regular Price"
            :invalid="!!errors.regularPrice"
          />
        </CommonFormInput>

        <CommonFormInput
          id="isPercent"
          label="Discount Type"
          required
          :error="errors.isPercent"
        >
          <SelectButton
            v-model="isPercent"
            input-id="isPercent"
            :options="discountTypeOptions"
            class="select-button"
            option-label="label"
            option-value="value"
          />
        </CommonFormInput>

        <CommonFormInput
          id="discountAmount"
          :label="`Discount ${isPercent ? 'Percent' : 'Amount'}`"
          required
          :error="errors.discountAmount"
        >
          <InputNumber
            id="discountAmount"
            v-model="discountAmount"
            :placeholder="`Discount ${isPercent ? 'Percent' : 'Amount'}`"
            :invalid="!!errors.discountAmount"
          />
        </CommonFormInput>

        <CommonFormInput id="final-price" label="Final Price">
          <InputNumber
            id="final-price"
            v-model="finalPrice"
            placeholder="Final Price"
            readonly
            disabled
          />
        </CommonFormInput>
      </div>

      <div class="grid grid-cols-2 gap-5 mt-4">
        <CommonFormInput
          id="installment"
          label="Installment Policy(If Any)"
          :error="errors.installment"
        >
          <InputText
            id="installment"
            v-model="installment"
            placeholder="Enter Installment Policy"
            :invalid="!!errors.sku"
          />
        </CommonFormInput>

        <CommonFormInput
          id="visibilityStatus"
          label="Visibility Status"
          required
          :error="errors.visibilityStatus"
        >
          <Dropdown
            id="visibilityStatus"
            v-model="visibilityStatus"
            :options="statusOptions"
            :loading="store.loading"
            option-label="name"
            option-value="value"
            placeholder="Select Visibility Status"
            :invalid="!!errors.visibilityStatus"
          />
        </CommonFormInput>
      </div>

      <div class="grid grid-cols-2 gap-5 mt-4">
        <CommonFormInput
          id="shortDescription"
          label="Short Description"
          required
          :error="errors.shortDescription"
        >
          <CommonEditor
            id="shortDescription"
            v-model="shortDescription"
            minimal-toolbar
            :readonly="store.loading"
            :height="200"
            placeholder="Write short sescription"
          />
        </CommonFormInput>

        <CommonFormInput
          id="warrantyAndServices"
          label="Warranty And Services"
          required
          :error="errors.warrantyAndServices"
        >
          <CommonEditor
            id="warrantyAndServices"
            v-model="warrantyAndServices"
            minimal-toolbar
            :readonly="store.loading"
            :height="200"
            placeholder="Write about warranty and services"
          />
        </CommonFormInput>
      </div>

      <div class="grid grid-cols mt-4">
        <CommonFormInput
          id="description"
          label="Description"
          required
          :error="errors.description"
        >
          <CommonEditor
            id="description"
            v-model="description"
            :readonly="store.loading"
            :height="200"
            placeholder="Write product description"
          />
        </CommonFormInput>
      </div>

      <div class="grid grid-cols gap-5 mt-4">
        <CommonFormInput label="Add To Collection" :error="errors.collections">
          <div class="flex flex-wrap justify-content-center gap-3">
            <div
              v-for="collectionOption in collectionOptions"
              :key="collectionOption.title"
              class="flex align-items-center"
            >
              <Checkbox
                v-model="collections"
                name="collections"
                :input-id="collectionOption.title"
                :value="collectionOption.id"
              />

              <label :for="collectionOption.title" class="ml-2">
                {{ collectionOption.title }}
              </label>
            </div>
          </div>
        </CommonFormInput>
      </div>

      <div
        v-if="attributeOptions.length"
        class="flex flex-col mt-4 bg-color-light-gray-secondary p-3 rounded"
      >
        <label class="input-field-label mb-2">Add Additional Information</label>

        <div class="grid grid-cols-5 gap-2 bg-color-light-gray-secondary">
          <CommonFormInput
            v-for="(attributeOption, index) in attributeOptions"
            :id="attributeOption.slug"
            :key="attributeOption.slug"
            :label="attributeOption.name"
            :error="errors[`attributes[${index}]`]"
          >
            <MultiSelect
              :id="attributeOption.slug"
              v-model="attributes[index].value.value_ids"
              :options="attributeOption.values"
              :invalid="!!errors[`attributes[${index}]`]"
              :loading="store.loading"
              option-label="name"
              option-value="id"
              placeholder="Select"
            />
          </CommonFormInput>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-5 mt-5">
        <CommonFormInput
          id="main-image"
          label="Main Product Images"
          required
          :error="errors.mainImage"
        >
          <CommonCustomFileUpload
            v-model="mainImage"
            accept="image/*"
            name="mainImage"
          />
        </CommonFormInput>

        <CommonFormInput
          id="gallery-image"
          label="Gallery Images"
          required
          :error="errors.galleryImages"
        >
          <CommonCustomFileUpload
            v-model="galleryImages"
            accept="image/*"
            multiple
            name="galleryImages"
          />
        </CommonFormInput>
      </div>

      <div class="grid grid-cols-2 gap-5 mt-5">
        <CommonFormInput
          id="metaTitle"
          label="Meta Title"
          required
          :error="errors.metaTitle"
        >
          <InputText
            id="metaTitle"
            v-model="metaTitle"
            placeholder="Meta Title"
            :invalid="!!errors.metaTitle"
          />
        </CommonFormInput>

        <CommonFormInput id="metaTags" label="Tags" :error="errors.metaTags">
          <Chips
            id="metaTitle"
            v-model="metaTags"
            placeholder="Meta Title"
            :invalid="!!errors.metaTags"
          />
        </CommonFormInput>
      </div>

      <div class="mt-16 flex justify-end gap-2">
        <Button
          :disabled="store.loading"
          class="form-action-button"
          type="button"
          @click="handleReset"
        >
          Reset
        </Button>

        <Button
          class="form-action-button form-submit-button"
          :disabled="store.loading || !meta.valid || !meta.dirty"
          :loading="store.loading"
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
}
</style>

<style>
.select-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .p-button {
    width: 100%;
  }
}
</style>
