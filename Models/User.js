export default (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
		name: { type: DataTypes.STRING(150) },
		email: { type: DataTypes.STRING(200), unique: true },
		password: { type: DataTypes.STRING(255) },
	}, {
		tableName: 'users',
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	});

	User.associate = (models) => {
		User.hasMany(models.MedicationRequest, { foreignKey: 'patient_id', as: 'requests' });
		User.hasMany(models.MedicationListing, { foreignKey: 'listed_by_user_id', as: 'listings' });
		User.hasMany(models.MedicationMatch, { foreignKey: 'matched_by_user_id', as: 'matches' });
	};

	return User;
};
