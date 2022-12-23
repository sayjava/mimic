<template>
  <div style="padding: 0 10px">
    <el-row :gutter="20">
      <el-col :span="12">
        <div>
          <el-descriptions column="1" border>
            <el-descriptions-item
              v-for="(value, key) in item.request.headers"
              :label="key"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-col>

      <el-col :span="12">
        <div>
          <el-descriptions column="1" border>
            <el-descriptions-item
              v-for="(value, key) in item.response.headers"
              :label="key"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts">
export default {
  props: ["item"],
};
</script>
