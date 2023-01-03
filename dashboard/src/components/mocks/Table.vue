<template>
  <div>
    <el-table
      :data="mocks"
      row-key="id"
      @selection-change="handleSelectionChange"
      stripe
      border
      empty-text="-"
      class="table"
    >
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column type="expand">
        <template #default="scope">
          <div>{{ scope.row }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="request.path" label="Path" width="auto" />
      <el-table-column prop="request.method" label="Method" />
      <!-- <el-table-column prop="request.headers.content-type" label="Content Type" /> -->
      <el-table-column prop="response.status" label="Status" width="80">
        <template #default="scope">
          <status-column :response="scope.row.response" />
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="Priority" width="80" />
      <el-table-column prop="limit" label="Limit" width="80" />
    </el-table>
  </div>
</template>
<script lang="ts">
import StatusColumn from "@/components/row/Status.vue";

export default {
  props: ["mocks"],
  emits: ["selections"],
  components: {
    StatusColumn,
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
