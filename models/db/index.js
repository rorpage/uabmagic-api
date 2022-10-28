'use strict';

const Sequelize = require('sequelize');
const config = require('../../utilities/secrets');
const db = {};

const PushTokens = require('./push-token');

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  date = this._applyTimezone(date, options);

  return date.format('YYYY-MM-DD HH:mm:ss.SSS');
};

const sequelize = new Sequelize(config.DB_CONFIG);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.PushTokens = PushTokens.init(sequelize, Sequelize);

module.exports = db;
