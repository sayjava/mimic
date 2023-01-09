<template>
  <mock-editor
    :mock-action="(m: any) => addMocks(m)"
    :initial-mocks="mocks"
    title="Create mock from request record"
  >
    <template #action-btn>
      <el-button type="primary" :disabled="mocks.length === 0">
        Mock Selected <el-icon class="el-icon--right"><Edit /></el-icon>
      </el-button>
    </template>
  </mock-editor>
</template>
<script lang="ts">
import { Edit } from "@element-plus/icons-vue";
import { useMocksStore } from "@/stores/mocks";
import MockEditor from "@/components/mocks/Editor.vue";

export default {
  props: ["records"],
    setup({}) {
      const { addMocks } = useMocksStore();
      return {
        addMocks
      };
    },
  computed: {
    mocks() {
      return this.records.map((record: any) => {
        return {
          request: record.request,
          response: record.response,
          limit: "unlimited",
          priority: 0,
          delay: 0,
        };
      });
    },
  },
  components: {
    Edit,
    MockEditor,
  },
};
</script>
<style scoped>
.code {
  margin: 10px 0;
  border: solid 1px var(--el-menu-border-color);
}
</style>
