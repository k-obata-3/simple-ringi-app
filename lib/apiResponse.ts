import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiError = {
  ok: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export class AppError extends Error {
  code: string;
  status: number;
  fieldErrors?: Record<string, string[]>;

  constructor(
    code: string,
    message: string,
    options?: { status?: number; fieldErrors?: Record<string, string[]> }
  ) {
    super(message);
    this.code = code;
    this.status = options?.status ?? 400;
    this.fieldErrors = options?.fieldErrors;
  }
}

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  const body: ApiSuccess<T> = { ok: true, data };
  return NextResponse.json(body, init);
}

export function apiError(
  error: AppError | Error,
  init?: ResponseInit
): NextResponse<ApiError> {
  if (error instanceof AppError) {
    const body: ApiError = {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        fieldErrors: error.fieldErrors,
      },
    };
    return NextResponse.json(body, {
      status: error.status,
      ...init,
    });
  }

  const body: ApiError = {
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "予期しないエラーが発生しました。",
    },
  };
  console.error(error);
  return NextResponse.json(body, { status: 500, ...init });
}

// API Route 用のラッパ
export async function withApiHandler<T>(
  handler: () => Promise<NextResponse<ApiSuccess<T>>>
): Promise<NextResponse<ApiSuccess<T> | ApiError>> {
  try {
    return await handler();
  } catch (e) {
    return apiError(e as Error);
  }
}
