import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { captureAWSv3Client } from 'aws-xray-sdk-core';
import { logger } from '../powertools';

export const TABLE_NAME = process.env.TABLE_NAME;

let ddbDocument: DynamoDBDocument | undefined;

export function getDdbDocument(): DynamoDBDocument {
  const endPointOverride = process.env.ENDPOINT_OVERRIDE;

  if (!ddbDocument) {
    let ddbClient: DynamoDBClient;

    if (endPointOverride) {
      logger.info('Overriding DynamoDB Endpoint for local testing', { endpoint: endPointOverride });

      ddbClient = new DynamoDBClient({ endpoint: endPointOverride });
    } else {
      ddbClient = captureAWSv3Client(new DynamoDBClient({}));
    }

    ddbDocument = DynamoDBDocument.from(ddbClient);

    // TODO: when would we want the DynamoDBDocumentClient?
    // ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
  }

  return ddbDocument;
}

// TODO: Figure out a better way to support testing.
export function reset() {
  ddbDocument = undefined;
}
