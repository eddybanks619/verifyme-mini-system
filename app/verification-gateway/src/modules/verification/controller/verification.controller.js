const VerificationLog = require('../../../models/verification-log.model');
const { publishToQueue } = require('../../../config/rabbitmq');
const asyncHandler = require('../../../utils/asyncHandler');
const AppError = require('../../../utils/AppError');

exports.queueVerification = asyncHandler(async (req, res) => {
  const { type, id, mode, purpose } = req.body;
  const clientOrganization = req.clientOrganization;
  const idempotencyKey = req.headers['x-idempotency-key'];

  if (idempotencyKey) {
    const existingLog = await VerificationLog.findOne({ idempotencyKey });
    if (existingLog) {
      return res.status(200).json({
        status: existingLog.status,
        message: 'This request has already been processed. Returning existing status.',
        verificationId: existingLog._id,
        identity: existingLog.searchId,
      });
    }
  }

  const verificationLog = await VerificationLog.create({
    verificationType: type,
    searchId: id,
    status: 'PENDING',
    clientOrganizationId: clientOrganization._id,
    idempotencyKey: idempotencyKey,
  });


  const jobData = {
    logId: verificationLog._id,
    type,
    id,
    mode,
    purpose,
    clientOrganizationId: clientOrganization._id.toString(),
    idempotencyKey,
  };
  publishToQueue(jobData);


  res.status(202).json({
    status: 'PENDING',
    message: 'Verification request has been accepted and is being processed.',
    verificationId: verificationLog._id,
    identity: id,
  });
});

exports.getVerificationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const verification = await VerificationLog.findById(id);

  if (!verification) {
    throw new AppError('Verification record not found.', 404, 'NOT_FOUND');
  }

   if (verification.clientOrganizationId.toString() !== req.clientOrganization._id.toString()) {
     throw new AppError('You are not authorized to view this verification record.', 403, 'FORBIDDEN');
  }

  res.status(200).json({
    status: verification.status,
    verificationId: verification._id,
    data: verification.status === 'COMPLETED' ? verification.responsePayload : null,
    error: verification.status === 'FAILED' ? verification.errorMessage : null,
    createdAt: verification.createdAt,
    completedAt: verification.completedAt,
  });
});