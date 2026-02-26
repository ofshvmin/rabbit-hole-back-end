const router = require('express').Router()
const authCtrl = require('../controllers/auth.js')
const middleware = require('../middleware/auth.js')

const { decodeUserFromToken, checkAuth } = middleware

/*---------- Public Routes ----------*/
router.post('/signup', authCtrl.signup)
router.post('/login', authCtrl.login)
router.post('/google', authCtrl.googleAuth)
router.post('/apple', authCtrl.appleAuth)
router.post('/facebook', authCtrl.facebookAuth)

/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)
router.post('/change-password', checkAuth, authCtrl.changePassword)

module.exports = router
