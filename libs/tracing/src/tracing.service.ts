import {
  BatchSpanProcessor
} from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { PrismaInstrumentation } from '@prisma/instrumentation';

export function initializeTracing(serviceName: string): NodeSDK {
  const otlpExporter = new OTLPTraceExporter({
    url: process.env['OTLP_COLLECTOR_URL'] ?? 'http://jaeger:4317/v1/traces',
  });

  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: '1.0.0',
    }),
    spanProcessor: new BatchSpanProcessor(otlpExporter),
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new NestInstrumentation(),
      new PinoInstrumentation(),
      new PrismaInstrumentation(),
    ],
  });

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(
        () => console.log('SDK shut down successfully'),
        (err: Error) => console.log('Error shutting down SDK', err)
      )
      .finally(() => process.exit(0));
  });

  return sdk;
}
