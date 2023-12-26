export enum ErrorCode {
  UNKOWN_ERROR = "UNKOWN_ERROR",
  CHATGPT_CLOUDFLARE = "CHATGPT_CLOUDFLARE",
  CHATGPT_UNAUTHORIZED = "CHATGPT_UNAUTHORIZED"
}

export class AppError extends Error {
  code: ErrorCode
  constructor(message: string, code: ErrorCode) {
    super(message)
    this.code = code
  }
}
