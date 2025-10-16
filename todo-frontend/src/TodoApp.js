import React, { useState, useEffect } from "react";
import "./TodoApp.css"; // import css file

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch("https://todo-backend-samo.onrender.com/todos")
      .then(res => res.json())
      .then(data => setTodos(data));
  }, []);

  const addTodo = () => {
    if (!text) return;
    fetch("https://todo-backend-samo.onrender.com/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    })
      .then(res => res.json())
      .then(newTodo => setTodos([...todos, newTodo]));
    setText("");
  };

  const toggleComplete = (id, completed) => {
    fetch(`http://localhost:5000/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed })
    })
      .then(res => res.json())
      .then(updatedTodo => {
        setTodos(todos.map(t => (t._id === id ? updatedTodo : t)));
      });
  };

  const deleteTodo = (id) => {
    fetch(`https://todo-backend-samo.onrender.com/todos/${id}`, { method: "DELETE" })
      .then(() => setTodos(todos.filter(t => t._id !== id)));
  };

  return (
    <div className="app">
      <div className="todo-container">
        <h1>🌟 My Todo List</h1>

        <div className="input-section">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter a new todo"
          />
          <button onClick={addTodo}>➕ Add</button>
        </div>

        <ul>
          {todos.map(todo => (
            <li key={todo._id} className={todo.completed ? "completed" : ""}>
              <span>{todo.text}</span>
              <div className="actions">
                <button onClick={() => toggleComplete(todo._id, !todo.completed)}>
                  {todo.completed ? "↩ Undo" : "✔ Done"}
                </button>
                <button className="delete" onClick={() => deleteTodo(todo._id)}>
                  🗑 Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TodoApp;
