
        import {createRequire} from 'module';
        const require = createRequire(import.meta.url)
    

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'contributor',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'open',
        reporter_id INT NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};

// src/app.ts
import express from "express";
import cors from "cors";

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";

// src/utility/jwt.ts
import jwt from "jsonwebtoken";
var jwtHelper = {
  generateToken(payload, secret, options) {
    return jwt.sign(payload, secret, options);
  },
  verifyToken(token, secret) {
    return jwt.verify(token, secret);
  }
};

// src/modules/auth/auth.service.ts
var signupUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `
            INSERT INTO users (name,email,password,role) VALUES($1,$2,$3,$4)
            RETURNING *
            `,
    [name, email, hashedPassword, role]
  );
  const user = result.rows[0];
  delete user.password;
  return user;
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
            SELECT * FROM users WHERE email=$1
            `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("User not found!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtHelper.generateToken(
    jwtPayload,
    config_default.secret,
    {
      expiresIn: "1d"
    }
  );
  delete user.password;
  return { token: accessToken, user };
};
var generateRefreshToken = async (token) => {
  if (!token) {
    throw new Error("Unauthorized access");
  }
  const decoded = jwtHelper.verifyToken(
    token,
    config_default.refresh_secret
  );
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email = $1
        `,
    [decoded.email]
  );
  const user = userData.rows[0];
  if (userData.rows.length === 0) {
    throw new Error("User not found!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtHelper.generateToken(
    jwtPayload,
    config_default.secret,
    {
      expiresIn: "1d"
    }
  );
  return { accessToken };
};
var authService = {
  signupUserIntoDB,
  loginUserIntoDB,
  generateRefreshToken
};

// src/modules/auth/auth.controller.ts
var signupUser = async (req, res) => {
  try {
    const result = await authService.signupUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    console.log(result);
    res.cookie("refreshToken", refreshToken, {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    });
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User login successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.generateRefreshToken(req.cookies.refreshToken);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Access token generate",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  signupUser,
  loginUser,
  refreshToken
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.signupUser);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
var authRoute = router;

// src/modules/issues/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issue.service.ts
var createIssueIntoDB = async (payload) => {
  const { title, description, type, reporter_id } = payload;
  const issueData = await pool.query(
    `
  INSERT INTO issues (title, description, type, reporter_id)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
  `,
    [title, description, type, reporter_id]
  );
  return issueData;
};
var getAllIssueFromDB = async (query) => {
  const { sort = "newest", type, status } = query;
  let sql = `
SELECT
    issues.id,
    issues.title,
    issues.description,
    issues.type,
    issues.status,

    json_build_object(
        'id', users.id,
        'name', users.name,
        'role', users.role
    ) AS reporter,

    issues.created_at,
    issues.updated_at

FROM issues
JOIN users
ON issues.reporter_id = users.id
`;
  const conditions = [];
  const values = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }
  return await pool.query(sql, values);
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    `
    SELECT
      issues.id,
      issues.title,
      issues.description,
      issues.type,
      issues.status,
      json_build_object(
        'id', users.id,
        'name', users.name,
        'role', users.role
      ) AS reporter,
      issues.created_at,
      issues.updated_at
    FROM issues
    JOIN users
      ON issues.reporter_id = users.id
    WHERE issues.id = $1
    `,
    [id]
  );
  return result;
};
var updateIssueIntoDB = async (id, payload) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
    UPDATE issues
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      status = COALESCE($4, status),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *;
    `,
    [title, description, type, status, id]
  );
  return result;
};
var deleteIssueIntoDB = async (id) => {
  const result = await pool.query(`
            DELETE FROM issues WHERE id=$1
            RETURNING *
            `, [id]);
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueIntoDB
};

// src/modules/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const result = await issueService.createIssueIntoDB({
      ...req.body,
      reporter_id: req.user.id
    });
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await issueService.getAllIssueFromDB({
      sort: req.query.sort,
      type: req.query.type,
      status: req.query.status
    });
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result.rows
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await issueService.getSingleIssueFromDB(id);
    if (result.rowCount === 0) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "User not found!",
        data: {}
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await issueService.getSingleIssueFromDB(id);
    if (issue.rowCount === 0) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found!",
        data: {}
      });
    }
    const existingIssue = issue.rows[0];
    if (req.user.role === "contributor" && existingIssue.reporter_id !== req.user.id) {
      return sendResponse_default(res, {
        statusCode: 403,
        success: false,
        message: "You can only update your own issues."
      });
    }
    if (req.user.role === "contributor" && req.body.status !== void 0) {
      return sendResponse_default(res, {
        statusCode: 403,
        success: false,
        message: "Contributors cannot change issue status."
      });
    }
    const result = await issueService.updateIssueIntoDB(id, req.body);
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueIntoDB(id);
    if (result.rowCount === 0) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found!",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully!",
      // data: result.rows[0]
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access"
        });
      }
      const decoded = jwtHelper.verifyToken(
        token,
        config_default.secret
      );
      const userData = await pool.query(
        `
         SELECT * FROM users WHERE email = $1
        `,
        [decoded.email]
      );
      if (userData.rows.length === 0) {
        throw new Error("User not found!");
      }
      if (roles.length && !roles.includes(decoded.role)) {
        throw new Error("Forbidden");
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  CONTRIBUTOR: "contributor",
  MAINTAINER: "maintainer"
};

// src/modules/issues/issue.route.ts
var router2 = Router2();
router2.post("/", auth_default(USER_ROLE.CONTRIBUTOR, USER_ROLE.MAINTAINER), issueController.createIssue);
router2.get("/", auth_default(USER_ROLE.CONTRIBUTOR, USER_ROLE.MAINTAINER), issueController.getAllIssues);
router2.get("/:id", auth_default(USER_ROLE.CONTRIBUTOR, USER_ROLE.MAINTAINER), issueController.getSingleIssue);
router2.patch("/:id", auth_default(USER_ROLE.CONTRIBUTOR, USER_ROLE.MAINTAINER), issueController.updateIssue);
router2.delete("/:delete", auth_default(USER_ROLE.MAINTAINER), issueController.deleteIssue);
var issueRoute = router2;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Unexpected server or database error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var corsOptions = {
  origin: "http://localhost:3000"
};
app.use(cors(corsOptions));
app.get("/", (req, res) => {
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Devpulse Server"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map