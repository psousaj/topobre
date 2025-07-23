import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
    SEMRESATTRS_SERVICE_NAME,
    ATTR_SERVICE_NAME,
    SEMRESATTRS_SERVICE_VERSION,
    ATTR_SERVICE_VERSION,
    SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
    SEMRESATTRS_SERVICE_NAMESPACE,
} from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { metrics, trace } from '@opentelemetry/api';
// import type { IncomingMessage, ServerResponse } from 'http';
import { logger } from '@topobre/winston';
import { env } from '@topobre/env';

let sdk: NodeSDK;
let telemetryInitialized = false;

interface TelemetryConfig {
    serviceName: string;
    serviceVersion?: string;
    environment?: string;
    otlpEndpoint?: string;
    prometheusPort?: number;
    prometheusHost?: string;
}

export function initTelemetry(config: TelemetryConfig | string) {
    if (telemetryInitialized) {
        logger.warn('[OTEL] Telemetry already initialized');
        return;
    }

    // Permite passar apenas o nome do serviço como string
    const telemetryConfig = typeof config === 'string'
        ? { serviceName: config }
        : config;

    const {
        serviceName,
        serviceVersion = '1.0.0',
        environment = env.NODE_ENV,
        otlpEndpoint = env.OTEL_EXPORTER_OTLP_TRACES,
        prometheusPort = env.PROMETHEUS_PORT,
        prometheusHost = env.PROMETHEUS_HOST || `localhost`,
    } = telemetryConfig;

    // Resource comum  
    const resource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: serviceName,
        [ATTR_SERVICE_VERSION]: serviceVersion,
        [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
        [SEMRESATTRS_SERVICE_NAMESPACE]: 'monorepo',
    });

    // OTLP Trace Exporter para traces (compatível com Jaeger)
    const traceExporter = new OTLPTraceExporter({
        url: otlpEndpoint,
    });

    // Prometheus Exporter para métricas
    const prometheusExporter = new PrometheusExporter({
        port: prometheusPort,
        preventServerStart: false,
    });

    // Meter Provider para métricas
    const meterProvider = new MeterProvider({
        resource,
        readers: [prometheusExporter],
    });

    // Registrar o meter provider globalmente
    metrics.setGlobalMeterProvider(meterProvider);

    // Configuração do SDK
    sdk = new NodeSDK({
        resource,
        spanProcessor: new BatchSpanProcessor(traceExporter),
        instrumentations: [getNodeAutoInstrumentations({
            // Desabilitar instrumentações desnecessárias
            '@opentelemetry/instrumentation-fs': {
                enabled: false,
            },
            '@opentelemetry/instrumentation-net': {
                enabled: false,
            },
            '@opentelemetry/instrumentation-dns': {
                enabled: false,
            },
            // Habilitar instrumentações importantes
            '@opentelemetry/instrumentation-fastify': {
                enabled: true,
            },
            '@opentelemetry/instrumentation-http': {
                enabled: true,
                requestHook: (span, request) => {
                    const incomingMessage = request as any;
                    span.setAttributes({
                        'http.request.header.user-agent': incomingMessage.headers['user-agent'] || '',
                        'http.request.header.content-type': incomingMessage.headers['content-type'] || '',
                    });
                },
                responseHook: (span, response) => {
                    const serverResponse = response as any;
                    span.setAttributes({
                        'http.response.header.content-type': serverResponse.getHeader('content-type') || '',
                    });
                }
            },
            '@opentelemetry/instrumentation-winston': {
                enabled: true,
            },
            '@opentelemetry/instrumentation-pg': {
                enabled: true,
            },
            '@opentelemetry/instrumentation-ioredis': {
                enabled: true,
            }
        })],
    });

    try {
        sdk.start();
        telemetryInitialized = true;

        logger.info(`[OTEL] ✅ Telemetry initialized`);
        logger.info(`[OTEL] 📊 Service: ${serviceName} (${environment})`);
        logger.info(`[OTEL] 🔍 OTLP Traces: ${otlpEndpoint}`);
        logger.info(`[OTEL] 📈 Prometheus: http://${prometheusHost}:${prometheusPort}/metrics`);

    } catch (error) {
        logger.error('[OTEL] ❌ Failed to initialize telemetry:', error);
        throw error;
    }

    // Graceful shutdown
    const shutdown = async () => {
        if (!telemetryInitialized) return;

        try {
            await sdk.shutdown();
            logger.info('[OTEL] ✅ Telemetry shutdown completed');
        } catch (error) {
            logger.error('[OTEL] ❌ Error during shutdown:', error);
        } finally {
            process.exit(0);
        }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    process.on('beforeExit', shutdown);
}

// Exportar tracer
export const getTracer = (name: string, version?: string) => {
    return trace.getTracer(name, version);
};

// Exportar meter
export const getMeter = (name: string, version?: string) => {
    return metrics.getMeter(name, version);
};

// Função para criar span ativo
export const withSpan = <T>(name: string, fn: (span: any) => T | Promise<T>): T | Promise<T> => {
    const tracer = getTracer('custom-tracer');
    return tracer.startActiveSpan(name, (span) => {
        try {
            const result = fn(span);
            if (result instanceof Promise) {
                return result
                    .then((res) => {
                        span.setStatus({ code: 1 }); // OK
                        return res;
                    })
                    .catch((error) => {
                        span.setStatus({ code: 2, message: error.message }); // ERROR
                        span.recordException(error);
                        throw error;
                    })
                    .finally(() => span.end());
            } else {
                span.setStatus({ code: 1 });
                span.end();
                return result;
            }
        } catch (error: any) {
            span.setStatus({ code: 2, message: error.message });
            span.recordException(error);
            span.end();
            throw error;
        }
    });
};

// Função para adicionar atributos ao span ativo
export const addSpanAttributes = (attributes: Record<string, string | number | boolean>) => {
    const span = trace.getActiveSpan();
    if (span) {
        span.setAttributes(attributes);
    }
};

// Função para adicionar evento ao span ativo
export const addSpanEvent = (name: string, attributes?: Record<string, string | number | boolean>) => {
    const span = trace.getActiveSpan();
    if (span) {
        span.addEvent(name, attributes);
    }
};

// Decorator para instrumentar métodos (TypeScript)
export function Traced(operationName?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const spanName = operationName || `${target.constructor.name}.${propertyKey}`;
            return withSpan(spanName, async (span) => {
                // Adicionar informações sobre a classe e método
                span.setAttributes({
                    'code.function': propertyKey,
                    'code.namespace': target.constructor.name,
                });

                return originalMethod.apply(this, args);
            });
        };

        return descriptor;
    };
}

// Criar métricas comuns
export const createCounter = (name: string, description: string, unit?: string) => {
    const meter = getMeter('custom-metrics');
    return meter.createCounter(name, { description, unit });
};

export const createHistogram = (name: string, description: string, unit?: string) => {
    const meter = getMeter('custom-metrics');
    return meter.createHistogram(name, { description, unit });
};

export const createGauge = (name: string, description: string, unit?: string) => {
    const meter = getMeter('custom-metrics');
    return meter.createObservableGauge(name, { description, unit });
};

// Verificar se a telemetria está inicializada
export const isInitialized = () => telemetryInitialized;

// Exportar APIs do OpenTelemetry para uso direto
export { trace, metrics } from '@opentelemetry/api';
export { SpanStatusCode, SpanKind } from '@opentelemetry/api';