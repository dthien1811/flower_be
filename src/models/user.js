'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // RBAC basic
      User.belongsTo(models.Group, { foreignKey: 'groupId', as: 'group' });

      // Project mapping
      User.belongsToMany(models.Project, {
        through: models.ProjectUser,      // dùng model join, không dùng string
        foreignKey: 'userId',
        otherKey: 'projectId',
        as: 'projects',
      });
    }
  }

  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    address: DataTypes.STRING,
    sex: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      defaultValue: 'male'
    },
    phone: {
      type: DataTypes.STRING,
      validate: { is: /^[0-9]{10,11}$/ }
    },
    groupId: {
      type: DataTypes.INTEGER,
      references: { model: 'Group', key: 'id' }
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: 'default-avatar.png'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    lastLogin: DataTypes.DATE,
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'User',
    timestamps: true
  });

  return User;
};
