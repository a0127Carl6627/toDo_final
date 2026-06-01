const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const crypto = require("crypto");
require("dotenv").config();

const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ==========================
// FIREBASE ADMIN
// ==========================

function initializeFirebase() {
  if (admin.apps.length) return;

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64) {
    console.warn("Firebase service account is not configured yet.");
    return;
  }

  try {
    const serviceAccountJson = Buffer.from(
      serviceAccountBase64,
      "base64"
    ).toString("utf8");

    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase Admin initialized");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error.message);
  }
}

initializeFirebase();

// ==========================
// HELPERS
// ==========================

function createAppToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token not provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid user",
      });
    }

    req.user = result.rows[0];

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

async function verifyListOwnership(listId, userId) {
  const result = await pool.query(
    "SELECT * FROM task_lists WHERE id = $1 AND user_id = $2",
    [listId, userId]
  );

  return result.rows[0];
}

// ==========================
// HEALTH
// ==========================

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "OK",
      message: "Todo backend is running",
      database: "connected",
      firebaseAdmin: admin.apps.length > 0 ? "configured" : "not_configured",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ==========================
// AUTH
// ==========================

app.post("/auth/session", async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        message: "firebaseToken is required",
      });
    }

    if (!admin.apps.length) {
      return res.status(500).json({
        message: "Firebase Admin is not configured",
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name || null;

    if (!email) {
      return res.status(400).json({
        message: "Firebase user does not have an email",
      });
    }

    const userId = crypto.randomUUID();

    const result = await pool.query(
      `
      INSERT INTO users (id, firebase_uid, email, name)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (firebase_uid)
      DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = NOW()
      RETURNING *
      `,
      [userId, firebaseUid, email, name]
    );

    const user = result.rows[0];
    const token = createAppToken(user);

    res.json({
      message: "Session created",
      token,
      user,
    });
  } catch (error) {
    console.error("Auth error:", error);

    res.status(401).json({
      message: "Invalid Firebase token",
      error: error.message,
    });
  }
});

app.get("/auth/me", authMiddleware, (req, res) => {
  res.json({
    user: req.user,
  });
});

// ==========================
// LISTS CRUD
// ==========================

app.get("/lists", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        l.*,
        COUNT(t.id) AS task_count,
        COUNT(CASE WHEN t.completed = true THEN 1 END) AS completed_count
      FROM task_lists l
      LEFT JOIN tasks t ON t.list_id = l.id
      WHERE l.user_id = $1
      GROUP BY l.id
      ORDER BY l.created_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting lists:", error);

    res.status(500).json({
      message: "Error getting lists",
    });
  }
});

app.post("/lists", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const id = crypto.randomUUID();

    const result = await pool.query(
      `
      INSERT INTO task_lists (id, user_id, title, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [id, req.user.id, title.trim(), description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating list:", error);

    res.status(500).json({
      message: "Error creating list",
    });
  }
});

app.get("/lists/:id", authMiddleware, async (req, res) => {
  try {
    const list = await verifyListOwnership(req.params.id, req.user.id);

    if (!list) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    res.json(list);
  } catch (error) {
    console.error("Error getting list:", error);

    res.status(500).json({
      message: "Error getting list",
    });
  }
});

app.put("/lists/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    const cleanTitle =
      typeof title === "string" && title.trim() ? title.trim() : null;

    const cleanDescription =
      typeof description === "string" ? description : null;

    const result = await pool.query(
      `
      UPDATE task_lists
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        updated_at = NOW()
      WHERE id = $3 AND user_id = $4
      RETURNING *
      `,
      [cleanTitle, cleanDescription, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating list:", error);

    res.status(500).json({
      message: "Error updating list",
    });
  }
});

app.delete("/lists/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM task_lists
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    res.json({
      message: "List deleted",
      list: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting list:", error);

    res.status(500).json({
      message: "Error deleting list",
    });
  }
});

// ==========================
// TASKS CRUD
// ==========================

app.get("/lists/:listId/tasks", authMiddleware, async (req, res) => {
  try {
    const list = await verifyListOwnership(req.params.listId, req.user.id);

    if (!list) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM tasks
      WHERE list_id = $1
      ORDER BY created_at DESC
      `,
      [req.params.listId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting tasks:", error);

    res.status(500).json({
      message: "Error getting tasks",
    });
  }
});

app.post("/lists/:listId/tasks", authMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const list = await verifyListOwnership(req.params.listId, req.user.id);

    if (!list) {
      return res.status(404).json({
        message: "List not found",
      });
    }

    const id = crypto.randomUUID();

    const result = await pool.query(
      `
      INSERT INTO tasks (id, list_id, title, description, due_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        id,
        req.params.listId,
        title.trim(),
        description || null,
        dueDate || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating task:", error);

    res.status(500).json({
      message: "Error creating task",
    });
  }
});

app.get("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT t.*
      FROM tasks t
      JOIN task_lists l ON l.id = t.list_id
      WHERE t.id = $1 AND l.user_id = $2
      `,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error getting task:", error);

    res.status(500).json({
      message: "Error getting task",
    });
  }
});

app.put("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, completed, dueDate } = req.body;

    const cleanTitle =
      typeof title === "string" && title.trim() ? title.trim() : null;

    const cleanDescription =
      typeof description === "string" ? description : null;

    const cleanCompleted =
      typeof completed === "boolean" ? completed : null;

    const cleanDueDate = dueDate || null;

    const result = await pool.query(
      `
      UPDATE tasks t
      SET
        title = COALESCE($1, t.title),
        description = COALESCE($2, t.description),
        completed = COALESCE($3, t.completed),
        due_date = COALESCE($4, t.due_date),
        updated_at = NOW()
      FROM task_lists l
      WHERE t.list_id = l.id
        AND t.id = $5
        AND l.user_id = $6
      RETURNING t.*
      `,
      [
        cleanTitle,
        cleanDescription,
        cleanCompleted,
        cleanDueDate,
        req.params.id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating task:", error);

    res.status(500).json({
      message: "Error updating task",
    });
  }
});

app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM tasks t
      USING task_lists l
      WHERE t.list_id = l.id
        AND t.id = $1
        AND l.user_id = $2
      RETURNING t.*
      `,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting task:", error);

    res.status(500).json({
      message: "Error deleting task",
    });
  }
});

// ==========================
// SEARCH
// ==========================

app.get("/search", authMiddleware, async (req, res) => {
  try {
    const q = req.query.q || "";

    if (!q.trim()) {
      return res.json({
        lists: [],
        tasks: [],
      });
    }

    const pattern = `%${q.trim()}%`;

    const listsResult = await pool.query(
      `
      SELECT *
      FROM task_lists
      WHERE user_id = $1
        AND (
          title ILIKE $2
          OR description ILIKE $2
        )
      ORDER BY created_at DESC
      `,
      [req.user.id, pattern]
    );

    const tasksResult = await pool.query(
      `
      SELECT t.*
      FROM tasks t
      JOIN task_lists l ON l.id = t.list_id
      WHERE l.user_id = $1
        AND (
          t.title ILIKE $2
          OR t.description ILIKE $2
        )
      ORDER BY t.created_at DESC
      `,
      [req.user.id, pattern]
    );

    res.json({
      lists: listsResult.rows,
      tasks: tasksResult.rows,
    });
  } catch (error) {
    console.error("Error searching:", error);

    res.status(500).json({
      message: "Error searching",
    });
  }
});

// ==========================
// 404
// ==========================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ==========================
// SERVER
// ==========================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});