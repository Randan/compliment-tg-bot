import 'dotenv/config';

const appPort: string = process.env.PORT || '';
const dbUrl: string = process.env.DB_URL || '';
const dbComplimentsCollection: string = process.env.DB_COMPLIMENTS_COLLECTION || '';
const dbUsersCollection: string = process.env.DB_USERS_COLLECTION || '';
const timezone: string = process.env.TIMEZONE || '';
const adminId: string = process.env.ADMIN_TG_ID || '';
const unsplashUri: string = process.env.UNSPLASH_URI || '';
const unsplashAppToken: string = process.env.UNSPLASH_APP_TOKEN || '';

/**
 * Automatically encodes password in MongoDB URL if it contains special characters
 */
const encodePasswordInUrl = (url: string): string => {
  if (!url) return '';

  // Match mongodb+srv://username:password@host pattern
  const mongoUrlPattern = /^(mongodb\+srv:\/\/)([^:]+):([^@]+)@(.+)$/;
  const match = url.match(mongoUrlPattern);

  if (!match) {
    // If URL doesn't match pattern, return as is
    return url;
  }

  const [, protocol, username, password, rest] = match;

  // Check if password is already URL encoded (contains %)
  const isEncoded = password.includes('%');

  // Check if password contains special characters that need encoding
  const specialChars = /[@#%&+=\s]/;
  const needsEncoding = specialChars.test(password) && !isEncoded;

  if (needsEncoding) {
    // Encode the password
    const encodedPassword = encodeURIComponent(password);
    return `${protocol}${username}:${encodedPassword}@${rest}`;
  }

  // Return original URL if no encoding needed
  return url;
};

/**
 * Validates and constructs MongoDB connection URI
 * Handles URL encoding for passwords with special characters
 */
const buildMongoUri = (url: string): string => {
  if (!url) return '';

  // First, try to encode password if needed
  const urlWithEncodedPassword = encodePasswordInUrl(url);

  // If URL already contains query parameters
  const hasParams = urlWithEncodedPassword.includes('?');
  const separator = hasParams ? '&' : '?';

  // Add MongoDB connection options
  const options = 'retryWrites=true&w=majority';

  return `${urlWithEncodedPassword}${separator}${options}`;
};

const dbMongooseUri: string = buildMongoUri(dbUrl);

export {
  adminId,
  appPort,
  dbComplimentsCollection,
  dbMongooseUri,
  dbUrl,
  dbUsersCollection,
  timezone,
  unsplashAppToken,
  unsplashUri,
};
