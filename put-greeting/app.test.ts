import { Metrics } from '@aws-lambda-powertools/metrics';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { lambdaHandler } from './app';
import { describe, expect, jest, it } from '@jest/globals';
import * as greetingService from './greeting-service';

// quiet down tests and spy on console logs
jest.spyOn(global.console, 'info').mockImplementation(jest.fn());
jest.spyOn(global.console, 'error').mockImplementation(jest.fn());
jest.spyOn(Metrics.prototype, 'publishStoredMetrics').mockImplementation(jest.fn());

const putGreetingSpy = jest.spyOn(greetingService, 'putGreeting');

describe('Put Greeting handler', function () {
  let event: Partial<APIGatewayProxyEvent>;
  let context: Partial<Context>;

  beforeEach(() => {
    context = {};
  });

  describe('Given a missing country path parameter', function () {
    beforeEach(() => {
      event = {
        httpMethod: 'put',
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

  describe('Given a missing body', function () {
    beforeEach(() => {
      event = {
        httpMethod: 'put',
        path: '/greeting/{country}',
        pathParameters: { country: 'UK' },
      };
    });

    it('returns an appropriate http error response', async () => {
      const result = await lambdaHandler(event as APIGatewayProxyEvent, context as Context);

      expect(result).toEqual({
        statusCode: 400,
        body: 'Missing request body',
        headers: { 'Content-Type': 'text/plain' },
      });
    });
  });

  describe('Given valid input', function () {
    beforeEach(() => {
      event = {
        httpMethod: 'put',
        path: '/greeting/{country}',
        pathParameters: { country: 'UK' },
        body: '{"greeting":"Wotcha"}',
      };
    });

    it('puts the country greeting into the datastore', async () => {
      const result = await lambdaHandler(event as APIGatewayProxyEvent, context as Context);

      expect(putGreetingSpy).toHaveBeenCalledWith('UK', 'Wotcha');
    });

    it('returns a successful response', async () => {
      const result = await lambdaHandler(event as APIGatewayProxyEvent, context as Context);

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify({ country: 'UK', greeting: 'Wotcha' }),
      });
    });
  });
});
