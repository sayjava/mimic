<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">
        <div class="logo">
          Mimic Dashboard
        </div>
        <display-mocks />
      </el-header>
      <el-container>
        <el-container>
          <el-main><RouterView /></el-main>
          <el-footer> copyright 2022; Mimic Server </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import { RouterView, RouterLink } from "vue-router";
import DisplayMocks from "@/components/mocks/DisplayMocks.vue";
export default {
  components: {
    RouterLink,
    DisplayMocks
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
