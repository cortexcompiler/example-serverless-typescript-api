import { GetCommandInput, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import { logger } from '../powertools';
import { CountryGreeting } from '../model/model';
import { getDdbDocument, TABLE_NAME } from './db-client';

export async function getCountryGreeting(country: string): Promise<CountryGreeting | undefined> {
  const getRequest: GetCommandInput = {
    TableName: TABLE_NAME,
    Key: {
      PK: `COUNTRY#${country}`,
    },
  };

  logger.debug('Getting CountryGreeting', { getRequest });
  const ddbDocument = getDdbDocument();
  const result = await ddbDocument.get(getRequest);
  logger.debug('Get CountryGreeting Result', { result });

  let response;
  if (result && result.Item) {
    const { PK, SK, ...greeting } = result.Item;
    response = greeting as CountryGreeting;
  }

  return response;
}

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
