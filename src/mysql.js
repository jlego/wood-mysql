// mysql操作方法类
// by YuRonghui 2018-11-25
const { Query } = require('wood-querysql')();
const mysql = require('mysql2/promise');
const { error, catchErr } = WOOD;
let _pools = {}; //连接池
let _tables = new Map(); //数据表名单

class Mysql {
  constructor(tbname, db = 'master', fields) {
    this.tableName = tbname;
    this.db = db;
    this.fields = fields;
  }

  // 创建表
  createTable(){
    if(_tables.has(this.tableName)) return;
    for(let key in this.fields){
      if(this.fields[key].type === 'datetime'){
        this.fields[key].default = `'${fields[key].default}'`;
      }
    }
    let [sqlStr, values] = Query().create(this.tableName, this.fields).toSQL(),
      fieldsArr = Object.values(this.fields);
    fieldsArr.forEach(item => {
      let length = item.length;
      if(length !== undefined) {
        sqlStr = sqlStr.replace(/\s+(int|char|varchar|float)\s+/, ` $1(${Array.isArray(length) ? length.join(',') : length}) `);
      }
    });
    sqlStr += ' default charset=utf8;'
    this.getConn().execute(sqlStr);
    _tables.set(this.tableName, true);
  }

  // 清除表
  dropTable() {
    this.getConn().execute(`drop table if exists \`${this.tableName}\`;`);
  }

  // 获取SQL
  _getSQL(sql) {
    if (sql._isQuery) {
      return sql.toSQL();
    } else {
      return sql;
    }
  }

  // 执行操作
  async execute(data = {}) {
    this.createTable();
    let sql = this._getSQL(data);
    console.warn(...sql);
    const result = await catchErr(this.getConn().execute(...sql));
    if(result.err){
      throw error(result.err);
    }else{
      return result.data[0];
    }
  }

  // 获取连接
  getConn(){
    return _pools[this.db];
  }

  // 创建数据库连接池
  static async connect(opts = {}, name = 'master', callback) {
    if(!_pools[name]){
      _pools[name] = await mysql.createConnection(opts);
      if(callback) callback(_pools[name]);
      console.log('Mysql connected Successfull');
      return _pools[name];
    }
  }
}

module.exports = Mysql;
