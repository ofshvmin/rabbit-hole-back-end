'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Follows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      followerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'Profiles', key: 'id' },
      },
      followingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'Profiles', key: 'id' },
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    })
    await queryInterface.addIndex('Follows', ['followerId', 'followingId'], {
      unique: true,
      name: 'follows_followerId_followingId_unique',
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Follows')
  },
}
