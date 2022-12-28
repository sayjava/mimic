import { defineStore } from "pinia";
import { ref, inject, onMounted } from "vue";

export const useMocksStore = defineStore("mocks", () => {
  const mocks = ref<any[]>([]);
  const error = ref(null);
  const apiURL = inject("API_URL");

  const doFetchMocks = () => {
    return fetch(`${apiURL}/mocks`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(`Network response ${res.ok}`);
        }
      })
      .then((json) => {
        mocks.value = json;
      })
      .catch((e) => {
        error.value = e;
      });
  };

  const deleteMocks = (mock: any[]) => {};

  const updateMocks = (mock: any[]) => {};

  const addMocks = (mock: any[]) => {};

  onMounted(() => {
    doFetchMocks();
  });

  return { mocks, error, deleteMocks, updateMocks, addMocks };
});
