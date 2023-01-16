<template>
  <div style="max-width: 100%">
    <el-tabs type="border-card">
      <el-tab-pane label="Request">
        <codemirror
          :modelValue="JSON.stringify(row.request, null, 2)"
          :extensions="extensions"
        />
      </el-tab-pane>
      <el-tab-pane label="Response" v-if="row.response">
        <codemirror
          :modelValue="JSON.stringify(row.response, null, 2)"
          :extensions="extensions"
        />
      </el-tab-pane>
      <el-tab-pane label="Forward" v-if="row.forward">
        <codemirror
          :modelValue="JSON.stringify(row.forward, null, 2)"
          :extensions="extensions"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
import { json } from "@codemirror/lang-json";
export default {
  props: ["row"],
  setup() {
    return {
      extensions: [json()],
    };
  },
};
</script>
