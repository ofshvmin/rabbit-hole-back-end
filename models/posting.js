'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Posting extends Model {
    static associate(models) {
      Posting.belongsTo(models.Profile, { foreignKey: 'creatorId', as: 'profile' })
      Posting.hasMany(models.Like, { foreignKey: 'postingId', as: 'likes' })
      Posting.hasMany(models.Comment, { foreignKey: 'postingId', as: 'comments' })
      Posting.hasMany(models.WatchEvent, { foreignKey: 'postingId', as: 'watchEvents' })
    }
  }

  Posting.init({
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      references: { model: 'Profiles', key: 'id' },
    },
    numOfLikes: {
      type: DataTypes.INTEGER,
    },
    text: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    mediaUrl: {
      type: DataTypes.STRING,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
    },
    durationSec: {
      type: DataTypes.INTEGER,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
  }, {
    sequelize,
    modelName: 'Posting',
  })

  return Posting
}
