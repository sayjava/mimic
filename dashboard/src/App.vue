<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">
        <div class="logo">Mimic Dashboard</div>
        <display-mocks :mocks="mocks" />
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
import DisplayMocks from "@/components/mocks/DisplayMocks.vue";
import RecordsView from "./views/Records.vue";
export default {
  components: {
    RecordsView,
    DisplayMocks,
  },
  computed: {
    ...mapState(useEventStore, ['records']),
    ...mapState(useEventStore, ['mocks']),
  }
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
