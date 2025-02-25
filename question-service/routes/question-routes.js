import express from "express";

import {
  createQuestion,
} from "../controller/question-controller.js";

// import { verifyAccessToken, verifyIsAdmin, verifyIsOwnerOrAdmin } from "../middleware/basic-access-control.js";

const router = express.Router();

// router.get("/", verifyAccessToken, verifyIsAdmin, getAllUsers);

router.post("/", createQuestion);

// router.get("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, getUser);

// router.patch("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, updateUser);

// router.delete("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, deleteUser);

export default router;