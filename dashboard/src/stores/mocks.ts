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
          throw new Error(`Network response ${res.status}`);
        }
      })
      .then((json) => {
        mocks.value = json;
      })
      .catch((e) => {
        error.value = e;
      });
  };

  const deleteMocks = (mocks: any[]) => {
    const doDelete = (mock: any) => {
      return fetch(`${mocksURL}/${mock.id}`, {
        method: "DELETE",
      }).then(async (res) => {
        if (res.ok) {
          return res.text();
        } else {
         const error = await res.json();
         throw new Error(error.message);
        }
      });
    };

    if (Array.isArray(mocks)) {
      const prs = mocks.map(doDelete);
      return Promise.all(prs).then(doFetchMocks);
    } else {
      return doDelete(mocks).then(doFetchMocks);
    }

  };

  const updateMocks = (mocks: any) => {
    const doUpdate = (mock: any) => {
      return fetch(`${mocksURL}/${mock.id}`, {
        body: JSON.stringify(mock),
        method: "PATCH",
      }).then(async (res) => {
        if (res.ok) {
          return res.text();
        } else {
          const error = await res.json()
          throw new Error(error.message);
        }
      });
    };

    if (Array.isArray(mocks)) {
      const prs = mocks.map(doUpdate);
      return Promise.all(prs).then(doFetchMocks);
    } else {
      return doUpdate(mocks).then(doFetchMocks);
    }
  };

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
