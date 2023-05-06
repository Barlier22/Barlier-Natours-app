const express = require('express');
const viewsController = require('../controllers/viewsController');
const auth = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  auth.isLogedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', auth.isLogedIn, viewsController.getTour);
router.get('/login', auth.isLogedIn, viewsController.getLoginForm);
router.get('/me', auth.protect, viewsController.getAccount);
router.get('/my-tours', auth.protect, viewsController.getMyTours);
router.post('/submit-user-data', auth.protect, viewsController.updsteUserData);

module.exports = router;
