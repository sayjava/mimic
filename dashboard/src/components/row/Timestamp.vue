<template>
  <div style="display: flex; align-items: center">
    <el-icon v-if="row.isForwarded"><connection /></el-icon>
    <span style="margin-left: 10px">{{
      new Date(row.timestamp).toLocaleString()
    }}</span>
  </div>
</template>

<script lang="ts">
export default {
  props: ["row"],
};
</script>
