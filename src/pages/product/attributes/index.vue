<template>
  <div class="bg-white rounded-xl px-5 py-6">
    <DataTable
      :value="attributes.data"
      paginator
      :rows="5"
      :rows-per-page-options="[5, 10, 20, 50]"
      table-style="min-width: 50rem"
      :header-class="'border-0'"
    >
      <template #header>
        <div class="flex justify-between">
          <h3>Product Attributes</h3>

          <div>
            <InputText placeholder="Keyword Search" />
          </div>
        </div>
      </template>

      <Column field="name" header="Name" />

      <Column field="values" header="Values">
        <template #body="slotProps">
          <ul class="flex gap-2">
            <li v-for="item in slotProps.data.values" :key="item.name">
              {{ item.name }}
            </li>
          </ul>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: "attributes",
});

const { data: attributes } = await useFetch("/api/proxy/admin/attributes/");
</script>
