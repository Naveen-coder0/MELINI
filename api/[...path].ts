import type { VercelRequest, VercelResponse } from "@vercel/node";
import app, { connectDB } from "../backend/index";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  await connectDB();

  if (typeof req.url === "string" && req.url.startsWith("/api")) {
    req.url = req.url.replace(/^\/api/, "") || "/";
  }

  return app(req, res);
}
