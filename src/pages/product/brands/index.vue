<script setup lang="ts">
import {getBrands} from "~/app/api/getBrands";

definePageMeta({
  name: "brands",
});
const {data: brands} = await getBrands();
</script>

<template>
  <div class="brand-list-container">
    <div class="flex">
      <h4 class="text-primary-color-envitect-sam-blue">Brands</h4>
    </div>
    <div class="order-table">
      <DataTable :value="brands">
        <Column header="SL">
          <template #body="slotProps">
            {{slotProps.index + 1}}
          </template>
        </Column>
        <Column header="Logo">
          <template #body="slotProps">
            <img class="h-16 w-42" :src="slotProps.data.image_url" :alt="slotProps.data.name"/>
          </template>
        </Column>
        <Column header="Name">
          <template #body="slotProps">
            {{slotProps.data.name}}
          </template>
        </Column>
        <Column header="Status">
          <template #body="slotProps">
            Active
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            ...
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

</template>



<style scoped lang="scss">
.brand-list-container {
  background-color: var(--primary-color-white);
  border-radius: 12px;
  padding: 1.5rem;
}
</style>
