<template>
  <div>
    <el-table
      @selection-change="handleSelectionChange"
      :data="records"
      stripe
      border
      style="width: 100%"
      empty-text="-"
      table-layout="auto"
      row-key="id"
    >
      <el-table-column type="selection" width="20" />
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
      >
        <template #default="scope" v-if="column.includes('status')">
          <Status :response="scope.row.response" />
        </template>

        <template #default="scope" v-if="column.includes('method')">
          <Method :request="scope.row.request" />
        </template>
      </el-table-column>
      <template #empty>
        <div class="no-records">
          No recorded requests
        </div>
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
import ExpandRow from "@/components/row/Expand.vue";
import Status from "@/components/row/Status.vue";
import Method from "@/components/row/Method.vue";
import Timestamp from "@/components/row/Timestamp.vue";
import { ref } from "vue";
export default {
  props: ["items", "columns"],
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
  methods: {
    handleSelectionChange: (records: any[]) => {
      console.log("Selected items", records);
    },
  },
  components: {
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
