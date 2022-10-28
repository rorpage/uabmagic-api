import { DataTypes, Model, Sequelize } from "sequelize";

export class PushToken extends Model { }

export const init = (sequelize: Sequelize) => {
  const pushToken = PushToken.init(
    {
      token: { type: DataTypes.STRING },
      username: { type: DataTypes.STRING },
      createdDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'PushTokens',
      timestamps: true,
      createdAt: 'createdDate',
      updatedAt: 'updatedDate'
    }
  );

  return pushToken;
};
