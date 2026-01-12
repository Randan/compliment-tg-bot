export interface IUser {
  telegramId: number;
  firstName: string;
  lastName?: string;
  userName?: string;
}

export interface ICompliment {
  value: string;
}

interface IUnsplashUrls {
  large: string;
  regular: string;
  raw: string;
  small: string;
}

interface IUnsplashUser {
  username: string;
  name: string;
}

export interface IUnsplashResponse {
  id: number;
  width: number;
  height: number;
  urls: IUnsplashUrls;
  color: string | null;
  user: IUnsplashUser;
}
