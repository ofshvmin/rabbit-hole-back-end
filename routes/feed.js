const router = require('express').Router()
const feedCtrl = require('../controllers/feed.js')
const { decodeUserFromToken } = require('../middleware/auth.js')

// Public route — decodeUserFromToken populates req.user if token present,
// but does NOT require auth (no checkAuth)
router.get('/', decodeUserFromToken, feedCtrl.getFeed)

module.exports = router
