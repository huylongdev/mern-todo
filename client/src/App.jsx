import { useEffect, useState, useRef } from "react";
import Auth from "./Auth.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [todos, setTodos] = useState([]);
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");

  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const dragItem = useRef(null);
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/todos`, { headers: authHeader })
      .then((r) => r.json())
      .then(setTodos);
  }, [token]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light",
    );
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch(`${API}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({
        text,
        dueDate: dueDate || null,
        priority,
        category: category || "general",
      }),
    });
    const newTodo = await res.json();
    setTodos([newTodo, ...todos]);
    setText("");
    setDueDate("");
    setCategory("");
  };

  const toggleTodo = async (todo) => {
    const res = await fetch(`${API}/api/todos/${todo._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    const updated = await res.json();
    setTodos(todos.map((t) => (t._id === updated._id ? updated : t)));
  };

  const deleteTodo = async (id) => {
    await fetch(`${API}/api/todos/${id}`, {
      method: "DELETE",
      headers: authHeader,
    });
    setTodos(todos.filter((t) => t._id !== id));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditText(todo.text);
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return setEditingId(null);
    const res = await fetch(`${API}/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ text: editText }),
    });
    const updated = await res.json();
    setTodos(todos.map((t) => (t._id === updated._id ? updated : t)));
    setEditingId(null);
  };

  const onDragStart = (id) => (dragItem.current = id);

  const onDrop = async (targetId) => {
    if (dragItem.current === targetId) return;
    const list = [...todos];
    const fromIdx = list.findIndex((t) => t._id === dragItem.current);
    const toIdx = list.findIndex((t) => t._id === targetId);
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);

    const reordered = list.map((t, i) => ({
      ...t,
      order: (list.length - i) * 1000,
    }));
    setTodos(reordered);

    await fetch(`${API}/api/todos/${moved._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({
        order: reordered.find((t) => t._id === moved._id).order,
      }),
    });
    dragItem.current = null;
  };

  const visibleTodos = todos
    .filter((t) => {
      if (filter === "active") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    })
    .filter((t) => t.text.toLowerCase().includes(search.toLowerCase()));

  if (!token) {
    return (
      <Auth
        onAuth={(t) => {
          localStorage.setItem("token", t);
          setToken(t);
        }}
      />
    );
  }

  return (
    <div className="wrap">
      <div className="topbar">
        <h1>todo</h1>
        <div className="topbar-actions">
          <button className="theme-toggle" onClick={() => setDark(!dark)}>
            {dark ? "light" : "dark"}
          </button>
          <button className="logout" onClick={logout}>
            logout
          </button>
        </div>
      </div>

      <form onSubmit={addTodo} className="add-form">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="add a task"
          autoFocus
        />
        <div className="add-meta">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="category"
          />
          <button type="submit">+</button>
        </div>
      </form>

      <div className="toolbar">
        <input
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search"
        />
        <div className="filters">
          {["all", "active", "completed"].map((f) => (
            <span
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <ul>
        {visibleTodos.map((todo) => (
          <li
            key={todo._id}
            className={`${todo.completed ? "done" : ""} pri-${todo.priority}`}
            draggable
            onDragStart={() => onDragStart(todo._id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(todo._id)}
          >
            <div className="todo-main">
              {editingId === todo._id ? (
                <input
                  className="edit-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => saveEdit(todo._id)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(todo._id)}
                  autoFocus
                />
              ) : (
                <span
                  className="text"
                  onClick={() => toggleTodo(todo)}
                  onDoubleClick={() => startEdit(todo)}
                >
                  {todo.text}
                </span>
              )}
              <div className="meta">
                <span className="tag">{todo.category}</span>
                {todo.dueDate && (
                  <span className="due">
                    {new Date(todo.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <button className="del" onClick={() => deleteTodo(todo._id)}>
              ×
            </button>
          </li>
        ))}
      </ul>

      {visibleTodos.length > 0 && (
        <p className="count">
          {visibleTodos.filter((t) => !t.completed).length} left
        </p>
      )}
    </div>
  );
}
