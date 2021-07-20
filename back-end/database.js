const {Sequelize, Model, DataTypes, Op} = require('sequelize');

const sequelize = new Sequelize(
  'vacation', 
  process.env.DB_USER, 
  process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

class Admin extends Model {} // Admin table
Admin.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  username: DataTypes.STRING,
  password: DataTypes.STRING,
  token: DataTypes.STRING
}, { sequelize, modelName: 'admin' });

class Vacation extends Model {} // Vacations table
Vacation.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  destination: DataTypes.STRING,
  description: DataTypes.STRING,
  image: DataTypes.STRING,
  from: DataTypes.STRING,
  until: DataTypes.STRING,
  price: DataTypes.INTEGER
}, { sequelize, modelName: 'vacation' });

class User extends Model {} // Users table
User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  username: DataTypes.STRING,
  password: DataTypes.STRING,
  token: DataTypes.STRING
}, { sequelize, modelName: 'user' });

class Follower extends Model {} // Followers table hhh
Follower.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
}, { sequelize, modelName: 'follower' });

User.belongsToMany(Vacation, { 
  through: Follower
});
Vacation.belongsToMany(User, { 
  through: Follower
});

module.exports = {Admin, User, Vacation, Follower, Op, sequelize, Model, DataTypes,};