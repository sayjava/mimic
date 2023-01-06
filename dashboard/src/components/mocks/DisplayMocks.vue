<template>
  <el-badge :value="mocks.length" type="primary">
    <el-button type="primary" size="small" @click="displayed = true"> Mocks</el-button>
  </el-badge>
  <el-drawer v-model="displayed" title="Active Mocks" direction="rtl" size="60%">
   <div class="toolbar">
      <new-mock title="New Mock" />
      <div class="actions" v-if="selections.length">
        <update-mock :mocks="selections" />
        <delete-mock :mocks="selections" />
      </div>
    </div>
    <mocks-table :mocks="mocks" @selections="(selected) => (selections = selected)" />
  </el-drawer>
</template>
<script lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useMocksStore } from "@/stores/mocks";
import MocksTable from "@/components/mocks/Table.vue";
import NewMock from "@/components/mocks/New.vue";
import UpdateMock from "@/components/mocks/Update.vue";
import DeleteMock from "@/components/mocks/Delete.vue";

export default {
  setup() {
    const store = useMocksStore();
    const { mocks, error } = storeToRefs(store);
    return {
      mocks,
      error,
      selections: ref([]),
      displayed: ref(false),
    };
  },
  components: {
    MocksTable,
    DeleteMock,
    UpdateMock,
    NewMock
  },
};
</script>

<style scoped>
.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}

.toolbar {
  display: flex;
  padding: 12px 0;
  align-items: center;
}

</style>
