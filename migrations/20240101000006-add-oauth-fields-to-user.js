'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn('Users', 'provider', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'local',
    })
    await queryInterface.addColumn('Users', 'providerId', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.sequelize.query(
      `CREATE UNIQUE INDEX users_provider_provider_id_unique
       ON "Users" (provider, "providerId")
       WHERE "providerId" IS NOT NULL`
    )
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS users_provider_provider_id_unique`
    )
    await queryInterface.removeColumn('Users', 'providerId')
    await queryInterface.removeColumn('Users', 'provider')
    await queryInterface.changeColumn('Users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    })
  },
}
