const express = require('express');
const bookingController = require('../controllers/bookingController');
const auth = require('../controllers/authController');
/*-------------------------------------------------------------- 

 -------------------------------------------------------------*/

const router = express.Router();
router.use(auth.protect);
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(auth.restrictTO('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getOneBooking)
  .delete(bookingController.deleteBooking)
  .patch(bookingController.updateBooking);

module.exports = router;
