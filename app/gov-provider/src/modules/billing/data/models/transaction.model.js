const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');
const Wallet = require('./wallet.model');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  walletId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Wallet,
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  balanceBefore: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING, // External ref (e.g., payment gateway ID) or Internal Request ID
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('SUCCESS', 'FAILED', 'PENDING'),
    defaultValue: 'SUCCESS'
  }
}, {
  timestamps: true
});
// Associations
Wallet.hasMany(Transaction, { foreignKey: 'walletId' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId' });

module.exports = Transaction;