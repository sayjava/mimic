<template>
  <div class="container">
    <span>{{
      new Date(row.timestamp).toLocaleString()
    }}</span>
     <el-popover
    placement="top-start"
    title="Forwarded Request"
    :width="200"
    trigger="hover"
    :content="row.request.headers.host"
  >
    <template #reference>
      <el-tag class="mx-1" size="small">forwarded</el-tag>
    </template>
  </el-popover>
  </div>
</template>

<script lang="ts">
export default {
  props: ["row"],
};
</script>

<style scoped>
.container {
  display: flex;
  gap: 5px;
}
</style>
