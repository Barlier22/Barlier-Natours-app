const reviewModel = require('../models/reviewModel');
const asyncCatch = require('../utility/asyncCatch');
const factory = require('../controllers/handlerFactory');

exports.getAllReviews = factory.getAll(reviewModel);
// exports.getAllReviews = asyncCatch(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.paramas.tourId };
//   const review = await reviewModel.find(filter);

//   //--> send response
//   res.status(200).json({
//     status: 'success',
//     results: review.length,
//     data: {
//       review,
//     },
//   });
// });

exports.createTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// exports.createReview = asyncCatch(async (req, res, next) => {
//   //--> create a review
// if (!req.body.tour) req.body.tour = req.params.tourId;
// if (!req.body.tour) req.body.tour = req.user._id;

//   const newReview = await reviewModel.create({
//     review: req.body.review,
//     rating: req.body.rating,
//     createdAt: req.body.createdAt,
//     tour: req.body.tour,
//     user: req.body.user,
//   });

//   //--> send response
//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview,
//     },
//   });
// });
exports.getReview = factory.getOne(reviewModel);
exports.createReview = factory.createOne(reviewModel);
exports.updateReiew = factory.updateOne(reviewModel);
exports.deleteReview = factory.deleteOne(reviewModel);
