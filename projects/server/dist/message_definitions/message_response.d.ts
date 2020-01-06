import { MessageTypes } from './message_types';
import { Message } from './message';
export declare type MessageResponse<T extends MessageTypes = MessageTypes> = T extends MessageTypes.LOGS_REQUEST ? Message<MessageTypes.LOGS_RESPONSE> : never;
//# sourceMappingURL=message_response.d.ts.map