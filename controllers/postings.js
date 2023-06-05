const { Posting } = require('../models')

async function create (req, res) {
  try {
    req.body.creatorId = req.user.profile.id
    const posting = await Posting.create(req.body)
    console.log(posting.toJSON())
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
    
  }
}

module.exports = {
  create,
}