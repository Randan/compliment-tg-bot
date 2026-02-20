export interface EnvConfig {
  BOT_TOKEN: string;
  PORT: number;
  NODE_ENV: string;
  ADMIN_TELEGRAM_ID?: string;
  DB_URL: string;
  DB_COMPLIMENTS_COLLECTION: string;
  DB_USERS_COLLECTION: string;
  TIMEZONE: string;
  UNSPLASH_URI: string;
  UNSPLASH_ACCESS_KEY: string;
}

function get(config: Record<string, unknown>, key: string): string | undefined {
  const v = config[key];
  return v === undefined ? undefined : String(v).trim() || undefined;
}

function requireKey(config: Record<string, unknown>, key: string): string {
  const value = get(config, key);
  if (value === undefined || value === '') {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
}

function encodePasswordInUrl(url: string): string {
  if (!url) return '';
  const mongoUrlPattern = /^(mongodb\+srv:\/\/)([^:]+):([^@]+)@(.+)$/;
  const match = url.match(mongoUrlPattern);
  if (!match) return url;
  const [, protocol, username, password, rest] = match;
  const isEncoded = password.includes('%');
  const specialChars = /[@#%&+=\s]/;
  const needsEncoding = specialChars.test(password) && !isEncoded;
  if (needsEncoding) {
    return `${protocol}${username}:${encodeURIComponent(password)}@${rest}`;
  }
  return url;
}

function buildMongoUri(url: string): string {
  if (!url) return '';
  const urlWithEncodedPassword = encodePasswordInUrl(url);
  const hasParams = urlWithEncodedPassword.includes('?');
  const separator = hasParams ? '&' : '?';
  const options = 'retryWrites=true&w=majority';
  return `${urlWithEncodedPassword}${separator}${options}`;
}

export function configValidationSchema(
  config: Record<string, unknown>,
): EnvConfig {
  const port = Number(get(config, 'PORT'));
  const portFinal = Number.isNaN(port) || port <= 0 ? 3000 : port;

  const dbUrl = requireKey(config, 'DB_URL');
  const dbMongooseUri = buildMongoUri(dbUrl);

  return {
    BOT_TOKEN: requireKey(config, 'BOT_TOKEN'),
    PORT: portFinal,
    NODE_ENV: get(config, 'NODE_ENV') || 'production',
    ADMIN_TELEGRAM_ID: get(config, 'ADMIN_TELEGRAM_ID'),
    DB_URL: dbMongooseUri,
    DB_COMPLIMENTS_COLLECTION: requireKey(config, 'DB_COMPLIMENTS_COLLECTION'),
    DB_USERS_COLLECTION: requireKey(config, 'DB_USERS_COLLECTION'),
    TIMEZONE: requireKey(config, 'TIMEZONE'),
    UNSPLASH_URI: requireKey(config, 'UNSPLASH_URI'),
    UNSPLASH_ACCESS_KEY: requireKey(config, 'UNSPLASH_ACCESS_KEY'),
  };
}
