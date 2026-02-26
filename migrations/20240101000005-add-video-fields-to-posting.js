'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Postings', 'mediaUrl', { type: Sequelize.STRING })
    await queryInterface.addColumn('Postings', 'thumbnailUrl', { type: Sequelize.STRING })
    await queryInterface.addColumn('Postings', 'durationSec', { type: Sequelize.INTEGER })
    await queryInterface.addColumn('Postings', 'tags', {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      defaultValue: [],
    })
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('Postings', 'mediaUrl')
    await queryInterface.removeColumn('Postings', 'thumbnailUrl')
    await queryInterface.removeColumn('Postings', 'durationSec')
    await queryInterface.removeColumn('Postings', 'tags')
  },
}
