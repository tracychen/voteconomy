import { Router } from "express";
import {
  createProposal,
  getProposal,
  getProposals,
} from "../services/proposals";
import { submiteVote } from "../services/votes";

const proposolsRouter = Router();

proposolsRouter.post("/", async (req, res) => {
  const { name, description } = req.body;
  const hash = await createProposal(name, description);
  res.status(201).json({ hash });
});

proposolsRouter.get("/", async (req, res) => {
  const proposals = await getProposals();
  res.json({ proposals });
});

proposolsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const idNumber = Number(id);
  const proposal = await getProposal(idNumber);
  res.json(proposal);
});

proposolsRouter.post("/:id/votes", async (req, res) => {
  const { id } = req.params;
  const idNumber = Number(id);
  const { voteType } = req.body;
  const hash = await submiteVote(idNumber, voteType);
  res.status(201).json({ hash });
});

export default proposolsRouter;
