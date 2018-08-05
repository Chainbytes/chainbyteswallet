const request = require('request');

module.exports = {
    getData: (endPoint) => {
        return new Promise((fulfill, reject) => { // Create Promise
            request({
                method: 'GET',
                url: endPoint,
                headers: {
                    'Content-Type': 'application/json'
                }
            },  (error, response, body) => {
                if (error)
                    return reject(error);

                try {
                    const result = JSON.parse(body);
                    fulfill(result);
                } catch(e) {
                    // Invalid JSON
                    return reject(new Error(body));
                }
            });
        });
    }
};
