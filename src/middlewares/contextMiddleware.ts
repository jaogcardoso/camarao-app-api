import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  userId?: string;
  tenantId?: string;
  empresaId?: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function contextMiddleware(req: any, res: any, next: any) {
  asyncLocalStorage.run({}, () => {
    next();
  });
}