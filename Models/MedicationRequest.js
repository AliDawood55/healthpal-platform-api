export default (sequelize, DataTypes) => {
  const MedicationRequest = sequelize.define('MedicationRequest', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    patient_id: { type: DataTypes.INTEGER, allowNull: false },
    medication_name: { type: DataTypes.STRING(200), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    status: { type: DataTypes.ENUM('pending', 'fulfilled'), defaultValue: 'pending' },
    needed_by: { type: DataTypes.DATE },
  }, {
    tableName: 'medication_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  MedicationRequest.associate = (models) => {
    MedicationRequest.belongsTo(models.User, { foreignKey: 'patient_id', as: 'patient' });
    MedicationRequest.hasMany(models.MedicationMatch, { foreignKey: 'request_id', as: 'matches' });
  };

  return MedicationRequest;
};
