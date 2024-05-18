const express = require('express')
const viewController = require('../controllers/viewController')
const authController = require('../controllers/authController')

const router = express.Router()


router.get('/me', authController.protect, viewController.accountPage)
router.post('/submit-user-data', authController.protect, viewController.updateUserData)

router.get('/',authController.isLoggedIn,viewController.getOverview)
router.get('/login',authController.isLoggedIn,viewController.getLoginForm)
router.get('/tour/:tourSlug', authController.isLoggedIn, viewController.getTour)

module.exports = router