<template>
  <div>
    <el-table
      :data="mocks"
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
    </el-table>
  </div>
</template>
<script lang="ts">
import StatusColumn from "@/components/row/Status.vue";
import ExpandRow from "@/components/row/Expand.vue";

export default {
  props: ["mocks"],
  emits: ["selections"],
  components: {
    StatusColumn,
    ExpandRow,
  },
  methods: {
    handleSelectionChange(mocks: any) {
      this.$emit("selections", mocks);
    },
  },
};
</script>
<style scoped>
.table {
  width: 100%;
}
</style>
