const verificationService = require('../service/verification.service');
const asyncHandler = require('../../../utils/asyncHandler');
const AppError = require('../../../utils/AppError');

exports.handleGovProviderWebhook = asyncHandler(async (req, res) => {
  const { verificationId, status, data, error } = req.body;
  const signature = req.headers['x-gov-signature']; // Security: Verify sender

  // TODO: Verify signature from gov-provider to ensure authenticity
  // if (!verifySignature(req.body, signature)) {
  //   throw new AppError('Invalid webhook signature', 401, 'INVALID_SIGNATURE');
  // }

  console.log(`Received webhook for verification ${verificationId} with status ${status}`);

  if (!verificationId) {
    throw new AppError('Missing verificationId in webhook payload', 400, 'INVALID_PAYLOAD');
  }

  if (status === 'COMPLETED') {
    await verificationService.updateLog(verificationId, 'COMPLETED', data);
  } else if (status === 'FAILED') {
    await verificationService.updateLog(verificationId, 'FAILED', null, error);
    // Trigger refund logic here if needed, or handle it in a separate reconciliation process
    // For now, we assume the gov-provider didn't charge us if it failed, or we handle refunds async.
  }

  res.status(200).json({ status: 'success', message: 'Webhook received' });
});