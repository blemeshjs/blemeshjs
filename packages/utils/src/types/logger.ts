/**
 * Log level, which allows filtering logs by importance.
 */
export class LogLevel {
  /** Lowest priority. Usually names of called methods or callbacks received. */
  public static debug = new LogLevel(0);
  /** Low priority messages what the service is doing. */
  public static verbose = new LogLevel(1);
  /** Messages about completed tasks. */
  public static info = new LogLevel(5);
  /** Messages about application level events, in this case DFU messages in human-readable form. */
  public static application = new LogLevel(10);
  /** Important messages. */
  public static warning = new LogLevel(15);
  /** Highest priority messages with errors. */
  public static error = new LogLevel(20);

  private constructor(private $value: number) {}
  toString(): string {
    switch (this) {
      case LogLevel.debug:
        return "D";
      case LogLevel.verbose:
        return "V";
      case LogLevel.info:
        return "I";
      case LogLevel.application:
        return "A";
      case LogLevel.warning:
        return "W";
      case LogLevel.error:
        return "E";
      default:
        return "?";
    }
  }
}

/** The log category indicates the component that created the log entry. */
export enum LogCategory {
  /** Log created by the Bearer component. */
  bearer = "Bearer",
  /** Log created by the Proxy component. */
  proxy = "Proxy",
  /** Log created by the Network layer. */
  network = "Network",
  /** Log created by the Lower Transport layer. */
  lowerTransport = "LowerTransport",
  /** Log created by the Upper Transport layer. */
  upperTransport = "UpperTransport",
  /** Log created by the Access layer. */
  access = "Access",
  /** Log created by the Foundation layer models. */
  foundationModel = "FoundationModel",
  /** Log created by the Access layer model. */
  model = "Model",
  /** Log created by the Provisioning component. */
  provisioning = "Provisioning",
}

export abstract class LoggerHandler {
  /**
   * This method is called whenever a new log entry is to be saved.
   *
   * @param message The message.
   * @param category The message category.
   * @param level The log level.
   */
  public abstract log(message: string, category: LogCategory, level: LogLevel): void;

  public i(category: LogCategory, message: string) {
    this.log(message, category, LogLevel.info);
  }

  public d(category: LogCategory, message: string) {
    this.log(message, category, LogLevel.debug);
  }

  public w(category: LogCategory, message: string) {
    this.log(message, category, LogLevel.warning);
  }

  public v(category: LogCategory, message: string) {
    this.log(message, category, LogLevel.verbose);
  }

  public e(category: LogCategory, message: string) {
    this.log(message, category, LogLevel.error);
  }
}
