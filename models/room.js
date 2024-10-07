'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Room.init({
    no_perkara: DataTypes.STRING,
    meeting_type: DataTypes.INTEGER,
    room_id: DataTypes.STRING,
    face_recognition: DataTypes.BOOLEAN,
    password: DataTypes.STRING,
    room_name: DataTypes.STRING,
    reference_room_id: DataTypes.STRING,
    max_participants: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    status: DataTypes.INTEGER,
    location: DataTypes.STRING,
    last_updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
    created_by: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Room',
  });
  return Room;
};