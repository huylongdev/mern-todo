import { Router } from "express";
import Todo from "../models/Todo.js";

const router = Router();

// GET all
router.get("/", async (req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json(todos);
});

// POST create
router.post("/", async (req, res) => {
  const todo = await Todo.create({ text: req.body.text });
  res.status(201).json(todo);
});

// PATCH update (text and/or completed)
router.patch("/:id", async (req, res) => {
  const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(todo);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
