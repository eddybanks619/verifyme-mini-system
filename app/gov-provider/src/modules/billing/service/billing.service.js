const { sequelize } = require('../../../config/database');
const { redisClient } = require('../../../config/redis');
const Wallet = require('./models/wallet.model');
const Transaction = require('./models/transaction.model');
const PRICING = require('../../../config/pricing');

const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';

class BillingService {
  
  async findOrCreateWallet(organizationId) {
    const [wallet, created] = await Wallet.findOrCreate({
      where: { organizationId },
      defaults: { organizationId }
    });
    return { wallet, created };
  }

  async getBalance(organizationId) {
    const wallet = await Wallet.findOne({ where: { organizationId } });
    if (!wallet) throw new Error('Wallet not found');
    return wallet.balance;
  }

  async fundWallet(organizationId, amount, reference) {
    const t = await sequelize.transaction();
    try {
      const wallet = await Wallet.findOne({ where: { organizationId }, transaction: t, lock: t.LOCK.UPDATE });
      if (!wallet) throw new Error('Wallet not found');

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + Number(amount);

      await wallet.update({ balance: balanceAfter }, { transaction: t });

      await Transaction.create({
        walletId: wallet.id,
        type: 'CREDIT',
        amount,
        balanceBefore,
        balanceAfter,
        description: 'Wallet Funding',
        reference,
        status: 'SUCCESS'
      }, { transaction: t });

      await t.commit();
      return { newBalance: balanceAfter };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async chargeWallet(organizationId, serviceType, idempotencyKey) {
    if (idempotencyKey) {
      const cachedResult = await redisClient.get(`billing:${idempotencyKey}`);
      if (cachedResult) return JSON.parse(cachedResult);
    }

    const cost = PRICING[serviceType];
    if (!cost) throw new Error(`Unknown service type: ${serviceType}`);

    const t = await sequelize.transaction();
    try {
      // Lock both wallets to prevent race conditions
      const clientWallet = await Wallet.findOne({ where: { organizationId }, transaction: t, lock: t.LOCK.UPDATE });
      const systemWallet = await Wallet.findOne({ where: { organizationId: SYSTEM_ORG_ID }, transaction: t, lock: t.LOCK.UPDATE });

      if (!clientWallet || !systemWallet) throw new Error('Wallet not found');
      if (Number(clientWallet.balance) < cost) throw new Error('INSUFFICIENT_FUNDS');

      // Debit Client
      const clientBalanceBefore = Number(clientWallet.balance);
      const clientBalanceAfter = clientBalanceBefore - cost;
      await clientWallet.update({ balance: clientBalanceAfter }, { transaction: t });
      await Transaction.create({
        walletId: clientWallet.id,
        type: 'DEBIT',
        amount: cost,
        balanceBefore: clientBalanceBefore,
        balanceAfter: clientBalanceAfter,
        description: `${serviceType} Verification`,
        reference: idempotencyKey,
      }, { transaction: t });

      // Credit System
      const systemBalanceBefore = Number(systemWallet.balance);
      const systemBalanceAfter = systemBalanceBefore + cost;
      await systemWallet.update({ balance: systemBalanceAfter }, { transaction: t });
      await Transaction.create({
        walletId: systemWallet.id,
        type: 'CREDIT',
        amount: cost,
        balanceBefore: systemBalanceBefore,
        balanceAfter: systemBalanceAfter,
        description: `Revenue from ${serviceType} - Org: ${organizationId}`,
        reference: idempotencyKey,
      }, { transaction: t });

      await t.commit();

      const result = { success: true, cost, newBalance: clientBalanceAfter };
      if (idempotencyKey) {
        await redisClient.set(`billing:${idempotencyKey}`, JSON.stringify(result), { EX: 86400 });
      }
      return result;

    } catch (error) {
      await t.rollback();
      if (error.message === 'INSUFFICIENT_FUNDS') {
        return { success: false, error: 'INSUFFICIENT_FUNDS' };
      }
      throw error;
    }
  }

  async getHistory(organizationId, page = 1, limit = 20) {
    const wallet = await Wallet.findOne({ where: { organizationId } });
    if (!wallet) throw new Error('Wallet not found');

    const offset = (page - 1) * limit;
    const { count, rows } = await Transaction.findAndCountAll({
      where: { walletId: wallet.id },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      total: count,
      page,
      pages: Math.ceil(count / limit),
      transactions: rows
    };
  }
}

module.exports = new BillingService();