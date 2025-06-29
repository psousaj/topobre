import Transport from 'winston-transport';
import { logs, SeverityNumber, LogRecord } from '@opentelemetry/api-logs';
import { trace, SpanStatusCode } from '@opentelemetry/api';

const winstonLevelToOtelSeverity = {
  error: SeverityNumber.ERROR,
  warn: SeverityNumber.WARN,
  info: SeverityNumber.INFO,
  http: SeverityNumber.INFO,
  verbose: SeverityNumber.DEBUG,
  debug: SeverityNumber.DEBUG,
  silly: SeverityNumber.TRACE,
};

export class OpenTelemetryTransport extends Transport {
  private logger: any;

  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
    this.logger = logs.getLogger('winston-logger');
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const { level, message, ...meta } = info;
    const span = trace.getActiveSpan();
    const spanContext = span?.spanContext();

    const logRecord: LogRecord = {
      body: message,
      severityNumber: winstonLevelToOtelSeverity[level as keyof typeof winstonLevelToOtelSeverity] || SeverityNumber.UNSPECIFIED,
      severityText: level,
      attributes: meta,
    };

    if (spanContext) {
      logRecord.traceId = spanContext.traceId;
      logRecord.spanId = spanContext.spanId;
      logRecord.traceFlags = spanContext.traceFlags;
    }

    this.logger.emit(logRecord);

    if (level === 'error' && span) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: message });
    }

    callback();
  }
}
