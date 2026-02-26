'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WatchEvents', {
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
      watchTimeMs: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('WatchEvents')
  },
}
