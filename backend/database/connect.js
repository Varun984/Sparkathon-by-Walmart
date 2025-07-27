import {neon} from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

const sql = neon(process.env.NEON_URL || "postgresql://neondb_owner:npg_7bqhFSzUN1sP@ep-old-field-a7q5qdi7-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
const db = drizzle({client: sql, schema: schema});

export default db;