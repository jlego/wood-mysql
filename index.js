/**
 * Wood Plugin Module.
 * mysql操作库
 * by jlego on 2018-11-25
 */
const Mysql = require('./src/mysql');

module.exports = (app = {}, config = {}) => {
  app.Mysql = Mysql;
  if(app.addAppProp) app.addAppProp('Mysql', app.Mysql);
  return app;
}
