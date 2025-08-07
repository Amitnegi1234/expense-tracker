export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('expenses', 'note', {
    type: Sequelize.STRING,
    allowNull: true
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('expenses', 'note');
}

