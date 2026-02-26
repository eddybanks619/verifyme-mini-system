const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: Number(process.env.PG_POOL_ACQUIRE_TIMEOUT_MS || 5000),
    idle: 10000
  },
  dialectOptions: {
    connectTimeout: Number(process.env.PG_CONNECT_TIMEOUT_MS || 5000)
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL (Billing Service)');
    // Sync models (in production, use migrations)
    await sequelize.sync(); 
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
