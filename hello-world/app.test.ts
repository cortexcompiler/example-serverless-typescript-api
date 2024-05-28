import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { lambdaHandler } from './app';
import { expect, describe, it } from '@jest/globals';

jest.spyOn(Logger.prototype, 'info').mockImplementation(jest.fn());
jest.spyOn(Metrics.prototype, 'addMetric').mockImplementation(jest.fn());
jest.spyOn(Metrics.prototype, 'publishStoredMetrics').mockImplementation(jest.fn());

describe('Unit test for app handler', function () {
    it('verifies successful response', async () => {
        const event: Partial<APIGatewayProxyEvent> = {
            httpMethod: 'get',
            body: '',
            path: '/hello',
        };
        const context: Partial<Context> = {};
        const result: APIGatewayProxyResult = await lambdaHandler(event as APIGatewayProxyEvent, context as Context);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(
            JSON.stringify({
                message: 'hello world',
            }),
        );
    });
});
