<template>
  <div>
    <div class="actions">
      <div class="left-actions">
        <filter-records v-model="columns" :options="options" />
        <create-mocks :records="selections" />
      </div>
      <clear-records />
    </div>
    <records-table
      @update:selections="(v) => (selections = v)"
      :items="records"
      :columns="columns"
    />
  </div>
</template>

<script lang="ts">
import RecordsTable from "@/components/records/RecordTable.vue";
import ClearRecords from "@/components/records/Clear.vue";
import FilterRecords from "@/components/records/Filter.vue";
import CreateMocks from "@/components/mocks/Create.vue";
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
      selections: ref([]),
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
    CreateMocks,
  },
};
</script>

<style scoped>
.actions {
  display: flex;
  padding: 12px 0;
  width: 100%;
  justify-content: space-between;
}
.left-actions {
  display: flex;
  gap: 12px;
}
</style>
