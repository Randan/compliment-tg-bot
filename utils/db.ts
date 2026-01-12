import mongoose from 'mongoose';
import { dbMongooseUri, dbUrl } from './envVars';
import { handleError } from './';

const parseMongoUrl = (url: string): { username?: string; host?: string } => {
  try {
    const match = url.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@(.+)/);
    if (match) {
      return {
        username: match[1],
        host: match[3].split('/')[0],
      };
    }
  } catch {
    // Ignore parsing errors
  }
  return {};
};

const connectDB = async (): Promise<void> => {
  try {
    if (!dbUrl) {
      throw new Error('DB_URL is not defined in environment variables');
    }

    if (!dbMongooseUri) {
      throw new Error('Failed to construct MongoDB connection URI');
    }

    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return;
    }

    // Set up event listeners before connecting
    mongoose.connection.on('error', err => {
      handleError(`MongoDB connection error: ${err.message}`, err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    await mongoose.connect(dbMongooseUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    console.log('✅ MongoDB connected successfully');
  } catch (err: unknown) {
    const mongoError = err as { code?: number; codeName?: string; message?: string };
    const isAuthError =
      mongoError.code === 8000 ||
      mongoError.codeName === 'AtlasError' ||
      mongoError.message?.toLowerCase().includes('auth');

    let errorMessage = 'Failed to connect to MongoDB';

    if (isAuthError) {
      const urlInfo = parseMongoUrl(dbUrl);
      errorMessage =
        `MongoDB authentication failed. Please check:\n` +
        `1. Username and password in DB_URL are correct\n` +
        `2. Password contains special characters that need URL encoding (use encodeURIComponent)\n` +
        `3. Database user has proper permissions\n` +
        `4. IP address is whitelisted in MongoDB Atlas\n` +
        (urlInfo.username ? `\nDetected username: ${urlInfo.username}` : '') +
        (urlInfo.host ? `\nDetected host: ${urlInfo.host}` : '');
    } else if (err instanceof Error) {
      errorMessage = `Failed to connect to MongoDB: ${err.message}`;
    }

    // Log detailed error information
    console.error('❌ MongoDB connection failed:', {
      error: errorMessage,
      code: mongoError.code,
      codeName: mongoError.codeName,
      hasDbUrl: !!dbUrl,
      dbUrlLength: dbUrl?.length || 0,
      dbUrlPreview: dbUrl ? `${dbUrl.substring(0, 30)}...` : 'N/A',
    });

    handleError(errorMessage, err);
    throw err;
  }
};

export default connectDB;
