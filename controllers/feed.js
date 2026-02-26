const { Posting, Profile, Like, Follow, Comment, sequelize } = require('../models')
const { Op } = require('sequelize')

async function getFeed(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50)
    const cursorParam = req.query.cursor

    let whereClause = {}

    if (cursorParam) {
      let cursor
      try {
        cursor = JSON.parse(Buffer.from(cursorParam, 'base64').toString('utf8'))
      } catch {
        return res.status(400).json({ err: 'Invalid cursor' })
      }

      whereClause = {
        [Op.or]: [
          { createdAt: { [Op.lt]: new Date(cursor.createdAt) } },
          {
            createdAt: new Date(cursor.createdAt),
            id: { [Op.lt]: cursor.id },
          },
        ],
      }
    }

    const postings = await Posting.findAll({
      where: whereClause,
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['id', 'name', 'photo'],
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      limit,
    })

    // Aggregate counts with a single query for efficiency
    const postingIds = postings.map((p) => p.id)

    let likeCounts = {}
    let commentCounts = {}
    let viewerLikedSet = new Set()
    let viewerFollowsSet = new Set()

    if (postingIds.length > 0) {
      const likeRows = await Like.findAll({
        where: { postingId: { [Op.in]: postingIds } },
        attributes: ['postingId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['postingId'],
        raw: true,
      })
      likeRows.forEach((r) => { likeCounts[r.postingId] = parseInt(r.count, 10) })

      const commentRows = await Comment.findAll({
        where: { postingId: { [Op.in]: postingIds } },
        attributes: ['postingId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['postingId'],
        raw: true,
      })
      commentRows.forEach((r) => { commentCounts[r.postingId] = parseInt(r.count, 10) })

      // Viewer-specific flags (only when authenticated)
      if (req.user) {
        const viewerProfileId = req.user.profile.id

        const viewerLikes = await Like.findAll({
          where: { profileId: viewerProfileId, postingId: { [Op.in]: postingIds } },
          attributes: ['postingId'],
          raw: true,
        })
        viewerLikes.forEach((r) => viewerLikedSet.add(r.postingId))

        const creatorIds = [...new Set(postings.map((p) => p.creatorId))]
        const viewerFollows = await Follow.findAll({
          where: {
            followerId: viewerProfileId,
            followingId: { [Op.in]: creatorIds },
          },
          attributes: ['followingId'],
          raw: true,
        })
        viewerFollows.forEach((r) => viewerFollowsSet.add(r.followingId))
      }
    }

    const items = postings.map((p) => {
      const item = {
        id: p.id,
        caption: p.text,
        mediaUrl: p.mediaUrl,
        thumbnailUrl: p.thumbnailUrl,
        durationSec: p.durationSec,
        tags: p.tags || [],
        createdAt: p.createdAt,
        creator: p.profile
          ? { id: p.profile.id, name: p.profile.name, photo: p.profile.photo }
          : null,
        likeCount: likeCounts[p.id] || 0,
        commentCount: commentCounts[p.id] || 0,
      }

      if (req.user) {
        item.viewerHasLiked = viewerLikedSet.has(p.id)
        item.viewerFollowsCreator = viewerFollowsSet.has(p.creatorId)
      }

      return item
    })

    let nextCursor = null
    if (postings.length === limit) {
      const last = postings[postings.length - 1]
      nextCursor = Buffer.from(
        JSON.stringify({ createdAt: last.createdAt, id: last.id })
      ).toString('base64')
    }

    res.status(200).json({ items, nextCursor })
  } catch (err) {
    console.log(err)
    res.status(500).json({ err: err.message })
  }
}

module.exports = { getFeed }
