import {
	logger,
	MocksUpdatedEvent,
	RecordStorage,
	RecordsUpdateEvent,
} from '../deps.ts';
import { serializeRecord } from '../utils.ts';

const registerStorageEvents = (storage: RecordStorage, socket: WebSocket) => {
	const onMocksAdded = (evt: MocksUpdatedEvent) => {
		socket.send(JSON.stringify({
			event: MocksUpdatedEvent.MocksUpdated,
			mocks: evt.mocks,
		}));
	};

	const onRecordsCleared = async (evt: RecordsUpdateEvent) => {
		const records = await Promise.all(
			evt.records.map(serializeRecord),
		);
		socket.send(JSON.stringify({
			event: RecordsUpdateEvent.RecordCleared,
			records,
		}));
	};

	const onRecordAdded = async (evt: RecordsUpdateEvent) => {
		const records = await Promise.all(evt.records.map(serializeRecord));
		socket.send(JSON.stringify({
			event: RecordsUpdateEvent.RecordAdded,
			records,
		}));
	};

	storage.emitter.on(MocksUpdatedEvent.MocksUpdated, onMocksAdded);
	storage.emitter.on(RecordsUpdateEvent.RecordCleared, onRecordsCleared);
	storage.emitter.on(RecordsUpdateEvent.RecordAdded, onRecordAdded);

	socket.onclose = () => {
		storage.emitter.off(MocksUpdatedEvent.MocksUpdated, onMocksAdded);
		storage.emitter.off(RecordsUpdateEvent.RecordCleared, onRecordsCleared);
		storage.emitter.off(RecordsUpdateEvent.RecordAdded, onRecordAdded);
	};

	socket.onmessage = (message: MessageEvent<string>) => {
		const { kind } = JSON.parse(message.data);
		if (kind === 'clear_records') {
			return storage.clearRecords();
		}

		logger.info('WS: unknown message');
	};

	socket.onerror = (e) => {
		logger.error(e);
	};
};

const sendInitialEvents = async (storage: RecordStorage, socket: WebSocket) => {
	const events = await storage.getRecords();
	const records = await Promise.all(events.map(serializeRecord));
	const mocks = await storage.getMocks();
	socket.send(JSON.stringify({
		event: 'connected',
		records,
		mocks,
	}));
};

export const createWsHandler = ({ storage }: { storage: RecordStorage }) => {
	return (request: Request) => {
		const { socket, response } = Deno.upgradeWebSocket(request);

		socket.onopen = async () => {
			await sendInitialEvents(storage, socket);
			registerStorageEvents(storage, socket);
		};

		return response;
	};
};
