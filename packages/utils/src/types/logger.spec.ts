import { describe, expect, it, vi } from "vitest";
import { LogLevel, LogCategory, LoggerHandler } from "./logger.js";

describe("LogLevel", () => {
  it("should have debug level with value 0", () => {
    expect(LogLevel.debug).toBeDefined();
    expect(LogLevel.debug.toString()).toBe("D");
  });

  it("should have verbose level with value 1", () => {
    expect(LogLevel.verbose).toBeDefined();
    expect(LogLevel.verbose.toString()).toBe("V");
  });

  it("should have info level with value 5", () => {
    expect(LogLevel.info).toBeDefined();
    expect(LogLevel.info.toString()).toBe("I");
  });

  it("should have application level with value 10", () => {
    expect(LogLevel.application).toBeDefined();
    expect(LogLevel.application.toString()).toBe("A");
  });

  it("should have warning level with value 15", () => {
    expect(LogLevel.warning).toBeDefined();
    expect(LogLevel.warning.toString()).toBe("W");
  });

  it("should have error level with value 20", () => {
    expect(LogLevel.error).toBeDefined();
    expect(LogLevel.error.toString()).toBe("E");
  });

  it("should have all defined log levels", () => {
    expect(LogLevel.debug).toBeDefined();
    expect(LogLevel.verbose).toBeDefined();
    expect(LogLevel.info).toBeDefined();
    expect(LogLevel.application).toBeDefined();
    expect(LogLevel.warning).toBeDefined();
    expect(LogLevel.error).toBeDefined();
  });
});

describe("LogCategory", () => {
  it("should have bearer category", () => {
    expect(LogCategory.bearer).toBe("Bearer");
  });

  it("should have proxy category", () => {
    expect(LogCategory.proxy).toBe("Proxy");
  });

  it("should have network category", () => {
    expect(LogCategory.network).toBe("Network");
  });

  it("should have lowerTransport category", () => {
    expect(LogCategory.lowerTransport).toBe("LowerTransport");
  });

  it("should have upperTransport category", () => {
    expect(LogCategory.upperTransport).toBe("UpperTransport");
  });

  it("should have access category", () => {
    expect(LogCategory.access).toBe("Access");
  });

  it("should have foundationModel category", () => {
    expect(LogCategory.foundationModel).toBe("FoundationModel");
  });

  it("should have model category", () => {
    expect(LogCategory.model).toBe("Model");
  });

  it("should have provisioning category", () => {
    expect(LogCategory.provisioning).toBe("Provisioning");
  });
});

describe("LoggerHandler", () => {
  class TestLoggerHandler extends LoggerHandler {
    public log = vi.fn();
  }

  it("should call log with info level when i() is called", () => {
    const handler = new TestLoggerHandler();
    handler.i(LogCategory.network, "test message");
    expect(handler.log).toHaveBeenCalledWith("test message", LogCategory.network, LogLevel.info);
  });

  it("should call log with debug level when d() is called", () => {
    const handler = new TestLoggerHandler();
    handler.d(LogCategory.bearer, "debug message");
    expect(handler.log).toHaveBeenCalledWith("debug message", LogCategory.bearer, LogLevel.debug);
  });

  it("should call log with warning level when w() is called", () => {
    const handler = new TestLoggerHandler();
    handler.w(LogCategory.access, "warning message");
    expect(handler.log).toHaveBeenCalledWith(
      "warning message",
      LogCategory.access,
      LogLevel.warning,
    );
  });

  it("should call log with verbose level when v() is called", () => {
    const handler = new TestLoggerHandler();
    handler.v(LogCategory.proxy, "verbose message");
    expect(handler.log).toHaveBeenCalledWith(
      "verbose message",
      LogCategory.proxy,
      LogLevel.verbose,
    );
  });

  it("should call log with error level when e() is called", () => {
    const handler = new TestLoggerHandler();
    handler.e(LogCategory.model, "error message");
    expect(handler.log).toHaveBeenCalledWith("error message", LogCategory.model, LogLevel.error);
  });
});
