const { User, Profile, sequelize } = require('../models')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { OAuth2Client } = require('google-auth-library')
const appleSignin = require('apple-signin-auth')

async function signup(req, res) {
  try {
    if (!process.env.SECRET) throw new Error('no SECRET in back-end .env')

    const user = await User.findOne({ where: { email: req.body.email } })
    if (user) throw new Error('Account already exists')

    const newUser = await User.create(req.body)
    req.body.userId = newUser.id
    const newProfile = await Profile.create(req.body)
    newUser.dataValues.profile = { id: newProfile.dataValues.id }

    const token = createJWT(newUser)
    res.status(200).json({ token })
  } catch (err) {
    console.log(err)
    try {
      if (req.body.userId) {
        await User.destroy({ where: { id: req.body.userId } })
      }
    } catch (err) {
      return res.status(500).json({ err: err.message })
    }
    res.status(500).json({ err: err.message })
  }
}

async function login(req, res) {
  try {
    if (!process.env.SECRET) throw new Error('no SECRET in back-end .env')

    const user = await User.findOne({
      where: { email: req.body.email },
      include: { model: Profile, as: 'profile', attributes: ['id'] },
    })
    if (!user) throw new Error('User not found')

    const isMatch = await user.comparePassword(req.body.password)
    if (!isMatch) throw new Error('Incorrect password')

    const token = createJWT(user)
    res.json({ token })
  } catch (err) {
    handleAuthError(err, res)
  }
}

async function changePassword(req, res) {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) throw new Error('User not found')

    const isMatch = user.comparePassword(req.body.curPassword)
    if (!isMatch) throw new Error('Incorrect password')

    user.password = req.body.newPassword
    await user.save()

    const token = createJWT(user)
    res.json({ token })
  } catch (err) {
    handleAuthError(err, res)
  }
}

// /* --== Helper Functions ==-- */

function handleAuthError(err, res) {
  console.log(err)
  const { message } = err
  if (message === 'User not found' || message === 'Incorrect password') {
    res.status(401).json({ err: message })
  } else {
    res.status(500).json({ err: message })
  }
}

function createJWT(user) {
  return jwt.sign({ user }, process.env.SECRET, { expiresIn: '24h' })
}

async function googleAuth(req, res) {
  try {
    const { idToken } = req.body
    if (!idToken) return res.status(400).json({ err: 'idToken required' })

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    const { sub: providerId, email, name } = payload

    const user = await oauthFindOrCreate({ provider: 'google', providerId, email, name })
    const token = createJWT(user)
    res.json({ token })
  } catch (err) {
    handleAuthError(err, res)
  }
}

async function appleAuth(req, res) {
  try {
    const { identityToken, fullName } = req.body
    if (!identityToken) return res.status(400).json({ err: 'identityToken required' })

    const payload = await appleSignin.verifyIdToken(identityToken, {
      audience: process.env.APPLE_CLIENT_ID,
      ignoreExpiration: false,
    })
    const { sub: providerId, email } = payload
    const name = fullName
      ? [fullName.givenName, fullName.familyName].filter(Boolean).join(' ')
      : email

    const user = await oauthFindOrCreate({ provider: 'apple', providerId, email, name })
    const token = createJWT(user)
    res.json({ token })
  } catch (err) {
    handleAuthError(err, res)
  }
}

async function facebookAuth(req, res) {
  try {
    const { accessToken } = req.body
    if (!accessToken) return res.status(400).json({ err: 'accessToken required' })

    const appsecretProof = crypto
      .createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
      .update(accessToken)
      .digest('hex')

    const fbRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}&appsecret_proof=${appsecretProof}`
    )
    if (!fbRes.ok) throw new Error('Facebook token verification failed')
    const { id: providerId, name, email } = await fbRes.json()

    const resolvedEmail = email || `fb_${providerId}@placeholder.invalid`

    const user = await oauthFindOrCreate({ provider: 'facebook', providerId, email: resolvedEmail, name })
    const token = createJWT(user)
    res.json({ token })
  } catch (err) {
    handleAuthError(err, res)
  }
}

async function oauthFindOrCreate({ provider, providerId, email, name }) {
  // 1. Existing OAuth account
  let user = await User.findOne({
    where: { provider, providerId },
    include: { model: Profile, as: 'profile', attributes: ['id'] },
  })
  if (user) return user

  // 2. Existing local account with same email → link OAuth to it
  user = await User.findOne({
    where: { email },
    include: { model: Profile, as: 'profile', attributes: ['id'] },
  })
  if (user) {
    if (!user.providerId) {
      await user.update({ provider, providerId })
    }
    return user
  }

  // 3. New user
  return await sequelize.transaction(async (t) => {
    const newUser = await User.create(
      { name, email, provider, providerId },
      { transaction: t, hooks: false }
    )
    const newProfile = await Profile.create(
      { userId: newUser.id, name },
      { transaction: t }
    )
    newUser.dataValues.profile = { id: newProfile.id }
    return newUser
  })
}

module.exports = { signup, login, changePassword, googleAuth, appleAuth, facebookAuth }
