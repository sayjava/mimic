<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">
        <h3>Mimic Dashboard</h3>
      </el-header>
      <el-container>
        <el-aside width="100px">
          <el-menu collapse style="height: 100%">
            <el-menu-item index="1">
              <el-icon><setting /></el-icon>
              <template #title>Records</template>
            </el-menu-item>
            <el-menu-item index="2">
              <el-icon><list /></el-icon>
              <template #title>Mocks</template>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-container>
          <el-main><RouterView /></el-main>
          <el-footer> copyright 2022; Mimic Server </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>


<style scoped>
.header {
  border-bottom: solid 1px var(--el-menu-border-color);
}

.common-layout {
  height: 100vh;
}

.el-container {
  height: 100%;
}
</style>