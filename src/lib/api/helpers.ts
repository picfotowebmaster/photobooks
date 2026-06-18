import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function getUserIdFromRequest(request: Request): string | null {
  const userId = request.headers.get("x-user-id");
  return userId || null;
}
