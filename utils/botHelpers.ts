import type { ParseMode } from 'node-telegram-bot-api';
import bot from '../bot';
import { Users } from '../schemas';

/**
 * Checks if bot is blocked by user
 * Returns true if blocked, false otherwise
 */
export const isBotBlocked = async (telegramId: number): Promise<boolean> => {
  try {
    await bot.getChat(telegramId);
    return false;
  } catch (err: unknown) {
    const error = err as { response?: { body?: { error_code?: number; description?: string } } };
    const errorCode = error.response?.body?.error_code;
    const errorDescription = error.response?.body?.description?.toLowerCase() || '';

    // Error codes that indicate bot is blocked:
    // 403 - Forbidden (bot blocked by user)
    // 400 - Bad Request (chat not found, user deleted account, etc.)
    const isBlocked =
      errorCode === 403 ||
      errorCode === 400 ||
      errorDescription.includes('blocked') ||
      errorDescription.includes('chat not found') ||
      errorDescription.includes('user is deactivated');

    return isBlocked;
  }
};

/**
 * Sends message to user and handles blocked bot errors
 * @param telegramId - User's Telegram ID
 * @param message - Message to send
 * @param options - Additional options (parse_mode, removeOnBlock)
 * @returns true if message was sent successfully, false if bot is blocked
 */
export const sendMessageSafely = async (
  telegramId: number,
  message: string,
  options?: { parse_mode?: ParseMode; removeOnBlock?: boolean },
): Promise<boolean> => {
  const removeOnBlock = options?.removeOnBlock ?? false;
  const sendOptions = options?.parse_mode ? { parse_mode: options.parse_mode } : undefined;

  try {
    await bot.sendMessage(telegramId, message, sendOptions);
    return true;
  } catch (err: unknown) {
    const error = err as { response?: { body?: { error_code?: number; description?: string } } };
    const errorCode = error.response?.body?.error_code;
    const errorDescription = error.response?.body?.description?.toLowerCase() || '';

    const isBlocked =
      errorCode === 403 ||
      errorCode === 400 ||
      errorDescription.includes('blocked') ||
      errorDescription.includes('chat not found') ||
      errorDescription.includes('user is deactivated');

    if (isBlocked) {
      if (removeOnBlock) {
        // Remove blocked user from database
        await Users.findOneAndDelete({ telegramId });
        console.log(`⚠️ User ${telegramId} blocked the bot, removed from database`);
      } else {
        console.log(`⚠️ User ${telegramId} blocked the bot (not removed from database)`);
      }
      return false;
    }

    // Re-throw other errors
    throw err;
  }
};

/**
 * Sends photo to user and handles blocked bot errors
 * @param telegramId - User's Telegram ID
 * @param photo - Photo URL or file ID
 * @param options - Additional options (caption, removeOnBlock)
 * @returns true if photo was sent successfully, false if bot is blocked
 */
export const sendPhotoSafely = async (
  telegramId: number,
  photo: string,
  options?: { caption?: string; removeOnBlock?: boolean },
): Promise<boolean> => {
  const removeOnBlock = options?.removeOnBlock ?? false;
  const sendOptions = options?.caption ? { caption: options.caption } : undefined;

  try {
    await bot.sendPhoto(telegramId, photo, sendOptions);
    return true;
  } catch (err: unknown) {
    const error = err as { response?: { body?: { error_code?: number; description?: string } } };
    const errorCode = error.response?.body?.error_code;
    const errorDescription = error.response?.body?.description?.toLowerCase() || '';

    const isBlocked =
      errorCode === 403 ||
      errorCode === 400 ||
      errorDescription.includes('blocked') ||
      errorDescription.includes('chat not found') ||
      errorDescription.includes('user is deactivated');

    if (isBlocked) {
      if (removeOnBlock) {
        // Remove blocked user from database
        await Users.findOneAndDelete({ telegramId });
        console.log(`⚠️ User ${telegramId} blocked the bot, removed from database`);
      } else {
        console.log(`⚠️ User ${telegramId} blocked the bot (not removed from database)`);
      }
      return false;
    }

    // Re-throw other errors
    throw err;
  }
};
