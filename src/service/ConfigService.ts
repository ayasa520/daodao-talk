import { Config as ConfigType } from '@/models/config.model';

export interface ConfigService{
  createConfig(input: ConfigType): Promise<void>;
}
