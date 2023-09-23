import { Router } from "express";

const loginRouter = Router();

loginRouter.post("/", async (req, res) => {
  // TODO
  res.json({ sessionKey: "123" });
});

export default loginRouter;
