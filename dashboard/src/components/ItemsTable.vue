<template>
  <div>
    <el-table
      @selection-change="handleSelectionChange"
      :data="items"
      stripe
      border
      style="width: 100%"
      empty-text="-"
      table-layout="auto"
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
    </el-table>
  </div>
</template>
<script lang="ts">
import ExpandRow from "@/components/row/Expand.vue";
import Status from "@/components/row/Status.vue";
import Method from "@/components/row/Method.vue";
import Timestamp from "@/components/row/Timestamp.vue";
export default {
  props: ["items", "columns"],
  methods: {
    handleSelectionChange: (records: any[]) => {
      console.log("Selected items", records);
    },
  },
  components: {
    ExpandRow,
    Timestamp,
  }
};
</script>
