const { uuid } = require('uuidv4');
const config = require('config');
var mysql = require('mysql');

var pool = mysql.createPool({
  host: config.get("datasource.host"),
  user: config.get("datasource.user"),
  password: config.get("datasource.password"),
  database: config.get("datasource.database"),
  connectionLimit: 10
});

function insertRecord(partIds, oldHeader, newHeader) {
    console.log('call' + partIds);
    partIds = (typeof partIds === 'undefined') ? [] : partIds;
    oldHeader = (typeof oldHeader === 'undefined') ? null : oldHeader;
    newHeader = (typeof newHeader === 'undefined') ? null : newHeader;
    var generatedUuid = uuid();
    pool.getConnection(function(err, con) {
      if (err) throw err;
      created = new Date();
      var sql = "INSERT INTO interchange_audit_log(transaction_id, old_header, new_header) values('" + generatedUuid + "', " + oldHeader + ", " + newHeader + ")";
        con.query(sql, function (err, result) {
            console.log(result);
          if (err) throw err;
          partIds.forEach(function(partId) {
              var interchangeAuditLogTransactionsQuery = "INSERT INTO interchange_audit_log_transactions(transaction_id, part_id) values('" + generatedUuid + "', " + partId + ")";
              con.query(interchangeAuditLogTransactionsQuery, function (err, result) {
                if (err) throw err;
              });
          });

        });
        con.release();
    });
}

module.exports.insertRecord = insertRecord;