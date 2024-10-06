"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
	class Participant extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	Participant.init(
		{
			participant_id: DataTypes.STRING,
			user_id: DataTypes.STRING,
			role: DataTypes.STRING,
			exception: DataTypes.INTEGER,
			status: DataTypes.INTEGER,
			last_updated_at: DataTypes.DATE,
			deleted_at: DataTypes.DATE,
			created_by: DataTypes.STRING,
			photo: DataTypes.BLOB,
			photo_path: DataTypes.STRING,
			full_name: DataTypes.STRING,
			nik: DataTypes.STRING,
			nrp: DataTypes.STRING,
			authority: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "Participant",
		}
	)
	return Participant
}
