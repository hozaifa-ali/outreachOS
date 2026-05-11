import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

/** Custom application error with HTTP status code */
export class AppError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(message, 400, details);
  }
  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }
  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }
  static notFound(message = 'Not found') {
    return new AppError(message, 404);
  }
  static conflict(message: string) {
    return new AppError(message, 409);
  }
  static tooManyRequests(message = 'Too many requests') {
    return new AppError(message, 429);
  }
  static internal(message = 'Internal server error') {
    return new AppError(message, 500);
  }
}

/** Global Fastify error handler */
export function errorHandler(error: FastifyError, req: FastifyRequest, reply: FastifyReply) {
  const statusCode = (error as any).statusCode || error.statusCode || 500;
  const message = error.message || 'Internal server error';

  req.log.error({ err: error, statusCode }, 'Request error');

  reply.status(statusCode).send({
    statusCode,
    error: statusCode >= 500 ? 'Internal Server Error' : error.name || 'Error',
    message: statusCode >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    details: (error as AppError).details,
  });
}
