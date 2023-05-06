const express = require('express');
const tourController = require('../controllers/tourController');
const authcontroller = require('../controllers/authController');
const reviewRouter = require('../routers/reviewRouter');

const router = express.Router();
/* return mini-app object!The idea behind the mini app is that each router
 in your app can become quite complicated, and you'd benefit from moving all that code into a separate file.
Le routeur de chaque fichier devient une mini-application, dont la structure est très similaire à celle de 
l'application principale.*/

/* 
      app.get('/api/v1/tours', (req, res) => {})
      app.post('/api/v1/tours', (req, res) => {})
      ( the callbckfn is mouve to the controller)
    
 router obj remplace app obj, with the idea to move the callbackfn to in own file 
         route() methode define un url pour chaque HTTP methode!!!! so that we can make chainable http metthods
*/
router.use('/:tourId/review', reviewRouter);

router
  .route('/top-5-cheap') //  '/api/v1/tours/top-5-cheap '
  .get(tourController.aliasTopTours, tourController.getAllTours); // tourController.getAllTours callbackfn()

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authcontroller.protect,
    authcontroller.restrictTO('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);
// using query string  tour-distance=?distance=243&center=-40,45&unit=mil
//                   tour-distance/243/center/-40,45/unit/mil
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/') // route() methode define un url(route) pour chaque HTTP methode!!!!  url=/api/v1/tours
  .get(tourController.getAllTours) // check for protect, before we get all tours
  .post(
    authcontroller.protect,
    authcontroller.restrictTO('user', 'lead-guide'),
    tourController.createNewTour
  );

/*app */ router
  .route('/:id') //  /api/v1/tours/:id
  .get(tourController.getTour)
  .patch(
    authcontroller.protect,
    authcontroller.restrictTO('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authcontroller.protect,
    authcontroller.restrictTO('admin', 'lead-guide'),
    tourController.deleteTour
  );
// nested Router
// router
//   .route('/:tourId/review')
//   .post(
//     authcontroller.protect,
//     authcontroller.restrictTO('user'),
//     reviewController.createReview
//   );

module.exports = router;
