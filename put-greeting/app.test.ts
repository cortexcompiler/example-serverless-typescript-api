import { describe, expect, jest, it } from '@jest/globals';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { DynamoDBDocument, PutCommand, PutCommandInput, PutCommandOutput } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { CountryGreeting } from './model';
import { lambdaHandler } from './app';

// quiet down tests and spy on console logs
jest.spyOn(global.console, 'info').mockImplementation(jest.fn());
jest.spyOn(global.console, 'error').mockImplementation(jest.fn());
jest.spyOn(Metrics.prototype, 'publishStoredMetrics').mockImplementation(jest.fn());

const ddbMock = mockClient(DynamoDBDocument);
ddbMock.resolves({});

beforeEach(() => {
  ddbMock.reset();
});

describe('Put CountryGreeting handler', function () {
  let event: Partial<APIGatewayProxyEvent>;
  let context: Partial<Context>;
  const testTableName = 'TestTable';

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

  describe('Given a missing table name env variable', function () {
    let tableName: string | undefined;
    beforeEach(() => {
      event = {
        httpMethod: 'put',
        path: '/greeting/{country}',
        pathParameters: { country: 'UK' },
      };
      tableName = process.env.TABLE_NAME;
      delete process.env['TABLE_NAME'];
    });

    afterEach(() => {
      process.env.TABLE_NAME = tableName;
    });

    it('fails with an error', async () => {
      const result = await lambdaHandler(event as APIGatewayProxyEvent, context as Context);

      expect(result).toEqual({
        statusCode: 500,
        body: 'Unexpected error',
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
    const testGreeting: CountryGreeting = { country: 'UK', greeting: 'Wotcha' };

    beforeEach(() => {
      event = {
        httpMethod: 'put',
        path: '/greeting/{country}',
        pathParameters: { country: testGreeting.country },
        body: JSON.stringify({ greeting: testGreeting.greeting }),
      };

      ddbMock.on(PutCommand).resolves({} as Partial<PutCommandOutput>);
    });

    it('puts the country greeting into the datastore', async () => {
      const expectedPutRequest: PutCommandInput = {
        TableName: testTableName,
        Item: {
          PK: 'COUNTRY#UK',
          ...testGreeting,
        },
      };

      await lambdaHandler(event as APIGatewayProxyEvent, context as Context);

      expect(ddbMock).toHaveReceivedCommandWith(PutCommand, expectedPutRequest);
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
