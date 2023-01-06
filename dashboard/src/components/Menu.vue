<template>
  <el-menu class="menu" mode="horizontal">
    <el-menu-item index="1">
      <el-icon><compass /></el-icon>
      <template #title>
        <RouterLink to="/">Records</RouterLink>
      </template>
    </el-menu-item>
    <el-menu-item index="2">
      <el-icon><coin /></el-icon>
      <template #title>
        <RouterLink to="/mocks">Mocks</RouterLink>
      </template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts">
import { RouterLink } from "vue-router";
export default {
  components: {
    RouterLink,
  },
};
</script>


<style scoped>
.menu {
    width: 100%;
}
</style>