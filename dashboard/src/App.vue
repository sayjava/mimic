<template>
  <div class="common-layout">
    <el-container>
      <el-alert title="Disconnected from the mimic server, Refresh the page" type="error" v-if="!connected"/>
      <el-header class="header">
        <div class="logo">Mimic Dashboard</div>
        <mocks-view :mocks="mocks" />
      </el-header>
      <el-container>
        <el-container>
          <records-view :records="records" />
          <el-footer> copyright 2022; Mimic Server </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import { useEventStore } from "@/stores/events";
import { mapState } from "pinia";
import MocksView from "@/views/DisplayMocks.vue";
import RecordsView from "@/views/DisplayRecords.vue";
export default {
  components: {
    RecordsView,
    MocksView,
  },
  computed: {
    ...mapState(useEventStore, ["records"]),
    ...mapState(useEventStore, ["mocks"]),
    ...mapState(useEventStore, ["connected"]),
  },
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  border-bottom: solid 1px var(--el-menu-border-color);
}

.logo {
  display: flex;
  gap: 5px;
  width: 200px;
  font-weight: 600;
}

.common-layout {
  height: 100vh;
}

.el-container {
  height: 100%;
}
</style>
