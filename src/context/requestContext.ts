import { asyncLocalStorage,type RequestContext } from "../middlewares/contextMiddleware.js";

export function setContext(data: RequestContext) {
  const store = asyncLocalStorage.getStore();

  if (!store) {
    throw new Error("Request context não definido");
  }

  Object.assign(store, data);
}

export function getContext(): RequestContext {
  const store = asyncLocalStorage.getStore();

  if (!store) {
    throw new Error("Request context não definido");
  }
  

  return store;
}