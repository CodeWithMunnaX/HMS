// The dev fallback is public (it's in the repo), so it must never be used in production.
const DEV_FALLBACK_SECRET = 'carepulse_hms_jwt_secret_key_2026';

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return DEV_FALLBACK_SECRET;
};

module.exports = { getJwtSecret };
