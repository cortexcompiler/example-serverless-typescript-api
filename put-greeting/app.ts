import { BadRequest } from 'http-errors';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { logger } from './powertools';
import { metrics } from './powertools';
import { tracer } from './powertools';
import { putGreeting } from './greeting-service';

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.pathParameters?.country) {
    throw new BadRequest('Missing country path parameter');
  }

  const country = event.pathParameters?.country;

  const countryGreeting = parseEventBody(event.body);

  putGreeting(country, countryGreeting.greeting);

  return {
    statusCode: 200,
    body: JSON.stringify({ country: country, greeting: countryGreeting.greeting }),
  };
};

function parseEventBody(eventData: string | null): { greeting: string } {
  if (!eventData) {
    throw new BadRequest('Missing request body');
  }

  const payload = JSON.parse(eventData) as { greeting: string };

  return payload;
}

export const lambdaHandler = middy(handler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
  .use(logMetrics(metrics, { captureColdStartMetric: true }))
  .use(
    httpErrorHandler({
      logger: (error) => {
        logger.error('Unexpected error', error);
      },
      fallbackMessage: 'Unexpected error',
    })
  );
