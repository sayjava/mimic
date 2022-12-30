<template>
  <div>
    <div class="filter">
      <el-select multiple collapse-tags v-model="columns">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <ItemsTable :items="records" :columns="columns" />
  </div>
</template>

<script lang="ts">
import ItemsTable from "@/components/ItemsTable.vue";
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
    ItemsTable,
  },
};
</script>

<style scoped>
.filter {
  padding: 12px 0;
}
</style>
