<template>
  <div>
    <el-button type="primary" @click="adding = true">
      New Mock<el-icon class="el-icon--right"><plus /></el-icon>
    </el-button>
    <el-drawer
      v-model="adding"
      direction="ltr"
      size="50%"
      title="New Mock"
      :before-close="beforeClose"
      @closed="onDrawerClosed"
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
import { useMocksStore } from "@/stores/mocks";
import { ref } from "vue";
import { json } from "@codemirror/lang-json";
import { ElMessageBox, ElNotification } from "element-plus";

const error = ref<undefined | string>();
const adding = ref(false);
const startingMock = JSON.stringify(
  {
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
  },
  null,
  2
);

export default {
  setup() {
    const { addMocks } = useMocksStore();
    return {
      adding,
      error,
      addMocks,
      extensions: [json()],
      mock: ref(startingMock),
    };
  },
  components: {
    Plus,
  },
  methods: {
    async saveMock() {
      try {
        const mocks = JSON.parse(this.mock);
        await this.addMocks(mocks);
        ElNotification({
          title: "Mock saved",
          type: "success",
        });
        this.adding = false;
      } catch (err: any) {
        console.error(err.message);
        error.value = err.message;
      }
    },
    onDrawerClosed() {
      this.mock = startingMock;
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
  },
  computed: {
    edited() {
      return startingMock !== this.mock;
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
