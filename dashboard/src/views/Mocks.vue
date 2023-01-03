<template>
  <div>
    <div class="toolbar">
      <new-mock />
      <div class="actions" v-if="selections.length">
        <update-mock :mocks="selections" />
        <delete-mock :mocks="selections" />
      </div>
    </div>
    <mocks-table :mocks="mocks" @selections="(mocks) => (selections = mocks)" />
  </div>
</template>

<script lang="ts">
import { storeToRefs } from "pinia";
import { useMocksStore } from "@/stores/mocks";
import { ref } from "vue";
import MocksTable from "@/components/mocks/Table.vue";
import NewMock from "@/components/mocks/New.vue";
import UpdateMock from "@/components/mocks/Update.vue";
import DeleteMock from "@/components/mocks/Delete.vue";

export default {
  components: {
    MocksTable,
    NewMock,
    UpdateMock,
    DeleteMock
  },
  setup() {
    const store = useMocksStore();
    const { mocks, error } = storeToRefs(store);

    return {
      mocks,
      error,
      selections: ref([]),
    };
  },
  methods: {},
};
</script>

<style scoped>
.actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}

.toolbar {
  display: flex;
  padding: 12px 0;
  align-items: center;
}
</style>
