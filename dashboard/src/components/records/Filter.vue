<template>
  <el-select multiple collapse-tags v-model="selectedColumns">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>
<script lang="ts">

export default {
  props: ["columns", "options"],
  computed:{
    selectedColumns: {
        get () { return this.columns },
        set (value: any) {
            this.$emit('update:columns', value)
        }
    }
  }
};
</script>
