import { inject } from 'inversify';

import TYPES from '@/constants/TYPES';

export const dbClient = inject(TYPES.DbClient);
