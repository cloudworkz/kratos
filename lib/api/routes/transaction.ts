import * as express from "express";
import Service from "../../Service";

const routeTransaction = (service: Service) => {

  const router = express.Router();

  router.get("/", (req, res) => {
    res.json({
      parent: "/api",
      self: "/api/transaction",
      children: [
        "/api/transaction/run",
        "/api/transaction/status",
      ],
    });
  });

  router.post("/run", async (req, res) => {

    const {
      transactionId,
      chunks,
      baseUrl,
      contentType,
      extension,
    } = req.body;

    if (!transactionId || !chunks) {
      res.status(400).json({
        error: "Missing body fields: {transactionId: string, chunks: number}.",
      });
      return;
    }

    const result = await service.transactionProcess
      .processTransaction(transactionId, chunks, baseUrl, contentType, extension);

    res.status(200).json({
      result,
    });
  });

  router.get("/status", async (req, res) => {
    res.status(200).json(service.transactionProcess.getTransactionsInProcess());
  });

  return router;
};

export { routeTransaction };
