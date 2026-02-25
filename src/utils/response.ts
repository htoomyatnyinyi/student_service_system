export function successResponse(data: any, message = "Success", meta?: any) {
  return {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
}

export function errorResponse(message = "Something went wrong", status = 400) {
  return {
    success: false,
    message,
    status,
  };
}
