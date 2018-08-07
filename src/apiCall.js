const request = require('request')

function getData(endPoint) {
  return new Promise((fulfill, reject) => {
    try {
      request({ method: 'GET', url: endPoint, headers: { 'Content-Type': 'application/json' } }, (err, res, body) => {
        if (err) {
          return reject(err)
        }
        const result = JSON.parse(body)
        fulfill(result)
      })
    } catch (e) {
      console.error(e)
    }
  })
}

module.exports = {
  getData,
}
