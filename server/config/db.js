const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false, // Set to console.log to see SQL queries
  }
);

const connectDB = async () => {
  try {
    // We can also create the database here if it doesn't exist using mysql2 directly
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS || '',
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.end();

    await sequelize.authenticate();
    console.log(`MySQL Connected: ${process.env.DB_HOST}`);
    
    // Only sync schema in development or when explicitly requested
    if (process.env.SYNC_DB === 'true') {
      await sequelize.sync({ alter: true });
      console.log('Database synchronized.');
    }
  } catch (error) {
    console.error(`Error connecting to MySQL: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
