import { MessageTypes } from './message_types';
import { Message } from './message';

export type MessageResponse<T extends MessageTypes = MessageTypes> = T extends MessageTypes.LOGS_REQUEST
	? Message<MessageTypes.LOGS_RESPONSE>
	: T extends MessageTypes.BUILD_REQUEST
	? Message<MessageTypes.BUILD_RESPONSE>
	: never;
