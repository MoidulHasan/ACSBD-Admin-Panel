<script setup lang="ts">
import { formatSize } from "~/utils/formatSize";

interface IProps {
  name: string;
  multiple?: boolean;
  fileLimit?: number;
  accept: string;
  maxFileSize?: number;
  required?: boolean;
}

withDefaults(defineProps<IProps>(), {
  multiple: false,
  maxFileSize: 100000000,
  required: false,
});

const emits = defineEmits<{
  (e: "deleteExistingFile", fileUrl: string): void;
}>();

const model = defineModel<Array<string | File>>({
  default: [],
});

const inputItem = ref<HTMLInputElement | null>(null);

const onRemoveFile = (
  file: File,
  removeFileCallback: Function,
  index: number,
) => {
  model.value = model.value
    .map((currfile: string | File) => {
      if (typeof currfile === "string") return currfile;

      if (currfile === file) {
        return null;
      }

      return currfile;
    })
    .filter((file) => file !== null);

  removeFileCallback(index);
};

const removeExistingFile = (fileUrl: string) => {
  emits("deleteExistingFile", fileUrl);
};

const onFileSelect = (event: any) => {
  model.value = [...model.value, ...event.files];
  clearFiles();
};

function clearFiles() {
  inputItem.value?.clear();
  inputItem.value.uploadedFileCount = 0;
}

watch(
  () => model.value,
  () => {
    if (!model.value.length) clearFiles();
  },
);
</script>

<template>
  <div>
    <FileUpload
      ref="inputItem"
      :name="name"
      :multiple="multiple"
      :accept="accept"
      :max-file-size="maxFileSize"
      @select="onFileSelect"
    >
      <template #header="{ chooseCallback, clearCallback, files }">
        <div
          class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2"
        >
          <div class="flex gap-2">
            <Button
              icon="pi pi-images"
              rounded
              outlined
              :disabled="model?.length && model?.length === fileLimit"
              @click="chooseCallback"
            />
          </div>
        </div>
      </template>

      <template #content="{ files, removeFileCallback }">
        <div v-if="model?.length">
          <div class="flex flex-wrap p-0 sm:p-5 gap-5">
            <div
              v-for="(file, index) of model"
              :key="
                typeof file === 'string'
                  ? file
                  : file.name + file.type + file.size
              "
              class="card w-full m-0 px-6 flex justify-between border-1 surface-border items-center gap-3"
            >
              <div
                v-if="typeof file === 'string'"
                class="w-full flex justify-between items-center gap-3"
              >
                <div>
                  <img
                    role="presentation"
                    :src="file"
                    width="100"
                    height="50"
                  />
                </div>

                <Button
                  icon="pi pi-times"
                  outlined
                  rounded
                  severity="danger"
                  @click="removeExistingFile(file)"
                />
              </div>

              <div
                v-else
                class="w-full flex justify-between items-center gap-3"
              >
                <div>
                  <img
                    role="presentation"
                    :alt="file.name"
                    :src="file.objectURL"
                    width="100"
                    height="50"
                  />
                </div>
                <span class="font-semibold">{{ file.name }}</span>
                <div>{{ formatSize(file.size) }}</div>
                <Button
                  icon="pi pi-times"
                  outlined
                  rounded
                  severity="danger"
                  @click="onRemoveFile(file, removeFileCallback, index)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-if="!model?.length" #empty>
        <div class="flex items-center justify-center flex-col">
          <i
            class="pi pi-cloud-upload border-2 rounded-full p-5 text-3xl text-400 border-400"
          />
          <p class="mt-4 mb-0">Drag and drop files to here to upload.</p>
        </div>
      </template>
    </FileUpload>
  </div>
</template>
