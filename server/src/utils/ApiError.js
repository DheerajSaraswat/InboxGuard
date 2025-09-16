class ApiError extends Error{
    constructor(
        statuscode,
        message = "Something went wrong!",
        errors = [],
        errorStack = ""
    ){
        super(message);
        this.statuscode = statuscode;
        this.message = message;
        this.data = null;
        this.success = false;
        this.errors = errors;
        if(errorStack){
            this.errorStack = errorStack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {ApiError};