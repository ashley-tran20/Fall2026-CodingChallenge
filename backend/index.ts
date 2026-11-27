import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route";
import pinRouter from "./routes/pin.route";
import commentRouter from "./routes/comment.route";
import boardRouter from "./routes/board.route";
import notificationRouter from "./routes/notification.route";
import connectDB from "./utils/connectDB";

connectDB();

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Protect state-changing requests against CSRF
app.use((req, res, next) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  const origin = req.get("Origin");

  if (!origin || !allowedOrigins.includes(origin)) {
    res.status(403).json({
      message: "Request origin not allowed",
    });
    return;
  }

  next();
});

app.use(express.json());
app.use(cookieParser());

// Pixabay cache and request limits
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;
const REQUEST_WINDOW = 60 * 1000;
const MAX_REQUESTS = 60;

const imageCache = new Map<
  string,
  { data: unknown; expiresAt: number }
>();

let requestCount = 0;
let windowStart = Date.now();

// Backend health check
app.get("/", (req, res) => {
  res.send("Pinny API is running!");
});

// Pixabay image endpoint
app.get("/pixabay", async (req, res) => {
  try {
    const apiKey = process.env.PIXABAY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Image service is not configured",
      });
    }

    const q = String(req.query.q || "nature").trim();
    const id = String(req.query.id || "");
    const page = Number(req.query.page || 1);
    const perPage = Number(req.query.per_page || 20);

    if (
      q.length > 100 ||
      (id && !/^\d+$/.test(id)) ||
      !Number.isInteger(page) ||
      page < 1 ||
      page > 100 ||
      !Number.isInteger(perPage) ||
      perPage < 3 ||
      perPage > 20
    ) {
      return res.status(400).json({
        error: "Invalid image search parameters",
      });
    }

    const cacheKey = id
      ? `id:${id}`
      : JSON.stringify([q.toLowerCase(), page, perPage]);

    const now = Date.now();

    // Remove expired cache entries
    for (const [key, entry] of imageCache) {
      if (entry.expiresAt <= now) {
        imageCache.delete(key);
      }
    }

    // Return cached results without calling Pixabay
    const cached = imageCache.get(cacheKey);

    if (cached) {
      return res.json(cached.data);
    }

    // Reset the request window every minute
    if (now - windowStart >= REQUEST_WINDOW) {
      windowStart = now;
      requestCount = 0;
    }

    // Protect the shared Pixabay API quota
    if (requestCount >= MAX_REQUESTS) {
      res.set(
        "Retry-After",
        String(
          Math.ceil(
            (REQUEST_WINDOW - (now - windowStart)) / 1000
          )
        )
      );

      return res.status(429).json({
        error: "Too many image requests. Please try again shortly.",
      });
    }

    requestCount++;

    const params = new URLSearchParams({
      key: apiKey,
      safesearch: "true",
    });

    if (id) {
      params.set("id", id);
    } else {
      params.set("q", q);
      params.set("page", String(page));
      params.set("per_page", String(perPage));
    }

    const response = await fetch(
      `https://pixabay.com/api/?${params.toString()}`,
      {
        signal: AbortSignal.timeout(10000),
      }
    );

    if (response.status === 429) {
      return res.status(429).json({
        error: "Image service limit reached. Please try again later.",
      });
    }

    if (!response.ok) {
      return res.status(502).json({
        error: "Image service request failed",
      });
    }

    const data = await response.json();

    if (!Array.isArray(data.hits)) {
      return res.status(502).json({
        error: "Invalid image service response",
      });
    }

    // Keep the cache size bounded
    if (imageCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = imageCache.keys().next().value;

      if (oldestKey !== undefined) {
        imageCache.delete(oldestKey);
      }
    }

    // Store successful results for 24 hours
    imageCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + CACHE_DURATION,
    });

    return res.json(data);
  } catch {
    return res.status(502).json({
      error: "Unable to retrieve images",
    });
  }
});

// Application routes
app.use("/users", userRouter);
app.use("/pins", pinRouter);
app.use("/comments", commentRouter);
app.use("/boards", boardRouter);
app.use("/notifications", notificationRouter);
app.use("/uploads", express.static("uploads"));

// Start the server
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});