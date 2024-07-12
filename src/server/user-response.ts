import { type ReactNode } from "react";

/** Helper function for server actions returns */
export function userResponse(type: "sucess" | "error", message?: ReactNode) {
  return { type, message };
}

export type UserResponse = ReturnType<typeof userResponse>;
