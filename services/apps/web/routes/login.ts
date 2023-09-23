import { Router } from "express";
import { createSessionKey } from "../utils/biconomy";

const loginRouter = Router();

loginRouter.post("/", async (req, res) => {
  // TODO
  const receipt = await createSessionKey();
  res.json({ hash: receipt?.transactionHash });
});

export default loginRouter;
