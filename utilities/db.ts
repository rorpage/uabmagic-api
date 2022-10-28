import { Sequelize } from 'sequelize';
import * as PushToken from '../models/db/push-token';
import { DB_CONFIG } from './secrets';

export const init = async () => {
  const sequelize = new Sequelize(DB_CONFIG);

  PushToken.init(sequelize);
};
