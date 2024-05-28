process.env.AWS_XRAY_CONTEXT_MISSING = 'IGNORE_ERROR';
process.env.AWS_SAM_LOCAL = 'true';

process.env.POWERTOOLS_SERVICE_NAME = 'helloWorld';
process.env.POWERTOOLS_METRICS_NAMESPACE = 'sam-ts-powertools-app';

process.env.POWERTOOLS_TRACE_ENABLED = false;
