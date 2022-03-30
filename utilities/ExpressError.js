//===============================================================================================//
//             Class For Setting An Error Message And Code When Catching An Error                //
//===============================================================================================//

// Class for any general errors that are caught during routes.
class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;