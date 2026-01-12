import type { Message } from 'node-telegram-bot-api';

export const webGreetings = () =>
  `<style>body { min-height: 100vh; display: flex; justify-content: center; align-items: center; flex-direction: column; margin: 0; background-color: #40a5ed; font-family: sans-serif; color: #252324; }</style>
  <h1>Вітаю, я <a href='https://t.me/heWhoMustSendYouComplimentsBot' style='color: #252324;'>ComplimentBot</a>!</h1>
  <h2>Заходь!</h2>`;

export const botWokeUp = () => 'Вітаю, я прокинувся =)';

export const complimentExists = () => 'А такий вже є, придумай інший ¯\\_(ツ)_/¯';

export const complimentAccepted = () => 'Поняв-приняв, дякую ;)';

export const complimentAcceptedNotify = (msg: Message, compliment: string): string => {
  if (!msg.from) return '';

  const { first_name, username } = msg.from;

  return `${username ? `@${username}` : first_name} додав(-ла) новий комплімент:\n` + `"${compliment}"`;
};

export const userExists = (): string => 'Так я і так відправляю тобі компліменти. Тобі мало? Звернись до розробника!';

export const userAccepted = (msg: Message): string => {
  if (!msg.from) return '';

  const { first_name } = msg.from;

  return `Вітаю, ${first_name}! Тепер я буду відправляти тобі компліменти =)`;
};

export const userAcceptedNotify = (msg: Message): string => {
  if (!msg.from) return '';

  const { id, first_name, last_name, username } = msg.from;

  let message =
    `Є ще той(та) хто теж хоче отримувати компліменти:\n` + `- ID: ${id}\n` + `- First Name: ${first_name}\n`;

  if (last_name) {
    message += `- Last Name: ${last_name}\n`;
  }

  if (username) {
    message += `- User Name: @${username}\n`;
  }

  return message;
};

export const help = (msg: Message): string => {
  if (!msg.from) return '';

  const { first_name } = msg.from;

  return (
    `Вітаю, ${first_name}! Мене звати ComplimentBot.\n` +
    '\n' +
    'Якщо хочеш - я буду відправляти тобі компліменти.\n' +
    '\n' +
    '/help - Допомога\n' +
    '/start - Дозволь мені говорити тобі приємне\n' +
    '/stop - Скажи мені "Па-па"\n' +
    '/compliment - Якщо хочешь комплімент прямо тут і зараз.\n' +
    '/flower - Отримай квіточку\n' +
    '/cat - Подивись на котика\n' +
    '/dog - Попести песика'
  );
};

export const helpNotify = (msg: Message): string => {
  if (!msg.from) return '';

  const { first_name, username } = msg.from;

  return `${username ? `@${username}` : first_name} попросив(-ла) про допомогу`;
};

export const userRemoved = (msg: Message): string => {
  if (!msg.from) return '';

  const { first_name } = msg.from;

  return `Ну що, ${first_name}! Будемо досвіданькатись? Мені було добре з тобою, приходь ще =)`;
};

export const userRemovedNotify = (msg: Message): string => {
  if (!msg.from) return '';

  const { first_name, username } = msg.from;

  return `${username ? `@${username}` : first_name} більше не хоче отримувати компліменти`;
};

export const userNotExists = () => 'Ми з вами не знайомі. Давайте познайомимось. Напишіть /start';

export const userGotCompliment = (msg: Message): string => {
  if (!msg.from) return '';

  const { first_name, username } = msg.from;

  return `${username ? `@${username}` : first_name} отримaв(-ла) комплімент`;
};

export const userGotPhoto = (msg: Message, photoTheme: string): string => {
  if (!msg.from) return '';

  const { first_name, username } = msg.from;

  return `${username ? `@${username}` : first_name} отримaв(-ла) світлину на тему "${photoTheme}"`;
};

export const thereIsFlower = (): string => 'Тримай квіточку';

export const thereIsCat = (): string => 'Тримай котика';

export const thereIsDog = (): string => 'Тримай песика';

export const allUsersGotCompliment = (): string => 'Всі отримали компліменти';
