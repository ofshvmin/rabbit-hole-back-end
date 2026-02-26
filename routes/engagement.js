const router = require('express').Router()
const engagementCtrl = require('../controllers/engagement.js')
const { decodeUserFromToken, checkAuth } = require('../middleware/auth.js')

router.use(decodeUserFromToken)

router.post('/like', checkAuth, engagementCtrl.likePosting)
router.delete('/like/:postingId', checkAuth, engagementCtrl.unlikePosting)

router.post('/follow', checkAuth, engagementCtrl.followProfile)
router.delete('/follow/:profileId', checkAuth, engagementCtrl.unfollowProfile)

router.post('/comment', checkAuth, engagementCtrl.addComment)

router.post('/watch', checkAuth, engagementCtrl.recordWatch)

module.exports = router
