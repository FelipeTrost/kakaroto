import { type ReactNode } from "react";

export type UserResponse =
  | { type: "error"; message?: ReactNode }
  | { type: "success"; message?: unknown };

/** Helper function for server actions returns */
export function userResponse<
  T extends UserResponse,
  Type extends T["type"],
  Message extends T["message"],
>(type: Type, message?: Message) {
  return { type, message } as Type extends "error"
    ? { type: "error"; message?: ReactNode }
    : {
        type: Type;
        message: Message;
      };
}

export function isUserResponse(obj: unknown): obj is UserResponse {
  return !!(
    typeof obj === "object" &&
    obj &&
    "type" in obj &&
    "message" in obj
  );
}
