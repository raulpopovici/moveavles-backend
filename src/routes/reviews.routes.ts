import express from "express";
const router = express.Router();
const reviewController = require("../controllers/reviews.controller");

router.post("/api/giveReview", reviewController.giveReview);
router.get("/api/getReviews", reviewController.getReviews);
router.get(
  "/api/checkReviewEligibility",
  reviewController.checkReviewEligibility
);
router.get("/api/getAllReviews", reviewController.getAllReviews);

export { router as ReviewRouter };
