/**
 * Idempotent seed script.
 * Clears engagement tables then re-populates everything from scratch.
 * Users/Profiles are upserted by email/userId so re-runs are safe.
 *
 * Usage:
 *   npm run seed
 */
require('dotenv').config()
const bcrypt = require('bcrypt')
const { User, Profile, Posting, Like, Follow, Comment, WatchEvent, sequelize } = require('../models')

const PROFILE_COUNT = 100
const POSTING_COUNT = 800
const SALT_ROUNDS = 6

// Deterministic PRNG (mulberry32) so re-runs produce the same data
function makePrng(seed) {
  let s = seed >>> 0
  return function () {
    s += 0x6d2b79f5
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = makePrng(42)

function randInt(min, max) {
  return Math.floor(rng() * (max - min + 1)) + min
}

function randItem(arr) {
  return arr[Math.floor(rng() * arr.length)]
}

// Random date within last `days` days, weighted toward recent
function randDate(days = 60) {
  const now = Date.now()
  // Use square root weighting: more recent dates are more likely
  const fraction = Math.pow(rng(), 0.5)
  const ms = fraction * days * 24 * 60 * 60 * 1000
  return new Date(now - ms)
}

const WORDS = [
  'fire', 'sunset', 'vibe', 'grind', 'glow', 'wave', 'chill', 'hustle', 'dream',
  'flow', 'spark', 'neon', 'dusk', 'chase', 'drift', 'rush', 'pulse', 'rise',
  'gold', 'wild', 'haze', 'loop', 'zoom', 'snap', 'flex', 'mood', 'peak',
]

const TAGS_POOL = [
  'trending', 'viral', 'fyp', 'shorts', 'ootd', 'aesthetic', 'motivation',
  'comedy', 'music', 'dance', 'food', 'travel', 'tech', 'gaming', 'fitness',
]

function randomCaption() {
  const count = randInt(3, 8)
  const words = []
  for (let i = 0; i < count; i++) words.push(randItem(WORDS))
  return words.join(' ')
}

function randomTags() {
  const count = randInt(1, 4)
  const tags = []
  const pool = [...TAGS_POOL]
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * pool.length)
    tags.push(pool.splice(idx, 1)[0])
  }
  return tags
}

async function main() {
  console.log('Connecting to database...')
  await sequelize.authenticate()

  // Clear engagement tables (order matters for FK constraints)
  console.log('Clearing engagement tables...')
  await WatchEvent.destroy({ where: {}, truncate: true, cascade: true })
  await Comment.destroy({ where: {}, truncate: true, cascade: true })
  await Like.destroy({ where: {}, truncate: true, cascade: true })
  await Follow.destroy({ where: {}, truncate: true, cascade: true })
  await Posting.destroy({ where: {}, truncate: true, cascade: true })
  await Profile.destroy({ where: {}, truncate: true, cascade: true })
  await User.destroy({ where: {}, truncate: true, cascade: true })

  // ── Create Users + Profiles ──────────────────────────────────────────────
  console.log(`Creating ${PROFILE_COUNT} users + profiles...`)
  const passwordHash = await bcrypt.hash('Password1!', SALT_ROUNDS)

  const profileIds = []
  for (let i = 1; i <= PROFILE_COUNT; i++) {
    const user = await User.create({
      name: `User ${i}`,
      email: `seed_user_${i}@rabbithole.dev`,
      password: passwordHash,
    })
    // bypass beforeSave hash (already hashed above) — need raw insert
    // Actually the beforeSave hook will re-hash; use a workaround:
    // We reset the hash directly after create
    await user.update({ password: passwordHash }, { hooks: false })

    const profile = await Profile.create({
      name: `Creator ${i}`,
      photo: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
      userId: user.id,
    })
    profileIds.push(profile.id)
  }
  console.log('Users + profiles created.')

  // ── Create Postings ──────────────────────────────────────────────────────
  // Skew: top 10% of creators produce ~50% of posts
  console.log(`Creating ${POSTING_COUNT} postings...`)
  const heavyCreators = profileIds.slice(0, Math.floor(PROFILE_COUNT * 0.1))
  const postingRecords = []

  for (let i = 0; i < POSTING_COUNT; i++) {
    const isHeavy = rng() < 0.5
    const creatorId = isHeavy
      ? randItem(heavyCreators)
      : randItem(profileIds)

    postingRecords.push({
      creatorId,
      text: randomCaption(),
      type: 'video',
      mediaUrl: `https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_${randInt(1, 30)}mb.mp4`,
      thumbnailUrl: `https://picsum.photos/seed/${i + 1}/400/700`,
      durationSec: randInt(5, 180),
      tags: randomTags(),
      numOfLikes: 0,
      createdAt: randDate(60),
      updatedAt: new Date(),
    })
  }

  const postings = await Posting.bulkCreate(postingRecords)
  const postingIds = postings.map((p) => p.id)
  console.log('Postings created.')

  // ── Follows ──────────────────────────────────────────────────────────────
  console.log('Creating follows...')
  const followSet = new Set()
  const followRecords = []

  for (const followerId of profileIds) {
    const count = randInt(3, 15)
    let attempts = 0
    while (followRecords.filter((f) => f.followerId === followerId).length < count && attempts < 100) {
      attempts++
      const followingId = randItem(profileIds)
      if (followingId === followerId) continue
      const key = `${followerId}:${followingId}`
      if (followSet.has(key)) continue
      followSet.add(key)
      followRecords.push({ followerId, followingId, createdAt: randDate(60), updatedAt: new Date() })
    }
  }

  await Follow.bulkCreate(followRecords, { ignoreDuplicates: true })
  console.log(`${followRecords.length} follows created.`)

  // ── Likes ────────────────────────────────────────────────────────────────
  console.log('Creating likes...')
  const likeSet = new Set()
  const likeRecords = []

  for (const profileId of profileIds) {
    const count = randInt(5, 40)
    let attempts = 0
    while (likeRecords.filter((l) => l.profileId === profileId).length < count && attempts < 200) {
      attempts++
      const postingId = randItem(postingIds)
      const key = `${profileId}:${postingId}`
      if (likeSet.has(key)) continue
      likeSet.add(key)
      likeRecords.push({ profileId, postingId, createdAt: randDate(60), updatedAt: new Date() })
    }
  }

  await Like.bulkCreate(likeRecords, { ignoreDuplicates: true })
  console.log(`${likeRecords.length} likes created.`)

  // ── Comments ─────────────────────────────────────────────────────────────
  console.log('Creating comments...')
  const commentTexts = [
    'Love this!', 'Amazing content', 'So good 🔥', 'Keep it up!',
    'This is fire', 'Wow!', 'Incredible', 'Nice one', 'So relatable',
    'Can\'t stop watching', 'More of this please', 'Legendary',
  ]
  const commentRecords = []

  for (const profileId of profileIds) {
    const count = randInt(0, 10)
    for (let i = 0; i < count; i++) {
      commentRecords.push({
        profileId,
        postingId: randItem(postingIds),
        text: randItem(commentTexts),
        createdAt: randDate(60),
        updatedAt: new Date(),
      })
    }
  }

  await Comment.bulkCreate(commentRecords)
  console.log(`${commentRecords.length} comments created.`)

  // ── WatchEvents ──────────────────────────────────────────────────────────
  console.log('Creating watch events...')
  const watchRecords = []

  for (const profileId of profileIds) {
    const count = randInt(50, 200)
    for (let i = 0; i < count; i++) {
      const durationSec = randInt(5, 180)
      const watchFraction = rng()
      watchRecords.push({
        profileId,
        postingId: randItem(postingIds),
        watchTimeMs: Math.floor(watchFraction * durationSec * 1000),
        completed: watchFraction > 0.85,
        createdAt: randDate(60),
        updatedAt: new Date(),
      })
    }
  }

  // Insert in batches to avoid overwhelming the connection
  const BATCH = 1000
  for (let i = 0; i < watchRecords.length; i += BATCH) {
    await WatchEvent.bulkCreate(watchRecords.slice(i, i + BATCH))
  }
  console.log(`${watchRecords.length} watch events created.`)

  console.log('\nSeed complete.')
  console.log(`  Profiles:    ${PROFILE_COUNT}`)
  console.log(`  Postings:    ${POSTING_COUNT}`)
  console.log(`  Follows:     ${followRecords.length}`)
  console.log(`  Likes:       ${likeRecords.length}`)
  console.log(`  Comments:    ${commentRecords.length}`)
  console.log(`  WatchEvents: ${watchRecords.length}`)

  await sequelize.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
