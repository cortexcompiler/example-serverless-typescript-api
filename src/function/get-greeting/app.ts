import { BadRequest } from 'http-errors';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
// NOTE from Powertools: "We guarantee support only for Middy.js v4.x, that you can install it by running npm i @middy/core@~4"
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
// The Tracer requires the Lambda to have active tracing enabled
import { logger, metrics, tracer } from '../../powertools';
import { CountryGreeting } from '../../model/model';
import { getCountryGreeting } from '../../database/ddb-greeting';

const DEFAULT_GREETING: CountryGreeting = {
  country: 'USA',
  greeting: 'Hello',
};

/**
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {APIGatewayProxyEvent} event - API Gateway Lambda Proxy Input Format
 * @param {Context} object - API Gateway Lambda $context variable
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {APIGatewayProxyResult} object - API Gateway Lambda Proxy Output Format
 */
const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Lambda invocation event', { event });

  if (!event.pathParameters?.country) {
    throw new BadRequest('Missing country path parameter');
  }

  checkForRequiredEnvVariable('TABLE_NAME');

  const country = event.pathParameters?.country;

  let countryGreeting = await getCountryGreeting(country);

  if (!countryGreeting) {
    countryGreeting = DEFAULT_GREETING;
  }

  const response: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify({ message: countryGreeting.greeting }),
  };

  tracer.putAnnotation('successfulGreeting', true);

  logger.info('Successful response from API endpoint', { path: event.path, body: response.body });

  return response;
};

export function checkForRequiredEnvVariable(variableName: string) {
  if (!process.env[variableName]) {
    throw new Error(`Missing ${variableName} environment variable`);
  }
}

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
