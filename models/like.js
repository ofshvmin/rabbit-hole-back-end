'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.Profile, { foreignKey: 'profileId', as: 'liker' })
      Like.belongsTo(models.Posting, { foreignKey: 'postingId', as: 'likedPosting' })
    }
  }

  Like.init({
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
  }, {
    sequelize,
    modelName: 'Like',
    indexes: [{ unique: true, fields: ['profileId', 'postingId'] }],
  })

  return Like
}
