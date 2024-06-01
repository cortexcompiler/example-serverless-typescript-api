import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
// NOTE from Powertools: "We guarantee support only for Middy.js v4.x, that you can install it by running npm i @middy/core@~4"
import middy from '@middy/core';
import { logger } from './powertools';
import { metrics } from './powertools';
// The Tracer requires the Lambda to have active tracing enabled
import { tracer } from './powertools';

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
    let response: APIGatewayProxyResult;

    // Log the incoming event
    logger.info('Lambda invocation event', { event });

    // Capture cold start metrics
    metrics.captureColdStartMetric();

    try {
        // hello world code
        response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'hello world',
            }),
        };
        tracer.putAnnotation('successfulGreeting', true);

        logger.info(`Successful response from API endpoint: ${event.path}`, response.body);
    } catch (err) {
        // Error handling
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
        logger.error(`Error response from API endpoint: ${err}`, response.body);
    } finally {
        // Close subsegments (the AWS Lambda one is closed automatically)
        metrics.publishStoredMetrics();
    }

    return response;
};

// Middy with Powertools best practices:
// https://middy.js.org/docs/integrations/lambda-powertools/#best-practices

export const lambdaHandler = middy(handler).use(captureLambdaHandler(tracer)).use(injectLambdaContext(logger));

// export const handler = middy(() => { /* ... */ })
//   .use(captureLambdaHandler(tracer))
//   .use(injectLambdaContext(logger, { logEvent: true }))
//   .use(logMetrics(metrics, { captureColdStartMetric: true }));
