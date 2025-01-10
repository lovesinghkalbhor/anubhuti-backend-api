class ApiResponse {
  statusCode: number;
  data: any | null;
  success: boolean;
  message: string;

  constructor(statusCode: number, data: any | null, message = "success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
