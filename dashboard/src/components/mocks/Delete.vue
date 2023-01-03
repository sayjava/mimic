<template lang="">
  <el-button type="danger" @click="action"> Delete <el-icon class="el-icon--right"><Delete /></el-icon>
  </el-button>
</template>
<script lang="ts">
import { Delete } from "@element-plus/icons-vue";
import { ElNotification } from "element-plus";
import { useMocksStore } from "@/stores/mocks";

export default {
  props: ["mocks"],
  setup() {
    const { deleteMocks } = useMocksStore();
    return {
      deleteMocks,
    };
  },
  components: {
    Delete,
  },
  methods: {
    async action() {
        try {
            await this.deleteMocks(this.mocks) 
            ElNotification({ title: 'Mocks deleted', type: "success" });
        } catch (error: any) {
            ElNotification({ title: error.message, type: "error" });
        }
    }
  }
};
</script>
