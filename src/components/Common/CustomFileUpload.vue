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
  fileLimit: 1,
  maxFileSize: 1000000,
  required: false,
});

const model = defineModel<File[]>([]);
// const totalSize = ref(0);
// const totalSizePercent = ref(0);

const onRemoveFile = (file, removeFileCallback: Function, index: number) => {
  model.value = model.value
    .map((file, idx) => (idx !== index ? file : null))
    .filter((file) => file !== null);

  removeFileCallback(index);
};

const onFileSelect = (event: any) => {
  console.log(event);

  model.value = event.files;
  // model.value?.forEach((file) => {
  //   totalSize.value += parseInt(formatSize(file.size));
  // });
};
</script>

<template>
  <div>
    <FileUpload
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
              @click="chooseCallback"
            />

            <Button
              icon="pi pi-times"
              rounded
              outlined
              severity="danger"
              :disabled="!files || files.length === 0"
              @click="clearCallback"
            />
          </div>
        </div>
      </template>

      <template #content="{ files, removeFileCallback }">
        <div v-if="files.length > 0">
          <div class="flex flex-wrap p-0 sm:p-5 gap-5">
            <div
              v-for="(file, index) of files"
              :key="file.name + file.type + file.size"
              class="card w-full m-0 px-6 flex justify-between border-1 surface-border items-center gap-3"
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
      </template>

      <template #empty>
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

<style scoped></style>
