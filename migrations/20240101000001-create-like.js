'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Likes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      profileId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'Profiles', key: 'id' },
      },
      postingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'Postings', key: 'id' },
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    })
    await queryInterface.addIndex('Likes', ['profileId', 'postingId'], {
      unique: true,
      name: 'likes_profileId_postingId_unique',
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Likes')
  },
}
