import { Metrics } from '@aws-lambda-powertools/metrics';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { lambdaHandler } from './app';
import { describe, expect, jest, it } from '@jest/globals';

// quiet down tests and spy on console logs
const consoleInfoSpy = jest.spyOn(global.console, 'info').mockImplementation(jest.fn());
jest.spyOn(global.console, 'error').mockImplementation(jest.fn());
jest.spyOn(Metrics.prototype, 'publishStoredMetrics').mockImplementation(jest.fn());

const fakeDateTime = '2024-04-16T00:00:00.000Z';

describe('Greeting handler', function () {
    let event: Partial<APIGatewayProxyEvent>;
    let context: Partial<Context>;
    const testRequestId = 'test-Request-Id';

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date(fakeDateTime));
        context = { awsRequestId: testRequestId };
    });

    describe('Given a missing country path parameter', function () {
        beforeEach(() => {
            event = {
                httpMethod: 'get',
                path: '/greeting/{country}',
            };
        });

        it('returns an appropriate http error response', async () => {
            const result = await lambdaHandler(event as APIGatewayProxyEvent, context as Context);

            expect(result).toEqual({
                statusCode: 400,
                body: 'Missing country path parameter',
                headers: { 'Content-Type': 'text/plain' },
            });
        });
    });

    describe('Given valid input', function () {
        beforeEach(() => {
            event = {
                httpMethod: 'get',
                path: '/greeting/{country}',
                pathParameters: { country: 'UK' },
            };
        });

        describe('and a missing country', function () {
            beforeEach(() => {
                event.pathParameters = { country: 'Kiribati' };
            });

            it('returns the default greeting', async () => {
                const result = await lambdaHandler(event as APIGatewayProxyEvent, context as Context);

                expect(result).toEqual({
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Hello' }),
                });
            });
        });

        it('returns the appropriate response for the country', async () => {
            const result = await lambdaHandler(event as APIGatewayProxyEvent, context as Context);

            expect(result).toEqual({
                statusCode: 200,
                body: JSON.stringify({ message: 'Wotcha' }),
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
                path: '/greeting/{country}',
                body: '{"message":"Wotcha"}',
            };

            expect(consoleInfoSpy).toHaveBeenNthCalledWith(2, JSON.stringify(expectedLog, null, 4));
        });
    });
});
