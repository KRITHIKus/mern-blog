// routes/stats.route.js

import express from "express";
import { getStats } from "../controllers/stats.js";
const router = express.Router();

router.get("/", getStats); // public

export default router;