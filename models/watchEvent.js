'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class WatchEvent extends Model {
    static associate(models) {
      WatchEvent.belongsTo(models.Profile, { foreignKey: 'profileId', as: 'watcher' })
      WatchEvent.belongsTo(models.Posting, { foreignKey: 'postingId', as: 'watchedPosting' })
    }
  }

  WatchEvent.init({
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
    watchTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'WatchEvent',
  })

  return WatchEvent
}
