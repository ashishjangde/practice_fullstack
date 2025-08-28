export class ApiError {
    status_code: number;
    message: string;
    errors: Record<string, string>;

    constructor(status_code: number, message: string, errors: Record<string, string> = {}) {
        this.status_code = status_code;
        this.message = message;
        this.errors = errors;
    }
}