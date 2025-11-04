export default (sequelize, DataTypes) => {
  const MedicationMatch = sequelize.define('MedicationMatch', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    request_id: { type: DataTypes.BIGINT, allowNull: false },
    listing_id: { type: DataTypes.BIGINT, allowNull: false },
    matched_by_user_id: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    status: { 
      type: DataTypes.ENUM('proposed', 'accepted', 'delivered', 'cancelled'),
      defaultValue: 'proposed'
    },
  }, {
    tableName: 'medication_matches',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  MedicationMatch.associate = (models) => {
    MedicationMatch.belongsTo(models.MedicationRequest, { foreignKey: 'request_id', as: 'request' });
    MedicationMatch.belongsTo(models.MedicationListing, { foreignKey: 'listing_id', as: 'listing' });
    MedicationMatch.belongsTo(models.User, { foreignKey: 'matched_by_user_id', as: 'matcher' });
  };

  return MedicationMatch;
};
