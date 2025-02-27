import express from "express";

import {
  createQuestion,
  deleteQuestion,
  updateQuestion,
} from "../controller/question-controller.js";

// import { verifyAccessToken, verifyIsAdmin, verifyIsOwnerOrAdmin } from "../middleware/basic-access-control.js";

const router = express.Router();

// router.get("/", verifyAccessToken, verifyIsAdmin, getAllUsers);

router.post("/", createQuestion);

// router.get("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, getUser);

router.patch("/:id", updateQuestion);

router.delete("/:id", deleteQuestion);

export default router;