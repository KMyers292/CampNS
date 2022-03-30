// Passes in a function that returns a function that will catch any errors when executed.
module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
};