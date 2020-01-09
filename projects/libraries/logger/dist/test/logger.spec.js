"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const src_1 = require("../src");
const callback_logger_adapter_1 = require("../src/adapters/callback_logger_adapter");
const log_level_prepender_logger_enhancer_1 = require("../src/enhancers/log_level_prepender_logger_enhancer");
const logger_1 = require("../src/logger");
describe('Logger', () => {
    it('works', () => {
        let loggedText = '';
        const textToBeLogged = 'hey there';
        const logger = new logger_1.Logger({
            adapters: [
                new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                    loggedText = log.text;
                })
            ],
            enhancers: []
        });
        logger.info(textToBeLogged);
        assert(loggedText === textToBeLogged);
    });
    it('falls back to pass through if no enhancer array is passed', () => {
        let loggedText = '';
        const textToBeLogged = 'hey there';
        const logger = new logger_1.Logger({
            adapters: [
                new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                    loggedText = log.text;
                })
            ]
        });
        logger.info(textToBeLogged);
        assert(loggedText === textToBeLogged);
    });
    describe('Log level prepender', () => {
        it('works with passed string', () => {
            let loggedText = '';
            const textToBeLogged = 'hey there';
            const logger = new logger_1.Logger({
                adapters: [
                    new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                        loggedText = log.text;
                    })
                ],
                enhancers: [new log_level_prepender_logger_enhancer_1.LogLevelPrependerLoggerEnhancer()]
            });
            logger.info(textToBeLogged);
            assert(loggedText.includes(textToBeLogged) && loggedText.includes(src_1.LogLevel.INFO));
        });
        it('works with passed object', () => {
            let loggedText;
            const logger = new logger_1.Logger({
                adapters: [
                    new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                        loggedText = log.text;
                    })
                ],
                enhancers: [new log_level_prepender_logger_enhancer_1.LogLevelPrependerLoggerEnhancer()]
            });
            logger.debug({ dummy: 'tada' });
            assert(loggedText.includes(src_1.LogLevel.DEBUG));
        });
    });
    describe('Log level filter', () => {
        it('works with debug level', () => {
            let loggedText = '';
            const textToBeLogged = 'hey there';
            const logger = new logger_1.Logger({
                adapters: [
                    new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                        loggedText = log.text;
                    })
                ],
                enhancers: [new src_1.LogLevelFilterLoggerEnhancer(src_1.LogLevel.DEBUG)]
            });
            logger.debug(textToBeLogged);
            assert(loggedText === textToBeLogged);
            loggedText = '';
            logger.info(textToBeLogged);
            assert(loggedText === textToBeLogged);
            loggedText = '';
            logger.warn(textToBeLogged);
            assert(loggedText === textToBeLogged);
            loggedText = '';
            logger.error(textToBeLogged);
            assert(loggedText === textToBeLogged);
            loggedText = '';
        });
        it('works with info level', () => {
            let loggedText = '';
            const textToBeLogged = 'hey there';
            const logger = new logger_1.Logger({
                adapters: [
                    new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                        loggedText = log.text;
                    })
                ],
                enhancers: [new src_1.LogLevelFilterLoggerEnhancer(src_1.LogLevel.INFO)]
            });
            logger.debug(textToBeLogged);
            assert(loggedText === '');
            loggedText = '';
            logger.info(textToBeLogged);
            assert(loggedText === textToBeLogged);
            loggedText = '';
            logger.warn(textToBeLogged);
            assert(loggedText === textToBeLogged);
            loggedText = '';
            logger.error(textToBeLogged);
            assert(loggedText === textToBeLogged);
            loggedText = '';
        });
        it('works with warn level', () => {
            let loggedText = '';
            const textToBeLogged = 'hey there';
            const logger = new logger_1.Logger({
                adapters: [
                    new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                        loggedText = log.text;
                    })
                ],
                enhancers: [new src_1.LogLevelFilterLoggerEnhancer(src_1.LogLevel.WARN)]
            });
            logger.debug(textToBeLogged);
            assert(loggedText === '');
            loggedText = '';
            logger.info(textToBeLogged);
            assert(loggedText === '');
            loggedText = '';
            logger.warn(textToBeLogged);
            assert(loggedText === textToBeLogged);
            loggedText = '';
            logger.error(textToBeLogged);
            assert(loggedText === textToBeLogged);
            loggedText = '';
        });
        it('works with error level', () => {
            let loggedText = '';
            const textToBeLogged = 'hey there';
            const logger = new logger_1.Logger({
                adapters: [
                    new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                        loggedText = log.text;
                    })
                ],
                enhancers: [new src_1.LogLevelFilterLoggerEnhancer(src_1.LogLevel.ERROR)]
            });
            logger.debug(textToBeLogged);
            assert(loggedText === '');
            loggedText = '';
            logger.info(textToBeLogged);
            assert(loggedText === '');
            loggedText = '';
            logger.warn(textToBeLogged);
            assert(loggedText === '');
            loggedText = '';
            logger.error(textToBeLogged);
            assert(loggedText === textToBeLogged);
            loggedText = '';
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2dnZXIuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFpQztBQUNqQyxnQ0FBZ0U7QUFDaEUscUZBQWdGO0FBQ2hGLDhHQUF1RztBQUN2RywwQ0FBdUM7QUFFdkMsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7SUFDdkIsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDaEIsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQztRQUNuQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQztZQUN6QixRQUFRLEVBQUU7Z0JBQ1QsSUFBSSwrQ0FBcUIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO29CQUNqQyxVQUFVLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFDdkIsQ0FBQyxDQUFDO2FBQ0Y7WUFDRCxTQUFTLEVBQUUsRUFBRTtTQUNiLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUIsTUFBTSxDQUFDLFVBQVUsS0FBSyxjQUFjLENBQUMsQ0FBQztJQUN2QyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywyREFBMkQsRUFBRSxHQUFHLEVBQUU7UUFDcEUsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQztRQUNuQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQztZQUN6QixRQUFRLEVBQUU7Z0JBQ1QsSUFBSSwrQ0FBcUIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO29CQUNqQyxVQUFVLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFDdkIsQ0FBQyxDQUFDO2FBQ0Y7U0FDRCxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxVQUFVLEtBQUssY0FBYyxDQUFDLENBQUM7SUFDdkMsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO1FBQ3BDLEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7WUFDbkMsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQztZQUNuQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQztnQkFDekIsUUFBUSxFQUFFO29CQUNULElBQUksK0NBQXFCLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTt3QkFDakMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ3ZCLENBQUMsQ0FBQztpQkFDRjtnQkFDRCxTQUFTLEVBQUUsQ0FBQyxJQUFJLHFFQUErQixFQUFFLENBQUM7YUFDbEQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLGNBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25GLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtZQUNuQyxJQUFJLFVBQWtCLENBQUM7WUFDdkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUM7Z0JBQ3pCLFFBQVEsRUFBRTtvQkFDVCxJQUFJLCtDQUFxQixDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7d0JBQ2pDLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO29CQUN2QixDQUFDLENBQUM7aUJBQ0Y7Z0JBQ0QsU0FBUyxFQUFFLENBQUMsSUFBSSxxRUFBK0IsRUFBRSxDQUFDO2FBQ2xELENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxjQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtRQUNqQyxFQUFFLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1lBQ2pDLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUNwQixNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUM7WUFFbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUM7Z0JBQ3pCLFFBQVEsRUFBRTtvQkFDVCxJQUFJLCtDQUFxQixDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7d0JBQ2pDLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO29CQUN2QixDQUFDLENBQUM7aUJBQ0Y7Z0JBQ0QsU0FBUyxFQUFFLENBQUMsSUFBSSxrQ0FBNEIsQ0FBQyxjQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDN0QsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsVUFBVSxLQUFLLGNBQWMsQ0FBQyxDQUFDO1lBQ3RDLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFFaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsVUFBVSxLQUFLLGNBQWMsQ0FBQyxDQUFDO1lBQ3RDLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFFaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsVUFBVSxLQUFLLGNBQWMsQ0FBQyxDQUFDO1lBQ3RDLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFFaEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsVUFBVSxLQUFLLGNBQWMsQ0FBQyxDQUFDO1lBQ3RDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1lBQ2hDLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUNwQixNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUM7WUFFbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUM7Z0JBQ3pCLFFBQVEsRUFBRTtvQkFDVCxJQUFJLCtDQUFxQixDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7d0JBQ2pDLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO29CQUN2QixDQUFDLENBQUM7aUJBQ0Y7Z0JBQ0QsU0FBUyxFQUFFLENBQUMsSUFBSSxrQ0FBNEIsQ0FBQyxjQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDNUQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFFaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsVUFBVSxLQUFLLGNBQWMsQ0FBQyxDQUFDO1lBQ3RDLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFFaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsVUFBVSxLQUFLLGNBQWMsQ0FBQyxDQUFDO1lBQ3RDLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFFaEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsVUFBVSxLQUFLLGNBQWMsQ0FBQyxDQUFDO1lBQ3RDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1lBQ2hDLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUNwQixNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUM7WUFFbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUM7Z0JBQ3pCLFFBQVEsRUFBRTtvQkFDVCxJQUFJLCtDQUFxQixDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7d0JBQ2pDLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO29CQUN2QixDQUFDLENBQUM7aUJBQ0Y7Z0JBQ0QsU0FBUyxFQUFFLENBQUMsSUFBSSxrQ0FBNEIsQ0FBQyxjQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDNUQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFFaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFFaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsVUFBVSxLQUFLLGNBQWMsQ0FBQyxDQUFDO1lBQ3RDLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFFaEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsVUFBVSxLQUFLLGNBQWMsQ0FBQyxDQUFDO1lBQ3RDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1lBQ2pDLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUNwQixNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUM7WUFFbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUM7Z0JBQ3pCLFFBQVEsRUFBRTtvQkFDVCxJQUFJLCtDQUFxQixDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7d0JBQ2pDLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO29CQUN2QixDQUFDLENBQUM7aUJBQ0Y7Z0JBQ0QsU0FBUyxFQUFFLENBQUMsSUFBSSxrQ0FBNEIsQ0FBQyxjQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDN0QsQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFFaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFFaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFFaEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsVUFBVSxLQUFLLGNBQWMsQ0FBQyxDQUFDO1lBQ3RDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyxDQUFDIn0=