import { vi } from "vitest";

export function chainable<T>(resolveValue: T): any {
  const fn = vi.fn(() => proxy);
  const proxy = new Proxy(fn, {
    get(_target, key) {
      if (key === "then") {
        return (resolve: (v: unknown) => void, reject?: (e: unknown) => void) => {
          Promise.resolve(resolveValue).then(resolve, reject);
        };
      }
      if (typeof key === "symbol") return undefined;
      return fn;
    },
  });
  return proxy;
}

export function mockSupabaseClient(authUser?: { id: string; email: string }) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue(
        authUser
          ? { data: { user: authUser, session: {} }, error: null }
          : { data: { user: null, session: null }, error: null }
      ),
    },
    from: vi.fn(),
  };
}
