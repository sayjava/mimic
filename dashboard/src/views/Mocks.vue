<template>
  <div>
    <div class="toolbar">
      <new-mock />
      <div class="actions" v-if="selections.length">
        <el-button type="primary">
          Edit <el-icon class="el-icon--right"><Edit /></el-icon>
        </el-button>
        <el-button type="danger">
          Delete <el-icon class="el-icon--right"><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    <mocks-table :mocks="mocks" @selections="(mocks) => (selections = mocks)" />
  </div>
</template>

<script lang="ts">
import { Delete, Edit } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import { useMocksStore } from "@/stores/mocks";
import { ref } from "vue";
import MocksTable from "@/components/mocks/Table.vue";
import NewMock from "@/components/mocks/New.vue";

export default {
  components: {
    MocksTable,
    NewMock,
  },
  setup() {
    const store = useMocksStore();
    const { mocks, error } = storeToRefs(store);

    return {
      mocks,
      error,
      selections: ref([]),
      Delete,
      Edit,
    };
  },
  methods: {},
};
</script>

<style scoped>
.actions {
  display: flex;
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
