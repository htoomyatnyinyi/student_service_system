import { Elysia } from "elysia";
import { errorResponse } from "../utils/response";

export const errorMiddleware = new Elysia({ name: "error-middleware" }).onError(
  ({ code, error, set }) => {
    switch (code) {
      case "VALIDATION":
        set.status = 400;
        return errorResponse(error.message, 400);
      case "NOT_FOUND":
        set.status = 404;
        return errorResponse("Resource not found", 404);
      default:
        console.error("Unhandled error:", error);
        set.status = 500;
        return errorResponse("Internal server error", 500);
    }
  },
);
