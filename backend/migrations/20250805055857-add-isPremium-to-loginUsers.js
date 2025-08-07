export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('loginUsers', 'isPremium', {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('loginUsers', 'isPremium');
}
