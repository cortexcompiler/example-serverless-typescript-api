import { logger } from './powertools';

export function putGreeting(country: string, greeting: string) {
  // TODO: Put greeting into DynamoDB
  logger.info('Putting greeting', { country, greeting });
}
