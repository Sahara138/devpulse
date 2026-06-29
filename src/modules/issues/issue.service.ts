import { pool } from "../../db";
import sendResponse from "../../utility/sendResponse";
import type { Issue } from "./issue.interface";

const createIssueIntoDB = async (payload: {
  title: string;
  description: string;
  type: string;
  reporter_id: number;
}) => {
  const { title, description, type, reporter_id } = payload;

  const issueData = await pool.query(
    `
  INSERT INTO issues (title, description, type, reporter_id)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
  `,
    [title, description, type, reporter_id],
  );

  return issueData;
};

const getAllIssueFromDB = async (query: {
  sort: string;
  type: string;
  status: string;
}) => {
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

  const conditions: string[] = [];
  const values: any[] = [];

  // Filter by type
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  // Filter by status
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Sort
  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }

  return await pool.query(sql, values);
};

const getSingleIssueFromDB = async (id: string) => {
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

const updateIssueIntoDB = async (
  id: string,
  payload: Issue
) => {
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

const deleteIssueIntoDB = async (id: string) => {
  const result = await pool.query(`
            DELETE FROM issues WHERE id=$1
            RETURNING *
            `,[id]);
  return result;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueIntoDB
};
