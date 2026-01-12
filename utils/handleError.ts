import { adminId, notifyAdmin } from './';

interface ErrorDetails {
  message: string;
  stack?: string;
  code?: string | number;
  name?: string;
  [key: string]: unknown;
}

const formatError = (err: unknown): ErrorDetails => {
  if (err instanceof Error) {
    return {
      message: err.message,
      stack: err.stack,
      name: err.name,
    };
  }

  if (typeof err === 'object' && err !== null) {
    const errorObj = err as Record<string, unknown>;
    return {
      message: String(errorObj.message || 'Unknown error'),
      ...errorObj,
    };
  }

  return {
    message: String(err),
  };
};

const createErrorNotification = (userMessage: string, error: unknown): string => {
  const errorDetails = formatError(error);
  const timestamp = new Date().toISOString();

  let notification = `🚨 *Error occurred*\n\n`;
  notification += `*Time:* ${timestamp}\n`;
  notification += `*Message:* ${userMessage}\n\n`;

  if (errorDetails.name) {
    notification += `*Error Type:* ${errorDetails.name}\n`;
  }

  if (errorDetails.code) {
    notification += `*Error Code:* ${errorDetails.code}\n`;
  }

  if (errorDetails.message) {
    notification += `*Details:* ${errorDetails.message}\n`;
  }

  if (errorDetails.stack && adminId) {
    notification += `\n*Stack Trace:*\n\`\`\`\n${errorDetails.stack.substring(0, 1000)}\n\`\`\``;
  }

  return notification;
};

const handleError = (message: string, error?: unknown): void => {
  console.error('❌ Error:', message);
  if (error) {
    console.error('Error details:', error);
  }

  const notification = createErrorNotification(message, error || message);
  notifyAdmin(notification);
};

export default handleError;
