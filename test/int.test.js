"use strict";

const assert = require("assert");

const { callCurry } = require("./helpers.js");
const config = require("./config.js");
const { Service } = require("./../dist/index.js");

describe("Unit Test", () => {

  const call = callCurry(`http://localhost:${config.http.port}`, { method: "GET" });
  let service = null;

  before(async () => {
    service = new Service(config);
    await service.run();
  });

  after(async () => {
    await service.close();
  });

  describe("Healthcheck", () => {

    it("should be able to see service ready", async () => {
      const { status } = await call({ url: "/ready" });
      assert.equal(status, 200);
    });

    it("should be able to check health", async () => {
      const { status, body } = await call({ url: "/health", json: true });
      assert.equal(status, 200);
      assert.equal(body.status, "UP");
    });
  });
});
