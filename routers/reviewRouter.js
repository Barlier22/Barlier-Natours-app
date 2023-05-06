const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const route = express.Router({ mergeParams: true });

//--> only authentificate user can performe these action
route.use(authController.protect);
route.route('/').get(reviewController.getAllReviews).post(
  authController.restrictTO('user'), // only user can create review
  reviewController.createTourUserId,
  reviewController.createReview
);
route
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTO('user', 'admin'), // only user and admin can updateReview
    reviewController.updateReiew
  )
  .delete(
    authController.restrictTO('user', 'admin'), // only user and admin can delet reveiw.
    reviewController.deleteReview
  );
module.exports = route;
