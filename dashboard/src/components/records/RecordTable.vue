<template>
  <div>
    <el-table
      @selection-change="(records: any) => $emit('update:selections', records)"
      :data="records"
      stripe
      border
      style="width: 100%"
      empty-text="-"
      table-layout="auto"
      row-key="id"
    >
      <el-table-column type="expand">
        <template #default="scope">
          <expand-row :row="scope.row" />
        </template>
      </el-table-column>
      <el-table-column label="Time" prop="timestamp" sortable>
        <template #default="scope">
          <timestamp :row="scope.row" />
        </template>
      </el-table-column>

      <el-table-column
        v-for="column in columns"
        sortable
        :property="column"
        :label="column"
        v-bind:key="column"
      >
        <template #default="scope" v-if="column.includes('status')">
          <record-status
            :response="scope.row.response"
            v-if="column.includes('status')"
          />
          <record-method
            :request="scope.row.request"
            v-if="column.includes('method')"
          />
        </template>
      </el-table-column>

      <template #empty>
        <div class="no-records">No recorded requests</div>
      </template>
    </el-table>
    <div class="page">
      <el-pagination
        layout="prev, pager, next"
        :total="items.length"
        background
        hide-on-single-page
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
      />
    </div>
  </div>
</template>
<script lang="ts">
import ExpandRow from "@/components/records/RecordExpand.vue";
import RecordStatus from "@/components/records/ResponseStatus.vue";
import RecordMethod from "@/components/records/RequestMethod.vue";
import Timestamp from "@/components/records/RecordTimestamp.vue";
import { ref } from "vue";
export default {
  props: ["items", "columns"],
  emits: ["update:selections"],
  setup() {
    return {
      currentPage: ref(1),
      pageSize: ref(20),
    };
  },
  computed: {
    records() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.items.slice(start, start + this.pageSize);
    },
  },
  components: {
    RecordStatus,
    RecordMethod,
    ExpandRow,
    Timestamp,
  },
};
</script>

<style scoped>
.page {
  display: flex;
  width: 100%;
  justify-content: center;
  padding: 12px 0;
}

.no-records {
  font-size: 600;
  font-weight: 600;
}
</style>
