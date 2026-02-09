import app from "../backend/index";

export default function handler(req: any, res: any) {
  if (typeof req.url === "string" && req.url.startsWith("/api")) {
    req.url = req.url.replace(/^\/api/, "") || "/";
  }

  return app(req, res);
}
