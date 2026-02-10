const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_URI_GATEWAY, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL (Gateway Billing)');
    await sequelize.sync();
  } catch (error) {
    console.error('Gateway PostgreSQL connection error:', error);
  }
};

module.exports = { sequelize, connectDB };