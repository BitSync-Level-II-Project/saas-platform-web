/** HTTP-style error. The mock layer throws it too, so the UI handles both the same way. */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : 'Something went wrong. Try again.'
