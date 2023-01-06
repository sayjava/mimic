<template>
  <div>
    <div class="filter">
      <filter-records v-model="columns" :options="options" />
      <clear-records />
    </div>
    <records-table :items="records" :columns="columns" />
  </div>
</template>

<script lang="ts">
import RecordsTable from "@/components/records/Table.vue";
import ClearRecords from "@/components/records/Clear.vue";
import FilterRecords from "@/components/records/Filter.vue";
import { useRecordStore } from "@/stores/records";
import { storeToRefs } from "pinia";
import * as lo from "lodash";
import { ref } from "vue";

const reduceKeys = (items: any[], key: string) => {
  const reduced = items.reduce((acc, current) => {
    return Object.assign({}, acc, lo.get(current, key));
  }, {});

  return Object.keys(reduced).map((valKey) => {
    const val = `${key}.${valKey}`;
    return { value: val, label: val };
  });
};

export default {
  setup() {
    const store = useRecordStore();
    const { records, error } = storeToRefs(store);

    return {
      records,
      error,
      columns: ref(["request.path", "request.method", "response.status"]),
    };
  },
  computed: {
    options() {
      const options = [
        { value: "request.path", label: "request.path" },
        { value: "request.method", label: "request.method" },
        ...reduceKeys(this.records, "request.headers"),
        { value: "response.status", label: "response.status" },
        ...reduceKeys(this.records, "response.headers"),
      ];

      return options;
    },
  },
  components: {
    RecordsTable,
    FilterRecords,
    ClearRecords,
  },
};
</script>

<style scoped>
.filter {
  display: flex;
  padding: 12px 0;
  width: 100%;
  justify-content: space-between;
}
</style>
