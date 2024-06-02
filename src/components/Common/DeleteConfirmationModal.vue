<script setup lang="ts">
defineProps<{
  message?: string;
  disabled?: boolean;
}>();

const emits = defineEmits<{
  (e: "onCancel"): void;
  (e: "onConfirm"): void;
}>();

const visible = defineModel<boolean>("visible", {
  required: true,
});
</script>

<template>
  <div>
    <ClientOnly>
      <Dialog v-model:visible="visible" class="delete-brand-modal" modal>
        <template #container>
          <div class="modal-items">
            <slot name="body">
              <p class="modal-text font-heading-7 font-semibold text-center">
                <span v-if="message">
                  {{ message }}
                </span>
                <span v-else>
                  <span class="title-message">You are about to Delete, </span>
                  <br />
                  <span class="message-subtitle"
                    >Are sou sure, you want to delete?
                  </span>
                </span>
              </p>
            </slot>

            <div class="flex justify-center items-center gap-3">
              <Button
                :disabled="disabled"
                class="modal-button cancel font-heading-7 font-semibold"
                @click="emits('onCancel')"
              >
                Cancel
              </Button>
              <Button
                :disabled="disabled"
                class="modal-button delete-brand font-heading-7 font-semibold"
                @click="emits('onConfirm')"
              >
                Delete
              </Button>
            </div>
          </div>
        </template>
      </Dialog>
    </ClientOnly>
  </div>
</template>

<style scoped lang="postcss">
.modal-items {
  background-color: #fff;
  border-radius: 6px;
  padding: 61px 63px;
  @include media-query(sm) {
    padding: 61px 20px;
    border-radius: 12px;
  }
}

.modal-text {
  color: var(--navy-blue-80);
  margin-bottom: 40px;
}

.title-message {
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 36px;
  text-align: center;

  color: #565656;
}

.message-subtitle {
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  /* identical to box height, or 150% */
  text-align: center;

  /* Dark Gray/80% */
  color: #787878;
}

.modal-button {
  //display: inline-flex;
  //padding: 12px 40px;
  //justify-content: center;
  //align-items: center;
  //gap: 12px;
  //border-radius: 6px;
}

.cancel {
  //background-color: var(--envitect-sam-blue-5);
  //color: var(--primary-color-envitect-sam-blue);

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 24px;
  gap: 12px;

  width: 106px;
  height: 40px;

  /* Dark Gray/20% */
  background: #dddddd;
  border-radius: 4px;

  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  /* Dark Gray/80% */
  color: #787878;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

.delete-brand {
  //color: var(--primary-color-white);
  //background-color: var(--color-danger);

  /* Auto layout */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 24px;
  gap: 12px;

  background: #de0000;
  border-radius: 4px;

  width: 106px;
  height: 40px;

  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  /* White/100% */
  color: #ffffff;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}
</style>
