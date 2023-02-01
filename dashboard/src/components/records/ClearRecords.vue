<template>
  <el-popover
    placement="bottom-start"
    :width="200"
    trigger="hover"
    content="Delete all server records"
  >
    <template #reference>
      <el-button type="warning" @click="clear">
        Clear Records <el-icon><refresh /></el-icon>
      </el-button>
    </template>
  </el-popover>
</template>

<script lang="ts">
import { RefreshLeft } from "@element-plus/icons-vue";
import { useEventStore } from "@/stores/events";
import { ElNotification } from "element-plus";
export default {
  setup() {
    const { clearRecords } = useEventStore();
    return { clearRecords };
  },
  methods: {
    clear: async function () {
      try {
        await this.clearRecords();
        ElNotification({
          title: "Success",
          message: "All records cleared",
          type: "success",
          duration: 3000,
        });
      } catch (error: any) {
        ElNotification({
          title: "Records Cleared",
          type: "error",
          message: error.message,
          duration: 3000,
        });
      }
    },
  },
  components: {
    Refresh: RefreshLeft,
  },
};
</script>

<style scoped>
.actions {
  display: flex;
}
</style>
