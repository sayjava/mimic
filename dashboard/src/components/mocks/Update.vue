<template>
  <mock-editor
    :mock-action="(m: any) => updateMocks(m)"
    :initial-mocks="mocks"
    title="Update Mocks"
  >
    <template #action-btn>
      <el-button type="primary">
        Edit <el-icon class="el-icon--right"><Edit /></el-icon>
      </el-button>
    </template>
  </mock-editor>
</template>
<script lang="ts">
import { Edit } from "@element-plus/icons-vue";
import { useMocksStore } from "@/stores/mocks";
import MockEditor from "@/components/mocks/Editor.vue";

export default {
  props: ["mocks"],
  setup() {
    const { updateMocks } = useMocksStore();
    return {
      updateMocks,
    };
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
