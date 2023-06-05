'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Posting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Posting.belongsTo(models.Profile, {foreignKey: 'creatorId'})
    }
  }
  Posting.init({
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'Profiles',
        key: 'id',
      },
},
    numOfLikes: {
      type: DataTypes.INTEGER,
    },

    text: {
      type: DataTypes.STRING,
},
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Posting',
  });
  return Posting;
};