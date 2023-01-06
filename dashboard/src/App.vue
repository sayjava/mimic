<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">
        <div class="logo">
          <RouterLink to="/">Mimic Dashboard</RouterLink>
        </div>
        <menu-links />
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
import MenuLinks from "@/components/Menu.vue";
export default {
  components: {
    MenuLinks,
    RouterLink,
  },
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;

  width: 100%;
  border-bottom: solid 1px var(--el-menu-border-color);
}

.logo {
  width: 200px;
}

.common-layout {
  height: 100vh;
}

.el-container {
  height: 100%;
}
</style>
