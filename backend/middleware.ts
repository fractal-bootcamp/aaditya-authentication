import type { NextFunction, Request, RequestHandler, Response } from "express";
import { verify } from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken"; // Type-only import for JwtPayload

export const AUTH_SECRET = process.env.AUTH_SECRET || "MY_SECRET";

// Extend the Request interface to include the user object
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    // Check if the Authorization header is provided
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Extract the token (assuming the format is "Bearer <token>")
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    // Verify the JWT and extract the user ID
    const decoded = verify(token, AUTH_SECRET) as JwtPayload;
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach the user ID to the request object
    req.user = { id: decoded.id };

    // Continue to the next middleware
    next();
  } catch (err) {
    // Handle errors, such as token expiration or invalid tokens
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

// Example usage: Set the Authorization header as follows in your requests
// --header "Authorization: Bearer <token>"
