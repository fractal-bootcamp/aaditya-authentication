import express from "express";
import path from "path";
import cors from "cors";
import { AUTH_SECRET, authenticate } from "./backend/middleware";
import { hashSync, compareSync } from "bcrypt";
import { sign } from "jsonwebtoken";
import fs from "fs";

const app = express();
app.use(cors());

// Utility function for rendering HTML templates
const renderTemplate = (template: string, variables: Record<string, any>): string => {
  // Use JavaScript's template literals for rendering
  const templateFunction = new Function(
    "variables",
    `const { title, heading, messages } = variables;
    return \`${template}\`;`
  );
  return templateFunction(variables);
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// In-memory storage for messages
let messages: { name: string; content: string }[] = [];

app.get("/", (req, res) => {
  const templatePath = path.join(__dirname, "templates", "index.html");
  const template = fs.readFileSync(templatePath, "utf8");

  const html = renderTemplate(template, {
    title: "Message Board",
    heading: "Welcome to the Message Board",
    messages,
  });
  res.send(html);
});

app.get("/messages/:name", (req, res) => {
  const messagesFromName = messages.filter((message) => message.name === req.params.name);
  res.json(messagesFromName);
});

app.get("/messages", (req, res) => {
  res.json(messages);
});

app.post("/submit", (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ message: "Name and message are required." });
  }

  messages.push({ name, content: message });
  res.redirect("/");
});

// User database with hashed passwords
const users = {
  "1": {
    name: "Aaditya",
    password: hashSync("123456", 10),
  },
  "2": {
    name: "Elias",
    password: hashSync("123456", 10),
  },
};

// Generate JWT token
const generateToken = async (id: string) => {
  return sign({ id }, AUTH_SECRET, { expiresIn: "1h" });
};

app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ message: "Name and password are required." });
  }

  const foundEntry = Object.entries(users).find(([, user]) => user.name === name);
  const user = foundEntry ? foundEntry[1] : undefined;
  const id = foundEntry ? foundEntry[0] : undefined;

  if (!id || !user || !compareSync(password, user.password)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = await generateToken(id);
  res.status(200).json({ message: "Authenticated", token });
});

app.get("/authenticated", authenticate, (req, res) => {
  const { name } = users[req.user.id];
  res.send(`${name} is authenticated`);
});

// Load environment variables for port and secret key
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
