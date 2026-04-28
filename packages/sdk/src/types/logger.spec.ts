import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConsoleLogger, CompositeLogger } from "./logger.js";
import { LogCategory, LogLevel, LoggerHandler } from "@blemeshjs/utils";

describe("ConsoleLogger", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  it("logs verbose messages at default minLevel", () => {
    const logger = new ConsoleLogger(LogLevel.verbose);
    logger.log("hello", LogCategory.bearer, LogLevel.verbose);
    expect(console.log).toHaveBeenCalledOnce();
  });

  it("suppresses messages below minLevel", () => {
    const logger = new ConsoleLogger(LogLevel.warning);
    logger.log("ignored", LogCategory.bearer, LogLevel.verbose);
    logger.log("ignored too", LogCategory.bearer, LogLevel.info);
    expect(console.log).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
  });

  it("routes error to console.error", () => {
    const logger = new ConsoleLogger(LogLevel.verbose);
    logger.log("oops", LogCategory.bearer, LogLevel.error);
    expect(console.error).toHaveBeenCalledOnce();
  });

  it("routes warning to console.warn", () => {
    const logger = new ConsoleLogger(LogLevel.verbose);
    logger.log("warn me", LogCategory.bearer, LogLevel.warning);
    expect(console.warn).toHaveBeenCalledOnce();
  });

  it("routes info to console.info", () => {
    const logger = new ConsoleLogger(LogLevel.verbose);
    logger.log("fyi", LogCategory.bearer, LogLevel.info);
    expect(console.info).toHaveBeenCalledOnce();
  });

  it("routes debug to console.debug", () => {
    const logger = new ConsoleLogger(LogLevel.verbose);
    logger.log("debugging", LogCategory.bearer, LogLevel.debug);
    expect(console.debug).toHaveBeenCalledOnce();
  });

  it("includes level, category, and message in output", () => {
    const logger = new ConsoleLogger(LogLevel.verbose);
    logger.log("test-message", LogCategory.bearer, LogLevel.info);
    const call = (console.info as unknown as ReturnType<typeof vi.spyOn>).mock
      .calls[0][0] as string;
    expect(call).toContain("test-message");
    expect(call).toContain(LogLevel.info);
    expect(call).toContain(LogCategory.bearer);
  });
});

describe("CompositeLogger", () => {
  it("forwards to all handlers", () => {
    const h1 = { log: vi.fn() } as unknown as LoggerHandler;
    const h2 = { log: vi.fn() } as unknown as LoggerHandler;
    const composite = new CompositeLogger([h1, h2]);
    composite.log("msg", LogCategory.bearer, LogLevel.info);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(h1.log).toHaveBeenCalledWith("msg", LogCategory.bearer, LogLevel.info);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(h2.log).toHaveBeenCalledWith("msg", LogCategory.bearer, LogLevel.info);
  });

  it("works with zero handlers", () => {
    const composite = new CompositeLogger([]);
    expect(() => composite.log("x", LogCategory.bearer, LogLevel.verbose)).not.toThrow();
  });
});
