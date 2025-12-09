export const notFound = (req, res, _next) => {
    res
        .status(404)
        .json({ message: `Route ${req.method} ${req.originalUrl} not found` });
};

export const errorHandler = (err, _req, res, _next) => {
    console.error(err);
    res
        .status(500)
        .json({ message: 'Internal error', detail: err.message });
};

export function logger(message) {
    console.log('this is logger', message);
}

export default logger;
