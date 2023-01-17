import { defineStore } from "pinia";
import { inject, onMounted, onUnmounted, ref } from "vue";

const REFRESH_TIME = 10000;

const reduceKeys = (items: any[], key: string) => {
  const reduced = items.reduce((acc, current) => {
    return Object.assign({}, acc, current[key]);
  }, {});

  return Object.keys(reduced).map((valKey) => {
    return { value: valKey, label: `${key}.${valKey}` };
  });
};

export const useRecordStore = defineStore("records", () => {
  const records = ref<any[]>([]);
  const error = ref(null);
  const recordKeys = ref<any>([]);
  let intervalIndex: any;

  const apiURL = inject("API_URL");
  const doFetchRecords = () => {
    return fetch(`${apiURL}/records`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(`Network response ${res.status}`);
        }
      })
      .then((json) => {
        records.value = json;
        recordKeys.value = [
          ...reduceKeys(json, "request"),
          ...reduceKeys(json, "response"),
        ];
      })
      .catch((e) => {
        error.value = e;
      });
  };

  const clearRecords = async () => {
    const res = await fetch(`${apiURL}/records`, {
      method: "DELETE",
    });

    if (res.ok) {
      return doFetchRecords();
    } else {
      const err = await res.json();
      throw new Error(err.message);
    }
  };

  onMounted(() => {
    doFetchRecords().finally(() => {
      intervalIndex = setInterval(doFetchRecords, REFRESH_TIME);
    });
  });

  onUnmounted(() => {
    clearInterval(intervalIndex);
  });

  return { records, recordKeys, error, clearRecords };
});
