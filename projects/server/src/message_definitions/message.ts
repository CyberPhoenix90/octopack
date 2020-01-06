import { MessageTypes } from './message_types';
import { Log } from '../../../libraries/logger';

export interface Message<T extends MessageTypes = MessageTypes> {
	type: T;
	data?: T extends MessageTypes.LOGS_REQUEST ? undefined : T extends MessageTypes.LOGS_RESPONSE ? Log[] : never;
}
