import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';

let sdk: NodeSDK;

export function initTelemetry(serviceName: string) {
    const traceExporter = new OTLPTraceExporter();
    const logExporter = new OTLPLogExporter();

    const logRecordProcessor = new BatchLogRecordProcessor(logExporter);

    const loggerProvider = new LoggerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        })
    });
    loggerProvider.addLogRecordProcessor(logRecordProcessor);

    sdk = new NodeSDK({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
        traceExporter,
        loggerProvider, // Adiciona o logger provider
        instrumentations: [getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': {
                enabled: false,
            },
        })],
    });

    sdk.start();

    console.log(`Telemetry initialized for service: ${serviceName}`);

    process.on('SIGTERM', () => {
        sdk.shutdown()
            .then(() => console.log('Tracing and logging terminated'))
            .catch((error) => console.log('Error terminating telemetry', error))
            .finally(() => process.exit(0));
    });
}
