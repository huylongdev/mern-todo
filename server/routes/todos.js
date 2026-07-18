import { Router } from "express";
import Todo from "../models/Todo.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth); // toàn bộ route dưới đây yêu cầu login

router.get("/", async (req, res) => {
  const todos = await Todo.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(todos);
});

router.post("/", async (req, res) => {
  const todo = await Todo.create({ text: req.body.text, user: req.userId });
  res.status(201).json(todo);
});

router.patch("/:id", async (req, res) => {
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true },
  );
  res.json(todo);
});

router.delete("/:id", async (req, res) => {
  await Todo.findOneAndDelete({ _id: req.params.id, user: req.userId });
  res.status(204).end();
});
router.get("/", async (req, res) => {
  const todos = await Todo.find({ user: req.userId }).sort({ order: -1 });
  res.json(todos);
});
export default router;
