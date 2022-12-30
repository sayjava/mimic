import { defineStore } from "pinia";
import { ref, inject, onMounted } from "vue";

export const useMocksStore = defineStore("mocks", () => {
  const mocks = ref<any[]>([]);
  const error = ref(null);
  const apiURL = inject("API_URL");
  const mocksURL = `${apiURL}/mocks`;

  const doFetchMocks = () => {
    return fetch(mocksURL)
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

  const addMocks = async (mocks: any[]) => {
    const res = await fetch(mocksURL, {
      method: "POST",
      body: JSON.stringify(mocks),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }
    return doFetchMocks();
  };

  onMounted(() => {
    doFetchMocks();
  });

  return { mocks, error, deleteMocks, updateMocks, addMocks };
});
