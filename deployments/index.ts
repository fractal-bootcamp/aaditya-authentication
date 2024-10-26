import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { requireAuth } from "@clerk/clerk-sdk-node";

// Initialize Prisma Client
const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(cors()); // Enable Cross-Origin Resource Sharing for all routes

// ----------------- ARTWORK ROUTES -----------------

// Create a new post (artwork)
app.post("/api/posts", async (req, res) => {
  const { userId, artConfig } = req.body;

  if (!userId || !artConfig) {
    return res.status(400).json({ error: "Invalid request: missing userId or artConfig" });
  }

  try {
    const post = await prisma.post.create({
      data: {
        userId,
        artConfig,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Fetch all posts (artworks)
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Fetch a single post by ID
app.get("/api/posts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// Update a post (artwork) by ID
app.put("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { artConfig } = req.body;

  if (!artConfig) {
    return res.status(400).json({ error: "Invalid request: missing artConfig" });
  }

  try {
    const post = await prisma.post.update({
      where: {
        id: parseInt(id),
      },
      data: {
        artConfig,
      },
    });

    res.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// Delete a post by ID
app.delete("/api/posts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.post.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// Like or Unlike a post (artwork)
app.post("/api/posts/:id/like", requireAuth, async (req, res) => {
  const postId = parseInt(req.params.id);
  const userId = req.auth?.userId;

  if (!userId || isNaN(postId)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      await prisma.post.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      });
      return res.status(200).json({ message: "Post unliked" });
    } else {
      // Like the post
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
      await prisma.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      });
      return res.status(200).json({ message: "Post liked" });
    }
  } catch (error) {
    console.error("Error handling like:", error);
    res.status(500).json({ error: "Failed to handle like" });
  }
});

// ----------------- DRAWING ROUTES -----------------

// Create a new drawing post
app.post("/api/drawings", async (req, res) => {
  const { userId, drawing } = req.body;

  if (!userId || !drawing) {
    return res.status(400).json({ error: "Invalid request: missing userId or drawing" });
  }

  try {
    const newDrawing = await prisma.drawing.create({
      data: {
        userId,
        drawing,
      },
    });
    res.status(201).json(newDrawing);
  } catch (error) {
    console.error("Error creating drawing:", error);
    res.status(500).json({ error: "Failed to create drawing" });
  }
});

// Fetch all drawings
app.get("/api/drawings", async (req, res) => {
  try {
    const drawings = await prisma.drawing.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(drawings);
  } catch (error) {
    console.error("Error fetching drawings:", error);
    res.status(500).json({ error: "Failed to fetch drawings" });
  }
});

// Like or Unlike a drawing post
app.post("/api/drawings/:id/like", requireAuth, async (req, res) => {
  const drawingId = parseInt(req.params.id);
  const userId = req.auth?.userId;

  if (!userId || isNaN(drawingId)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        drawingId_userId: {
          drawingId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike the drawing
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      await prisma.drawing.update({
        where: { id: drawingId },
        data: { likes: { decrement: 1 } },
      });
      return res.status(200).json({ message: "Drawing unliked" });
    } else {
      // Like the drawing
      await prisma.like.create({
        data: {
          drawingId,
          userId,
        },
      });
      await prisma.drawing.update({
        where: { id: drawingId },
        data: { likes: { increment: 1 } },
      });
      return res.status(200).json({ message: "Drawing liked" });
    }
  } catch (error) {
    console.error("Error handling like:", error);
    return res.status(500).json({ error: "Failed to handle like" });
  }
});

// Delete a drawing post by ID
app.delete("/api/drawings/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.drawing.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(204).send(); // Successfully deleted with no content
  } catch (error) {
    console.error("Error deleting drawing:", error);
    res.status(500).json({ error: "Failed to delete drawing" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
