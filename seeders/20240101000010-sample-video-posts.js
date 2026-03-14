'use strict'

const { User, Profile, Posting } = require('../models')

// Publicly available sample short videos (Google sample videos CDN)
const SAMPLE_VIDEOS = [
  {
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/blaze/400/700',
    durationSec: 15,
  },
  {
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/escape/400/700',
    durationSec: 15,
  },
  {
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/fun/400/700',
    durationSec: 60,
  },
  {
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/joy/400/700',
    durationSec: 15,
  },
  {
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/melt/400/700',
    durationSec: 15,
  },
  {
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/subaru/400/700',
    durationSec: 57,
  },
]

const SEED_USERS = [
  { name: 'Alex Rivera', email: 'alex@seed.dev', password: 'password123' },
  { name: 'Jordan Lee',  email: 'jordan@seed.dev', password: 'password123' },
  { name: 'Sam Chen',    email: 'sam@seed.dev',    password: 'password123' },
  { name: 'Mia Torres',  email: 'mia@seed.dev',    password: 'password123' },
  { name: 'Noah Kim',    email: 'noah@seed.dev',   password: 'password123' },
]

const SEED_POSTINGS = [
  // Alex
  {
    userIndex: 0,
    text: 'When the beat drops and your dog starts vibing 🐶🎵',
    tags: ['comedy', 'pets', 'viral'],
    numOfLikes: 1432,
    videoIndex: 0,
  },
  {
    userIndex: 0,
    text: 'Morning routine that actually changed my life ✨',
    tags: ['lifestyle', 'morning', 'wellness'],
    numOfLikes: 892,
    videoIndex: 1,
  },
  {
    userIndex: 0,
    text: '3 cooking hacks you need right now 🍳',
    tags: ['cooking', 'hacks', 'food'],
    numOfLikes: 3210,
    videoIndex: 2,
  },
  // Jordan
  {
    userIndex: 1,
    text: 'POV: you finally nail the hardest dance move 💃',
    tags: ['dance', 'trending', 'fyp'],
    numOfLikes: 5870,
    videoIndex: 3,
  },
  {
    userIndex: 1,
    text: 'This hiking trail has the most insane view 🏔️',
    tags: ['travel', 'hiking', 'nature'],
    numOfLikes: 2100,
    videoIndex: 4,
  },
  {
    userIndex: 1,
    text: 'Street food in Tokyo will ruin all other food for you 🍜',
    tags: ['travel', 'food', 'japan'],
    numOfLikes: 7654,
    videoIndex: 5,
  },
  // Sam
  {
    userIndex: 2,
    text: '30-second ab workout that actually burns 🔥',
    tags: ['fitness', 'workout', 'abs'],
    numOfLikes: 4320,
    videoIndex: 0,
  },
  {
    userIndex: 2,
    text: 'Thrift flip turned this $2 jacket into something 🔥',
    tags: ['fashion', 'thrift', 'diy'],
    numOfLikes: 9801,
    videoIndex: 1,
  },
  {
    userIndex: 2,
    text: 'Unpopular opinion: this movie is actually a masterpiece 🎬',
    tags: ['movies', 'opinion', 'entertainment'],
    numOfLikes: 1122,
    videoIndex: 2,
  },
  // Mia
  {
    userIndex: 3,
    text: 'Told my cat I got a dog and filmed her reaction 😂',
    tags: ['comedy', 'pets', 'cats'],
    numOfLikes: 11400,
    videoIndex: 3,
  },
  {
    userIndex: 3,
    text: 'Minimal desk setup that cost under $100 💻',
    tags: ['tech', 'setup', 'productivity'],
    numOfLikes: 3345,
    videoIndex: 4,
  },
  {
    userIndex: 3,
    text: 'Painting this mural start to finish ⏩🎨',
    tags: ['art', 'timelapse', 'creative'],
    numOfLikes: 6780,
    videoIndex: 5,
  },
  // Noah
  {
    userIndex: 4,
    text: 'Car spotted that I\'ve never seen before 😳🚗',
    tags: ['cars', 'rare', 'automotive'],
    numOfLikes: 2234,
    videoIndex: 0,
  },
  {
    userIndex: 4,
    text: 'The best $5 meal in NYC, no cap 🗽',
    tags: ['food', 'nyc', 'budget'],
    numOfLikes: 8912,
    videoIndex: 1,
  },
  {
    userIndex: 4,
    text: 'Learning to skateboard at 25 — day 1 😅',
    tags: ['skateboarding', 'learn', 'progress'],
    numOfLikes: 4567,
    videoIndex: 2,
  },
]

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create users (beforeSave hook will hash passwords)
    const createdUsers = await Promise.all(
      SEED_USERS.map(u => User.create(u))
    )

    // Create one profile per user
    const createdProfiles = await Promise.all(
      createdUsers.map(u =>
        Profile.create({
          name: u.name,
          userId: u.id,
          photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`,
        })
      )
    )

    // Create postings
    await Promise.all(
      SEED_POSTINGS.map(p => {
        const video = SAMPLE_VIDEOS[p.videoIndex]
        return Posting.create({
          creatorId: createdProfiles[p.userIndex].id,
          text: p.text,
          tags: p.tags,
          numOfLikes: p.numOfLikes,
          type: 'video',
          mediaUrl: video.mediaUrl,
          thumbnailUrl: video.thumbnailUrl,
          durationSec: video.durationSec,
        })
      })
    )

    console.log(`Seeded ${SEED_USERS.length} users and ${SEED_POSTINGS.length} video postings.`)
  },

  async down(queryInterface, Sequelize) {
    const emails = SEED_USERS.map(u => u.email)

    // Find user IDs
    const users = await User.findAll({ where: { email: emails } })
    const userIds = users.map(u => u.id)

    // Find profile IDs
    const profiles = await Profile.findAll({ where: { userId: userIds } })
    const profileIds = profiles.map(p => p.id)

    // Delete in reverse dependency order
    await Posting.destroy({ where: { creatorId: profileIds } })
    await Profile.destroy({ where: { id: profileIds } })
    await User.destroy({ where: { id: userIds } })
  },
}
