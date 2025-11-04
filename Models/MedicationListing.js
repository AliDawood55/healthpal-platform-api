export default (sequelize, DataTypes) => {
  const MedicationListing = sequelize.define('MedicationListing', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    listed_by_user_id: { type: DataTypes.INTEGER, allowNull: false },
    medication_name: { type: DataTypes.STRING(200), allowNull: false },
    dosage: { type: DataTypes.STRING(100) },
    available_quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    expires_on: { type: DataTypes.DATE },
  }, {
    tableName: 'medication_listings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  MedicationListing.associate = (models) => {
    MedicationListing.belongsTo(models.User, { foreignKey: 'listed_by_user_id', as: 'lister' });
    MedicationListing.hasMany(models.MedicationMatch, { foreignKey: 'listing_id', as: 'matches' });
  };

  return MedicationListing;
};
