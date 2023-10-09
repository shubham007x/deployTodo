const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var cors = require("cors");
const { UserModel } = require("./Models/User.model");
const { connection } = require("./config/connection");
const { authenticate } = require("./Middlewares/Authenticate");
const { TodoModel } = require("./Models/Todo.model");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("Base API Endpoint");
});
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);
  try {
    bcrypt.hash(password, 5, async function (err, hash) {
      if (err) {
        res.send({ message: "error occurred" });
      } else {
        await UserModel.create({ name, email, password: hash });
        res.send({ message: "user created" });
      }
    });
  } catch (error) {}
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  const user = await UserModel.findOne({ email });
  console.log(user);
  if (!user) {
    return res.send({ message: "Please sign up" });
  }
  const hash = user?.password;
  bcrypt.compare(password, hash, function (err, result) {
    if (result) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.send({ message: "login successful", token: token });
    } else {
      res.send({ message: "login failed" });
    }
  });
});
app.use(authenticate);
app.get("/todos", async (req, res) => {
  const { status, tag } = req.query;
  console.log(status);
  let todos;
  if (status && tag) {
    todos = await TodoModel.find({ status, tag });
  } else if (status) {
    console.log(status);
    todos = await TodoModel.find({ status });
  } else {
    todos = await TodoModel.find();
  }
  console.log(todos);
  res.send({ ok: true, todos: todos });
});
app.post("/todos/create", async (req, res) => {
  const { taskname, status, tag } = req.body;

  console.log(taskname, status, tag);
  const author_id = req.userId;
  const todos = await TodoModel.create({ taskname, status, tag, author_id });
  res.send({ ok: true, todos: todos });
});
app.patch("/todos/:todoId", async (req, res) => {
  const todoId = req.params.todoId;
  const payload = req.body;
  const author_id = req.userId;
  const todo = await TodoModel.findOne({ _id: todoId });
  if (todo?.author_id !== author_id) {
    res.send({ message: "you are not authorised" });
  } else {
    await TodoModel.findByIdAndUpdate(todoId, payload);
    res.send({ ok: true, message: "TodoUpdated" });
  }
});
app.delete("/todos/:todoID", async (req, res) => {
  const todoId = req.params.todoID;
  console.log(todoId);
  const author_id = req.userId;
  const todo = await TodoModel.findOne({ _id: todoId });
  const todo_author_id = todo.author_id;
  if (author_id !== todo_author_id) {
    res.send({ ok: false, message: "you are not authorized" });
  } else {
    await TodoModel.findByIdAndDelete(todoId);
    res.send({ ok: true, message: "todo deleted" });
  }
});
app.listen(8000, async () => {
  try {
    await connection;
    console.log("DB connected");
  } catch (error) {
    console.log("DB connection failed");
  }

  console.log("listening at 8000");
});
