import { Metrics } from '@aws-lambda-powertools/metrics';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { lambdaHandler } from './app';
import { describe, expect, jest, it } from '@jest/globals';

// quiet down tests and spy on console logs
const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation(jest.fn());
jest.spyOn(Metrics.prototype, 'publishStoredMetrics').mockImplementation(jest.fn());

const fakeDateTime = '2024-04-16T00:00:00.000Z';

describe('hello-world handler', function () {
    describe('Given valid input', function () {
        let event: Partial<APIGatewayProxyEvent>;
        let context: Partial<Context>;
        const testRequestId = 'test-Request-Id';

        beforeEach(() => {
            jest.useFakeTimers().setSystemTime(new Date(fakeDateTime));

            event = {
                httpMethod: 'get',
                body: '',
                path: '/hello',
            };
            context = { awsRequestId: testRequestId };
        });

        it('returns a successful response', async () => {
            const result: APIGatewayProxyResult = await lambdaHandler(
                event as APIGatewayProxyEvent,
                context as Context,
            );

            expect(result).toEqual({
                statusCode: 200,
                body: JSON.stringify({
                    message: 'hello world',
                }),
            });
        });

        it('adds lambda context data to the logs', async () => {
            await lambdaHandler(event as APIGatewayProxyEvent, context as Context);

            const expectedLog = {
                cold_start: false,
                function_request_id: testRequestId,
                level: 'INFO',
                message: 'Successful response from API endpoint',
                sampling_rate: 0,
                service: 'helloWorld',
                timestamp: fakeDateTime,
                path: '/hello',
                body: '{"message":"hello world"}',
            };

            expect(consoleInfoSpy).toHaveBeenNthCalledWith(2, JSON.stringify(expectedLog, null, 4));
        });
    });
});
