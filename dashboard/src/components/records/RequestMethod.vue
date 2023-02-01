<template>
  <span :class="getClass">
    {{ request?.method }}
  </span>
</template>
<script lang="ts">
export default {
  props: ["request"],
  computed: {
    getClass() {
      return `request method ${this.request?.method.toLowerCase()}`;
    },
  },
};
</script>

<style>
.request.method.get {
  color: var(--el-color-info);
  font-weight: 600;
}

.request.method.post {
  color: var(--el-color-info);
  font-weight: 600;
}

.request.method.put {
  color: var(--el-color-success);
  font-weight: 600;
}

.request.method.delete {
  color: var(--el-color-danger);
  font-weight: 600;
}

.request.method.options {
  color: var(--el-color-success);
  font-weight: 600;
}

.request.method.patch {
  color: var(--el-color-success);
  font-weight: 600;
}
</style>
