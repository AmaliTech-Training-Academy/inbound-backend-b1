import express from "express";
import {downloadAttachment} from "../controllers/attachmentController.js";
import {requireSessionAccess} from "../../../middlewares/requireSessionAccess.js";

const attachmentRouter = express.Router()

attachmentRouter.get(
    "/:attachmentId",
    requireSessionAccess,
    downloadAttachment
)

export {attachmentRouter}
