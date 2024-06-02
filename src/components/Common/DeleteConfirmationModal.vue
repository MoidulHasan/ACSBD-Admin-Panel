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
      <Dialog v-model:visible="visible" modal>
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
                class="cancel-button font-heading-7 font-semibold"
                @click="emits('onCancel')"
              >
                Cancel
              </Button>
              <Button
                :disabled="disabled"
                class="delete-button font-heading-7 font-semibold"
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

.cancel-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 24px;
  gap: 12px;

  width: 106px;
  height: 40px;

  /* Dark Gray/20% */
  background: var(--dark-gray-20);
  border-radius: 4px;

  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  /* Dark Gray/80% */
  color: var(--dark-gray-80);

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

.delete-button {
  /* Auto layout */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 24px;
  gap: 12px;

  background: var(--color-danger);
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
