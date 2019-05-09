"use strict";

const request = require("request");

const call = (options = {}) => {
  options.followRedirect = false;
  options.timeout = 3000;
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {

      if (error) {
        return reject(error);
      }

      resolve({
        status: response.statusCode,
        headers: response.headers,
        body,
      });
    });
  });
};

const callCurry = (baseUrl, baseOptions = {}) => {
  return (options) => {

    if (!options.url || !options.url.startsWith("http")) {
      options.url = `${baseUrl}${options.url}`;
    } else if (!options.url) {
      options.url = baseUrl;
    }

    if (!options.method) {
      options.method = "GET";
    }

    return call(Object.assign({}, baseOptions, options));
  };
};

module.exports = {
  call,
  callCurry,
};
