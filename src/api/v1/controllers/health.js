import asyncHandler from "express-async-handler";
export const healthCheckController =  asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy.",
  });
}
);