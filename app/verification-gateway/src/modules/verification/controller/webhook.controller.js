const verificationService = require('../service/verification.service');
const asyncHandler = require('../../../utils/asyncHandler');
const AppError = require('../../../utils/AppError');
const { verifyWebhookSignature } = require('../../../utils/hmac.util');

exports.handleGovProviderWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-gov-signature'];

  if (!verifyWebhookSignature(req.body, signature)) {
    throw new AppError('Invalid webhook signature', 401, 'INVALID_SIGNATURE');
  }

  const { verificationId } = req.body;
  if (!verificationId) {
    throw new AppError('Missing verificationId in webhook payload', 400, 'INVALID_PAYLOAD');
  }

  console.log(`Received webhook for verification ${verificationId}`);

  await verificationService.handleWebhook(req.body);

  res.status(200).json({ status: 'success', message: 'Webhook processed' });
});