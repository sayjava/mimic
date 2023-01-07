<template>
  <div>
    <el-table
      :data="items"
      @selection-change="handleSelectionChange"
      stripe
      border
      row-key="id"
      empty-text="-"
      class="table"
    >
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column type="expand">
        <template #default="scope">
          <el-descriptions :column="3" border direction="vertical">
            <el-descriptions-item label="Priority">{{
              scope.row.priority
            }}</el-descriptions-item>
            <el-descriptions-item label="Delay (Ms)">{{
              scope.row.delay
            }}</el-descriptions-item>
            <el-descriptions-item label="Limit">{{
              scope.row.limit
            }}</el-descriptions-item>
          </el-descriptions>
          <expand-row :row="scope.row" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Name" width="200" />
      <el-table-column prop="request.path" label="Path" width="auto" />
      <el-table-column prop="request.method" label="Method" width="100" />
      <el-table-column prop="response.status" label="Status" width="80">
        <template #default="scope">
          <status-column :response="scope.row.response" />
        </template>
      </el-table-column>
      <template #empty>
        <div>        
         No registered mocks
        </div>
      </template>
    </el-table>
    <div class="page">
      <el-pagination
        layout="prev, pager, next"
        :total="mocks.length"
        background
        hide-on-single-page
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
      />
    </div>
  </div>
</template>
<script lang="ts">
import StatusColumn from "@/components/row/Status.vue";
import ExpandRow from "@/components/row/Expand.vue";
import { ref } from "vue";

export default {
  props: ["mocks"],
  emits: ["selections"],
  setup() {
    return {
      currentPage: ref(1),
      pageSize: ref(15),
    };
  },
  components: {
    StatusColumn,
    ExpandRow,
  },
  methods: {
    handleSelectionChange(mocks: any) {
      this.$emit("selections", mocks);
    },
  },
  computed: {
    items() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.mocks.slice(start, start + this.pageSize);
    },
  },
};
</script>
<style scoped>
.table {
  width: 100%;
}

.page {
  display: flex;
  width: 100%;
  justify-content: center;
  padding: 12px 0;
}
</style>
