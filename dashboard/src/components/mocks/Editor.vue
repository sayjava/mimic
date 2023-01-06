<template>
  <div>
    <div type="primary" @click="openDrawer = true">
      <slot name="action-btn" />
    </div>
    <el-drawer
      direction="rtl"
      size="50%"
      :title="title"
      v-model="openDrawer"
      :before-close="beforeClose"
      @open="onOpened"
      modal
    >
      <el-alert v-if="error" :title="error" type="error" center show-icon />
      <div class="code">
        <codemirror v-model="mock" :extensions="extensions" />
      </div>
      <div class="actions">
        <el-button @click="saveMock" type="primary">Save</el-button>
      </div>
    </el-drawer>
  </div>
</template>
<script lang="ts">
import { Plus } from "@element-plus/icons-vue";
import { ref } from "vue";
import { json } from "@codemirror/lang-json";
import { ElMessageBox, ElNotification } from "element-plus";

export default {
  props: {
    title: String,
    initialMocks: Object,
    mockAction: Function,
  },
  emits: ["completed"],
  setup({ initialMocks }) {
    return {
      error: ref<undefined | string>(),
      openDrawer: ref(false),
      extensions: [json()],
      mock: ref(JSON.stringify(initialMocks, null, 2)),
    };
  },
  components: {
    Plus,
  },
  methods: {
    completed() {
      ElNotification({ title: "Mock(s) saved", type: "success" });
      this.openDrawer = false;
      this.$emit("completed");
    },
    async saveMock() {
      const defaultAction = () => {
        throw Error("Mock action absent");
      };
      try {
        const action = this.mockAction || defaultAction;
        const mocks = JSON.parse(this.mock);
        await action(mocks);
        this.completed();
      } catch (err: any) {
        this.error = err.message;
      }
    },
    beforeClose(done: () => void) {
      if (this.edited) {
        ElMessageBox.confirm("Are you sure you want to close this?")
          .then(() => {
            done();
          })
          .catch(console.error);
      } else {
        done();
      }
    },
    onOpened() {
      this.mock = JSON.stringify(this.initialMocks, null, 2);
      this.error = undefined;
    },
  },
  computed: {
    edited() {
      return JSON.stringify(this.initialMocks) !== this.mock;
    },
  },
};
</script>
<style scoped>
.code {
  margin: 10px 0;
  border: solid 1px var(--el-menu-border-color);
}
</style>
