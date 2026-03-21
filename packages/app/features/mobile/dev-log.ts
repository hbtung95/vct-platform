type DevLogArgs = [message?: unknown, ...optionalParams: unknown[]]

export function devLog(...args: DevLogArgs): void {
  if (__DEV__) {
    console.warn(...args)
  }
}
