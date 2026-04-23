export * from "./scan.js";
export * from "./model.js";
export * from "./node.js";
export * from "./key.js";
export * from "./logger.js";
export * from "./proxy.js";

export type ClassInstance<T> = T extends { prototype: infer R } ? R : never;
