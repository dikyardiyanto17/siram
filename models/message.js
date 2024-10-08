'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Message.init({
    message_id: DataTypes.STRING,
    participant_id: DataTypes.STRING,
    message_text: DataTypes.STRING,
    room_id: DataTypes.STRING,
    sent_at: DataTypes.DATE,
    status: DataTypes.INTEGER,
    last_updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
    created_by: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};