export async function up(queryInterface, Sequelize) {
  await queryInterface.removeColumn('expenses', 'note');
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.addColumn('expenses', 'note', {
    type: Sequelize.STRING,
    allowNull: true
  });
}
