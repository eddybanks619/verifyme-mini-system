const { sequelize } = require('../../../config/database');
const { redisClient } = require('../../../config/redis');
const Wallet = require('../data/models/wallet.model');
const Transaction = require('../data/models/transaction.model');
const PRICING = require('../../../config/pricing');

const GATEWAY_SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000';

class BillingService {
  
  async getBalance(organizationId) {
    const wallet = await Wallet.findOne({ where: { organizationId } });
    if (!wallet) {
      const error = new Error('Wallet not found for this organization.');
      error.code = 'BILLING404';
      throw error;
    }
    return wallet.balance;
  }

  async fundWallet(organizationId, amount, reference) {
    if (amount <= 0) {
      const error = new Error('Funding amount must be positive.');
      error.code = 'BILLING400';
      throw error;
    }

    const t = await sequelize.transaction();
    try {
      const wallet = await Wallet.findOne({ where: { organizationId }, transaction: t, lock: t.LOCK.UPDATE });
      if (!wallet) {
        const error = new Error('Wallet not found for this organization.');
        error.code = 'BILLING404';
        throw error;
      }

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
      const cachedResult = await redisClient.get(`gateway:billing:${idempotencyKey}`);
      if (cachedResult) return JSON.parse(cachedResult);
    }

    const cost = PRICING[serviceType];
    if (!cost) {
      return { success: false, error: 'INVALID_SERVICE', message: `Unknown service type: ${serviceType}` };
    }

    const t = await sequelize.transaction();
    try {
      const clientWallet = await Wallet.findOne({ where: { organizationId }, transaction: t, lock: t.LOCK.UPDATE });
      
      if (!clientWallet) {
        return { success: false, error: 'WALLET_NOT_FOUND', message: 'Client wallet does not exist.' };
      }
      if (clientWallet.status === 'SUSPENDED') {
        return { success: false, error: 'WALLET_SUSPENDED', message: 'Client wallet is suspended.' };
      }

      const systemWallet = await Wallet.findOne({ where: { organizationId: GATEWAY_SYSTEM_ORG_ID }, transaction: t, lock: t.LOCK.UPDATE });
      if (!systemWallet) throw new Error('Gateway system revenue wallet not found. Critical error.');

      if (Number(clientWallet.balance) < cost) {
        return { success: false, error: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds for this transaction.' };
      }

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
        await redisClient.set(`gateway:billing:${idempotencyKey}`, JSON.stringify(result), { EX: 86400 });
      }
      return result;

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getHistory(organizationId, page = 1, limit = 20) {
    const wallet = await Wallet.findOne({ where: { organizationId } });
    if (!wallet) {
      const error = new Error('Wallet not found for this organization.');
      error.code = 'BILLING404';
      throw error;
    }

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