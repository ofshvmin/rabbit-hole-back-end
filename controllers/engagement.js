const { Like, Follow, Comment, WatchEvent, Posting, Profile } = require('../models')
const { sequelize } = require('../models')

// POST /api/engagement/like  { postingId }
async function likePosting(req, res) {
  const profileId = req.user.profile.id
  const { postingId } = req.body
  if (!postingId) return res.status(400).json({ err: 'postingId is required' })

  try {
    const posting = await Posting.findByPk(postingId)
    if (!posting) return res.status(404).json({ err: 'Posting not found' })

    await sequelize.transaction(async (t) => {
      const [like, created] = await Like.findOrCreate({
        where: { profileId, postingId },
        transaction: t,
      })
      if (!created) {
        const err = new Error('Already liked')
        err.status = 409
        throw err
      }
      return like
    })

    res.status(201).json({ msg: 'Liked' })
  } catch (err) {
    if (err.status === 409) return res.status(409).json({ err: err.message })
    console.log(err)
    res.status(500).json({ err: err.message })
  }
}

// DELETE /api/engagement/like/:postingId
async function unlikePosting(req, res) {
  const profileId = req.user.profile.id
  const postingId = parseInt(req.params.postingId, 10)

  try {
    const deleted = await Like.destroy({ where: { profileId, postingId } })
    if (!deleted) return res.status(404).json({ err: 'Like not found' })
    res.status(200).json({ msg: 'Unliked' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ err: err.message })
  }
}

// POST /api/engagement/follow  { profileId }
async function followProfile(req, res) {
  const followerId = req.user.profile.id
  const followingId = parseInt(req.body.profileId, 10)

  if (!followingId) return res.status(400).json({ err: 'profileId is required' })
  if (followerId === followingId) return res.status(400).json({ err: 'Cannot follow yourself' })

  try {
    const target = await Profile.findByPk(followingId)
    if (!target) return res.status(404).json({ err: 'Profile not found' })

    await sequelize.transaction(async (t) => {
      const [, created] = await Follow.findOrCreate({
        where: { followerId, followingId },
        transaction: t,
      })
      if (!created) {
        const err = new Error('Already following')
        err.status = 409
        throw err
      }
    })

    res.status(201).json({ msg: 'Followed' })
  } catch (err) {
    if (err.status === 409) return res.status(409).json({ err: err.message })
    console.log(err)
    res.status(500).json({ err: err.message })
  }
}

// DELETE /api/engagement/follow/:profileId
async function unfollowProfile(req, res) {
  const followerId = req.user.profile.id
  const followingId = parseInt(req.params.profileId, 10)

  try {
    const deleted = await Follow.destroy({ where: { followerId, followingId } })
    if (!deleted) return res.status(404).json({ err: 'Follow not found' })
    res.status(200).json({ msg: 'Unfollowed' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ err: err.message })
  }
}

// POST /api/engagement/comment  { postingId, text }
async function addComment(req, res) {
  const profileId = req.user.profile.id
  const { postingId, text } = req.body

  if (!postingId) return res.status(400).json({ err: 'postingId is required' })
  if (!text || !text.trim()) return res.status(400).json({ err: 'text is required' })
  if (text.length > 2000) return res.status(400).json({ err: 'Comment too long (max 2000 chars)' })

  try {
    const posting = await Posting.findByPk(postingId)
    if (!posting) return res.status(404).json({ err: 'Posting not found' })

    const comment = await Comment.create({ profileId, postingId, text: text.trim() })
    res.status(201).json(comment)
  } catch (err) {
    console.log(err)
    res.status(500).json({ err: err.message })
  }
}

// POST /api/engagement/watch  { postingId, watchTimeMs, completed }
async function recordWatch(req, res) {
  const profileId = req.user.profile.id
  const { postingId, watchTimeMs, completed } = req.body

  if (!postingId) return res.status(400).json({ err: 'postingId is required' })
  if (watchTimeMs === undefined || watchTimeMs === null) {
    return res.status(400).json({ err: 'watchTimeMs is required' })
  }
  if (typeof watchTimeMs !== 'number' || watchTimeMs < 0) {
    return res.status(400).json({ err: 'watchTimeMs must be a non-negative number' })
  }

  try {
    const posting = await Posting.findByPk(postingId)
    if (!posting) return res.status(404).json({ err: 'Posting not found' })

    const event = await WatchEvent.create({
      profileId,
      postingId,
      watchTimeMs,
      completed: !!completed,
    })
    res.status(201).json(event)
  } catch (err) {
    console.log(err)
    res.status(500).json({ err: err.message })
  }
}

module.exports = { likePosting, unlikePosting, followProfile, unfollowProfile, addComment, recordWatch }
