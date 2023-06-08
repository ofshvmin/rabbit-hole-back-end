const { Posting, Profile } = require('../models')


async function index (req, res) {
  try {
    const postings = await Posting.findAll({
      // include: [{ model: Like, as: "likesReceived" }]
      include: { model: Profile, as: 'profile'}

    })
    res.status(200).json(postings)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

async function create (req, res) {
  try {
    req.body.creatorId = req.user.profile.id
    const posting = await Posting.create(req.body)
    console.log(posting.toJSON())
    res.status(201).json(posting)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

async function update (req, res) {
  try {
    const posting = await Posting.update(
      req.body,
      { where: {id: req.params.postingId}, returning: true }
    )
    res.status(200).json(posting)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

async function deletePosting (req, res) {
  try {
    const posting = await Posting.findByPk(req.params.postingId)
    await posting.destroy()
    res.status(200).json(posting)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

module.exports = {
  index,
  create,
  update,
  delete: deletePosting
}