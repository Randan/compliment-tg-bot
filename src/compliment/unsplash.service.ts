import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { LoggerService } from '@randan/tg-logger';
import type { AxiosInstance } from 'axios';
import axios from 'axios';

export interface UnsplashUrls {
  large: string;
  regular: string;
  raw: string;
  small: string;
}

export interface UnsplashResponse {
  id: number;
  width: number;
  height: number;
  urls: UnsplashUrls;
  color: string | null;
  user: { username: string; name: string };
}

@Injectable()
export class UnsplashService {
  private readonly client: AxiosInstance;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const baseURL = this.config.get<string>('UNSPLASH_URI');
    const token = this.config.get<string>('UNSPLASH_ACCESS_KEY');
    this.client = axios.create({ baseURL });
    this.client.interceptors.request.use(cfg => {
      if (token) {
        cfg.headers = cfg.headers || {};
        cfg.headers.Authorization = `Client-ID ${token}`;
      }
      return cfg;
    });
    this.client.interceptors.response.use(
      r => r,
      err => {
        this.logger.error('Unsplash API request failed', err);
        return Promise.reject(err);
      },
    );
  }

  async getPhoto(query: string): Promise<UnsplashResponse> {
    const { data } = await this.client.get<UnsplashResponse>('/photos/random', { params: { query } });
    return data;
  }
}
