'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Follow extends Model {
    static associate(models) {
      Follow.belongsTo(models.Profile, { foreignKey: 'followerId', as: 'follower' })
      Follow.belongsTo(models.Profile, { foreignKey: 'followingId', as: 'following' })
    }
  }

  Follow.init({
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      references: { model: 'Profiles', key: 'id' },
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      references: { model: 'Profiles', key: 'id' },
    },
  }, {
    sequelize,
    modelName: 'Follow',
    indexes: [{ unique: true, fields: ['followerId', 'followingId'] }],
  })

  return Follow
}
