import * as express from "express";
import Service from "../../Service";

const routeRoot = (service: Service) => {

  const router = express.Router();

  router.get("/", (req, res) => {
    res.json({
      Hi: "Welcome to kratos!",
      parent: "/",
      self: "/",
      children: [
        "/api",
        "/doc",
        "/healthcheck",
        "/health",
        "/ready",
        "/metrics",
      ],
    });
  });

  router.get("/api", (req, res) => {
    res.json({
      parent: "/",
      self: "/api",
      children: [
        "/api/transaction",
      ],
    });
  });

  router.get("/doc", (req, res) => {
    res.end("Coming soon..");
  });

  router.get("/healthcheck", (req, res) => {
    res.status(service.isAlive() ? 200 : 503).end();
  });

  router.get("/health", (req, res) => {
    const [status, body] = service.getHealthInfo();
    res.status(status).json(body);
  });

  router.get("/ready", (req, res) => {
    res.status(service.isReady() ? 200 : 503).end();
  });

  router.get("/metrics", (req, res) => {
    res.set("content-type", service.metrics.exportType());
    res.end(service.metrics.exportMetrics());
  });

  return router;
};

export { routeRoot };
