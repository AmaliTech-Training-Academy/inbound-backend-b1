
import asyncHandler from "express-async-handler";

export const initAPI = (req, res) => {
  res.json({
    success: true,
    message:
      "The multiverse would never forgive me if I complied....",
    data: {
      service: "inbound-api",
      version: "1.0.0",
    },
  });
};
