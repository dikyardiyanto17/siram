'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Recording extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Recording.init({
    recording_id: DataTypes.STRING,
    room_id: DataTypes.STRING,
    recorded_by: DataTypes.STRING,
    recording_url: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    last_updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
    created_by: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Recording',
    tableName: 'recordings', 
    timestamps: false,
  });
  return Recording;
};