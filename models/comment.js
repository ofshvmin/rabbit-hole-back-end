'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.Profile, { foreignKey: 'profileId', as: 'commenter' })
      Comment.belongsTo(models.Posting, { foreignKey: 'postingId', as: 'commentedPosting' })
    }
  }

  Comment.init({
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      references: { model: 'Profiles', key: 'id' },
    },
    postingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      references: { model: 'Postings', key: 'id' },
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: { args: [1, 2000], msg: 'Comment must be between 1 and 2000 characters' },
      },
    },
  }, {
    sequelize,
    modelName: 'Comment',
  })

  return Comment
}
