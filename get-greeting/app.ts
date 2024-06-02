import { BadRequest } from 'http-errors';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
// NOTE from Powertools: "We guarantee support only for Middy.js v4.x, that you can install it by running npm i @middy/core@~4"
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import { logger } from './powertools';
import { metrics } from './powertools';
// The Tracer requires the Lambda to have active tracing enabled
import { tracer } from './powertools';
import { getGreeting } from './greeting-service';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {APIGatewayProxyEvent} event - API Gateway Lambda Proxy Input Format
 * @param {Context} object - API Gateway Lambda $context variable
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {APIGatewayProxyResult} object - API Gateway Lambda Proxy Output Format
 *
 */
const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Lambda invocation event', { event });

  if (!event.pathParameters?.country) {
    throw new BadRequest('Missing country path parameter');
  }

  const country = event.pathParameters?.country;

  const greeting = getGreeting(country);

  const response: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify({ message: greeting }),
  };

  tracer.putAnnotation('successfulGreeting', true);

  logger.info('Successful response from API endpoint', { path: event.path, body: response.body });

  return response;
};

// Middy with Powertools best practices:
// https://middy.js.org/docs/integrations/lambda-powertools/#best-practices

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
