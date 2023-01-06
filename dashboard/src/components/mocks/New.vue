<template>
  <mock-editor :mock-action="(m: any) => addMocks(m)" :initial-mocks="defaultMock" title="New Mock">
    <template #action-btn>
      <el-button type="primary">
        New Mock<el-icon class="el-icon--right"><plus /></el-icon>
      </el-button>
    </template>
  </mock-editor>
</template>
<script lang="ts">
import { Plus } from "@element-plus/icons-vue";
import { useMocksStore } from "@/stores/mocks";
import MockEditor from "@/components/mocks/Editor.vue";

const defaultMock = {
  name: "New Mock",
  request: {
    path: "/hello-world",
    method: "GET",
  },
  response: {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: "Hello World",
  },
};

export default {
  setup() {
    const { addMocks } = useMocksStore();
    return {
      addMocks,
      defaultMock,
    };
  },
  components: {
    Plus,
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
