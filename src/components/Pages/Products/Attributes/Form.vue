<script setup lang="ts">
import * as yup from "yup";

interface IProps {
  attrName?: string;
  attrValues?: string[];
}

const props = defineProps<IProps>();

const emits = defineEmits<{
  (e: "onFormSubmit"): void;
}>();

const store = useStore();
const { $apiClient } = useNuxtApp();

const validationSchema = yup.object({
  attributeName: yup.string().required("Attribute name is required"),
  attributeValues: yup
    .array()
    .of(yup.string().required("Value is required"))
    .required("Value is required"),
});

const { handleSubmit, errors, submitCount, handleReset } = useForm({
  validationSchema,
  initialValues: {
    attributeName: props.attrName ?? "",
    attributeValues: props.attrValues ?? [""],
  },
});

const { value: attributeName } = useField("attributeName");
const {
  push,
  remove,
  fields: attributeValues,
} = useFieldArray("attributeValues");

const placeHolderValues = ref(["White", "Red", "Blue"]);

const onSubmit = handleSubmit(async (values) => {
  if (!props.attrName && !props.attrValues) {
    try {
      store.loading = true;

      const response = await $apiClient("/admin/attributes", {
        method: "POST",
        body: {
          name: values.attributeName,
          values: values.attributeValues,
        },
      });

      store.loading = false;

      console.log(response);

      emits("onFormSubmit");
    } catch (error) {
      store.loading = false;

      // Handle the error
      console.error("An error occurred while submitting the form:", error);
    }
  }
});
</script>

<template>
  <div class="bg-white">
    <form @submit.prevent="onSubmit">
      <div class="flex flex-col gap-2">
        <label for="attr-name">Attribute Name</label>

        <InputText id="attr-name" v-model="attributeName" placeholder="Color" />
        <span class="text-red-400 text-xs">{{ errors.attributeName }}</span>
      </div>

      <div class="mt-5">
        <p class="flex justify-between">
          <label for="attr-values">Attribute Values</label>
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
                :placeholder="placeHolderValues[index]"
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
          class="action-button"
          type="button"
          @click="handleReset"
        >
          Reset
        </Button>
        <Button
          :disabled="store.loading"
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
.add-more-button {
  @apply flex items-center justify-center gap-1 border rounded py-1;

  color: var(--dark-gray-80);
  height: 45px;

  &:hover {
    border-color: var(--primary-color-envitect-sam-blue);
    color: var(--primary-color-envitect-sam-blue);
  }
}

.action-button {
  width: 154px;
  height: 48px;

  box-sizing: border-box;

  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 12px 48px;
  gap: 12px;

  border-radius: 4px;

  background: #f8f8f8;
  color: #a5a5a5;
}

.submit-button {
  background: var(--primary-color-envitect-sam-blue);
  color: var(--primary-color-white);
}
</style>
