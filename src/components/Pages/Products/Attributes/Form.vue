<script setup lang="ts">
import * as yup from "yup";
import type { IProductAttribute } from "~/app/interfaces/products";

interface IProps {
  attributeData?: IProductAttribute;
}

const props = defineProps<IProps>();

const emits = defineEmits<{
  (e: "onFormSubmit"): void;
}>();

const store = useStore();
const attributeStore = useAttributeStore();
const { createAttribute, updateAttribute } = useAttributeStore();
const toast = useToast();

const validationSchema = yup.object({
  attributeName: yup
    .string()
    .required("Attribute name is required")
    .test("isExist", "The name has already been taken.", (value) => {
      return !attributeStore.attributes.some((attribute) => {
        const lowerCaseValue = value.toLowerCase();
        const attributeName = attribute.name.toLowerCase();

        if (props?.attributeData) {
          return (
            lowerCaseValue !== props?.attributeData.name.toLowerCase() &&
            lowerCaseValue === attributeName
          );
        }

        return lowerCaseValue === attributeName;
      });
    }),

  attributeValues: yup
    .array()
    .of(yup.string().required("Value is required"))
    .required("Value is required")
    .test(
      "unique",
      "Values must be unique",
      (values) => values.length === new Set(values).size,
    ),
});

const { handleSubmit, errors, submitCount, handleReset, meta } = useForm({
  validationSchema,
  initialValues: {
    attributeName: props.attributeData?.name ?? "",
    attributeValues: props.attributeData?.values.map((value) => value.name) ?? [
      "",
    ],
  },
});

const { value: attributeName } = useField("attributeName");
const {
  push,
  remove,
  fields: attributeValues,
} = useFieldArray("attributeValues");

const onSubmit = handleSubmit(async (values, actions) => {
  const requestBody = {
    name: values.attributeName,
    values: values.attributeValues,
  };

  const response = props.attributeData
    ? await updateAttribute(props.attributeData.slug, requestBody)
    : await createAttribute(requestBody);

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

  if (response.errors) {
    Object.keys(response.errors).forEach((fieldName) => {
      if (fieldName === "name") {
        actions.setFieldError("attributeName", response.errors[fieldName]);
      }

      if (fieldName === "values") {
        actions.setFieldError("attributeValues", response.errors[fieldName]);
      }

      toast.add({
        severity: "error",
        summary: "Request failed",
        detail: response.errors[fieldName].join(" , "),
        life: 3000,
      });
    });

    return;
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
    <form @submit.prevent="onSubmit">
      <div class="flex flex-col gap-2">
        <label for="attr-name">Attribute Name</label>

        <InputText
          id="attr-name"
          v-model="attributeName"
          :invalid="!!errors.attributeName"
        />
        <span class="text-red-400 text-xs">{{ errors.attributeName }}</span>
      </div>

      <div class="mt-5">
        <p class="flex justify-between">
          <label for="attr-values">Attribute Values</label>
          <span v-if="meta.dirty" class="text-red-400 text-xs">
            {{ errors.attributeValues }}
          </span>
        </p>

        <div id="attr-values" class="grid grid-cols-3 gap-4">
          <div
            v-for="(attrValue, index) in attributeValues"
            :key="'attrValue-' + attrValue.key"
            class="flex flex-col"
          >
            <InputGroup>
              <InputText
                v-model="attrValue.value"
                :invalid="
                  !!(errors[`attributeValues[${index}]`] && submitCount)
                "
              />
              <Button
                :disabled="attributeValues.length === 1"
                icon="pi pi-times"
                severity="danger"
                @click="() => attributeValues.length > 1 && remove(index)"
              />
            </InputGroup>

            <span v-if="submitCount" class="text-red-400 text-xs">
              {{ errors[`attributeValues[${index}]`] }}
            </span>
          </div>

          <button type="button" class="add-more-button" @click="() => push('')">
            <i class="pi pi-plus" /> Add More
          </button>
        </div>
      </div>

      <div class="mt-5 flex justify-end gap-2">
        <Button
          :disabled="store.loading"
          :class="'form-action-button'"
          type="button"
          @click="handleReset"
        >
          Reset
        </Button>
        <Button
          :disabled="store.loading || !meta.valid || !meta.dirty"
          :loading="store.loading"
          class="form-action-button form-submit-button"
          type="submit"
        >
          Submit
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped lang="postcss">
.add-more-button {
  @apply flex items-center justify-center gap-1 border rounded py-1;

  color: var(--dark-gray-80);
  height: 45px;

  &:hover {
    border-color: var(--primary-color-envitect-sam-blue);
    color: var(--primary-color-envitect-sam-blue);
  }
}
</style>
