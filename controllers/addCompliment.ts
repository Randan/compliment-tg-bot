import type { Message } from 'node-telegram-bot-api';
import { botHelpers, handleError, lib } from '../utils';
import { Compliments } from '../schemas';
import type { ICompliment } from '../interfaces';

const addCompliment = async (msg: Message): Promise<void> => {
  if (!msg.from) return;

  const { id } = msg.from;

  const complimentText: string = msg.text?.replace('/add', '').trim() || '';

  try {
    const compliment: ICompliment | null = await Compliments.findOne({
      value: complimentText,
    });

    if (compliment) {
      await botHelpers.sendMessageSafely(id, lib.complimentExists());
      return;
    }

    const addedComplimentResponse: ICompliment = await Compliments.create({
      value: complimentText,
    });

    if (addedComplimentResponse) {
      await botHelpers.sendMessageSafely(id, lib.complimentAccepted());
    }
  } catch (err: unknown) {
    handleError('Failed to add compliment', err);
  }
};

export default addCompliment;
