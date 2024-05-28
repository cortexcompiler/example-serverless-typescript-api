import { Tracer } from '@aws-lambda-powertools/tracer';
import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics } from '@aws-lambda-powertools/metrics';

export const logger = new Logger();
export const tracer = new Tracer();
export const metrics = new Metrics();
