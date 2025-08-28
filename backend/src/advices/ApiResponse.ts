import { ApiError } from "./ApiError"

export class ApiResponse<T> {
    local_date_time: string
    data?: T | null
    api_error?: ApiError | null

  constructor(data?: T | null,  apiError?: ApiError) {
        this.local_date_time = new Date().toISOString(); 

        if (data) {
            this.data = data;
            this.api_error = null;
        } else if (apiError) {
            this.api_error = apiError;
            this.data = null; 
        } else {
            this.data = null;
        }
    }
}