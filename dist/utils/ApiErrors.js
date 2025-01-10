"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrors = void 0;
class ApiErrors extends Error {
    constructor(statusCode, message = "something went wrong", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ApiErrors = ApiErrors;
//# sourceMappingURL=ApiErrors.js.map