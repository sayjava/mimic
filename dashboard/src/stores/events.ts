import { defineStore } from "pinia";
import { ref, inject } from "vue";

export const useEventStore = defineStore("events", () => {
  const connected = ref<boolean>(false);
  const records = ref<any[]>([]);
  const mocks = ref<any[]>([]);
  const error = ref();

  const protocol = window.location.protocol.includes("https") ? "wss" : "ws";
  const ws = new WebSocket(`${protocol}://${window.location.hostname}:${inject("WS_PORT")}`);

  ws.onerror = (errorEvt) => (error.value = errorEvt);
  ws.onopen = () => {
    connected.value = true;
  };

  ws.onclose = () => {
    connected.value = false;
  };

  ws.onmessage = (evt: any) => {
    const {
      mocks: eventMocks,
      records: eventRecords,
      event,
    } = JSON.parse(evt.data);
    if (event.includes("records")) {
      records.value = eventRecords;
    } else if (event.includes("mocks")) {
      mocks.value = eventMocks;
    } else {
      records.value = eventRecords;
      mocks.value = eventMocks;
    }
  };

  const clearRecords = () => {
    ws.send(JSON.stringify({
      kind: 'clear_records'
    }))
  }
  
  return { records, mocks, connected, error, clearRecords };
});
