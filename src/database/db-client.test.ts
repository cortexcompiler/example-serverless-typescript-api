import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import * as dbClientModule from './db-client';
import { getDdbDocument, TABLE_NAME } from './db-client';

jest.mock('@aws-sdk/client-dynamodb');
const ddbClientMock = DynamoDBClient as jest.MockedClass<typeof DynamoDBClient>;

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocument: {
    from: () => ({}),
  },
}));

const loggerInfoSpy = jest.spyOn(Logger.prototype, 'info').mockImplementation(jest.fn());

const testEndpoint = 'https://test.endpoint';

describe('DynamoDB Client', () => {
  describe('given the ENDPOINT_OVERRIDE env variable is set', () => {
    beforeEach(() => {
      process.env.ENDPOINT_OVERRIDE = testEndpoint;
    });

    afterEach(() => {
      delete process.env.ENDPOINT_OVERRIDE;
      // Workaround reset the singleton
      dbClientModule.reset();
    });

    it('gets the table name from the environment', async () => {
      getDdbDocument();

      expect(TABLE_NAME).toBeDefined();
    });

    it('overrides the DynamoDB endpoint for local testing', async () => {
      getDdbDocument();

      expect(ddbClientMock).toHaveBeenCalledWith({ endpoint: testEndpoint });
    });

    it('logs a message to indicate that the endpoint is being overridden', async () => {
      getDdbDocument();

      expect(loggerInfoSpy).toHaveBeenCalledWith('Overriding DynamoDB Endpoint for local testing', { endpoint: testEndpoint });
    });
  });
});
