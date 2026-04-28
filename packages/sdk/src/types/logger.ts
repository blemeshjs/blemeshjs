import { LogCategory, LoggerHandler, LogLevel } from "@blemeshjs/utils";

export class ConsoleLogger extends LoggerHandler {
  private minLevel: LogLevel;

  constructor(minLevel: LogLevel = LogLevel.verbose) {
    super();
    this.minLevel = minLevel;
  }

  private levelPriority(level: LogLevel): number {
    switch (level) {
      case LogLevel.verbose:
        return 0;
      case LogLevel.debug:
        return 1;
      case LogLevel.info:
        return 2;
      case LogLevel.warning:
        return 3;
      case LogLevel.error:
        return 4;
      default:
        return 0;
    }
  }

  log(message: string, category: LogCategory, level: LogLevel): void {
    if (this.levelPriority(level) < this.levelPriority(this.minLevel)) return;

    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${level}] [${category}] ${message}`;

    switch (level) {
      case LogLevel.error:
        console.error(formatted);
        break;
      case LogLevel.warning:
        console.warn(formatted);
        break;
      case LogLevel.info:
        console.info(formatted);
        break;
      case LogLevel.debug:
        console.debug(formatted);
        break;
      case LogLevel.verbose:
      default:
        console.log(formatted);
    }
  }
}

export class CompositeLogger extends LoggerHandler {
  constructor(private handlers: LoggerHandler[]) {
    super();
  }

  log(message: string, category: LogCategory, level: LogLevel): void {
    for (const handler of this.handlers) {
      handler.log(message, category, level);
    }
  }
}

export const logger = new CompositeLogger([new ConsoleLogger(LogLevel.verbose)]);
