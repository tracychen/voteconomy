import { json, urlencoded } from "body-parser";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import proposolsRouter from "./routes/proposals";
import loginRouter from "./routes/login";

const app = express();

app.use(morgan("dev"));

app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors());

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`api running at port ${port}`);
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/proposals", proposolsRouter);
app.use("/login", loginRouter);
