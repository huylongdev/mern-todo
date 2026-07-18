import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(`${API}/api/todos`)
      .then((r) => r.json())
      .then(setTodos);
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch(`${API}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const newTodo = await res.json();
    setTodos([newTodo, ...todos]);
    setText("");
  };

  const toggleTodo = async (todo) => {
    const res = await fetch(`${API}/api/todos/${todo._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    const updated = await res.json();
    setTodos(todos.map((t) => (t._id === updated._id ? updated : t)));
  };

  const deleteTodo = async (id) => {
    await fetch(`${API}/api/todos/${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t._id !== id));
  };

  return (
    <div className="wrap">
      <h1>todo</h1>
      <form onSubmit={addTodo}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="add a task"
          autoFocus
        />
        <button type="submit">+</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo._id} className={todo.completed ? "done" : ""}>
            <span onClick={() => toggleTodo(todo)}>{todo.text}</span>
            <button className="del" onClick={() => deleteTodo(todo._id)}>
              ×
            </button>
          </li>
        ))}
      </ul>
      {todos.length > 0 && (
        <p className="count">
          {todos.filter((t) => !t.completed).length} left
        </p>
      )}
    </div>
  );
}
