import { Config as ConfigType } from '@/models/Config';

export interface ConfigService{
  createConfig(input: ConfigType): Promise<void>;
}
