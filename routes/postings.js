const router = require('express').Router()
const postingsCtrl = require('../controllers/postings.js')
const middleware = require('../middleware/auth.js')

const { decodeUserFromToken, checkAuth } = middleware

/*---------- Public Routes ----------*/


/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)
router.post('/', checkAuth, postingsCtrl.create)
router.put('/:postingId', checkAuth, postingsCtrl.update)
router.delete('/:postingId', checkAuth, postingsCtrl.delete)


module.exports = router