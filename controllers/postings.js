const { Posting } = require('../models')

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

module.exports = {
  create,
  update,
}