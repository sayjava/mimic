<template>
  <el-tag :type="getType">{{ response.status }}</el-tag>
</template>
<script lang="ts">
export default {
  props: ["response"],
  computed: {
    getType() {
      const { status } = this.response;
      if (status > 200 && status < 300) {
        return "success";
      }

      if (status > 300 && status < 400) {
        return "info";
      }

      if (status > 400 && status < 500) {
        return "warning";
      }

      if (status > 500) {
        return "error";
      }
    },
  },
};
</script>
