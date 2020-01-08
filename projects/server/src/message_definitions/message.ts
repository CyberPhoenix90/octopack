import { MessageTypes } from './message_types';
import { Log } from 'logger';
import { BuildResponseData, BuildRequestData } from './build_data';

export interface Message<T extends MessageTypes = MessageTypes> {
	type: T;
	data?: T extends MessageTypes.LOGS_REQUEST
		? undefined
		: T extends MessageTypes.LOGS_RESPONSE
		? Log[]
		: T extends MessageTypes.BUILD_REQUEST
		? BuildRequestData
		: T extends MessageTypes.BUILD_RESPONSE
		? BuildResponseData
		: never;
}
