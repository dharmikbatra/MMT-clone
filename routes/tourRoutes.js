const express = require('express')

const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController')
const reviewRouter = require('../routes/reviewRoutes')
const router = express.Router()


router.use('/:tourId/reviews', reviewRouter)

// router.param('id',tourController.checkID)

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllRoutes)
router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year').get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.getMonthlyPlan
)
router.route('/distances/:latlong/unit/:unit').get(tourController.getDistances)


router.route('/tours-within/:distance/center/:latlong/unit/:unit').get(tourController.getToursWithin)
// can be done like this also:  distance=23&center=40....
router
    .route('/')
    .get( tourController.getAllRoutes)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createTour
    )

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'), 
        tourController.deleteTour
    )

// router
//     .route('/:tourId/reviews')
//     .post(
//         authController.protect,
//         authController.restrictTo('user'),
//         reviewController.createReview
//     )
//     .get()


module.exports = router


