// Wraps a synchronous mock handler so it behaves like a network call:
// a short delay (so loading states are visible) and a deep copy
// (so React Query never sees an object we mutated in place).
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function mockCall<T>(fn: () => T, delayMs = 250): Promise<T> {
  await wait(delayMs)
  return structuredClone(fn())
}
