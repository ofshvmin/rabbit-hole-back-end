'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      Profile.belongsTo(models.User, { foreignKey: 'userId' })
      Profile.hasMany(models.Posting, { foreignKey: 'creatorId', as: 'postingsMade' })
      Profile.hasMany(models.Like, { foreignKey: 'profileId', as: 'likesGiven' })
      Profile.hasMany(models.Comment, { foreignKey: 'profileId', as: 'commentsGiven' })
      Profile.hasMany(models.WatchEvent, { foreignKey: 'profileId', as: 'watchEvents' })
      Profile.hasMany(models.Follow, { foreignKey: 'followerId', as: 'following' })
      Profile.hasMany(models.Follow, { foreignKey: 'followingId', as: 'followers' })
    }
  }

  Profile.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photo: DataTypes.STRING,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      references: { model: 'Users', key: 'id' },
    },
  }, {
    sequelize,
    modelName: 'Profile',
  })

  return Profile
}
