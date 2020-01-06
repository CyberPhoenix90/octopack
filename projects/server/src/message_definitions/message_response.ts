import { MessageTypes } from './message_types';
import { Message } from './message';

export type MessageResponse<T extends MessageTypes = MessageTypes> = T extends MessageTypes.LOGS_REQUEST
	? Message<MessageTypes.LOGS_RESPONSE>
	: never;
