export const helpers = {
    multiply: function(a, b, options) {
        const result = a * b;
        if (options.hash.toFixed !== undefined) {
            return result.toFixed(options.hash.toFixed);
        }
        return result;
    }
};