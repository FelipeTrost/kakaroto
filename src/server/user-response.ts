/** Helper function for server actions returns */
export function userResponse<T>(type: "sucess" | "error", message?: T) {
  return { type, message };
}
