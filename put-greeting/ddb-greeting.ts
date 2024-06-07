import { GetCommandInput, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { logger } from './powertools';
import { getDdbDocument, TABLE_NAME } from './db-client';
import { CountryGreeting } from './model';

export async function putGreeting(greeting: CountryGreeting) {
  const putRequest: PutCommandInput = {
    TableName: TABLE_NAME,
    Item: {
      PK: `COUNTRY#${greeting.country}`,
      ...greeting,
    },
  };

  logger.debug('Putting CountryGreeting', { putRequest });
  const ddbDocument = getDdbDocument();
  const result = await ddbDocument.put(putRequest);
  logger.debug('Put CountryGreeting Result', { result });

  return result.Attributes;
}
