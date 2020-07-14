const { uuid } = require('uuidv4');
const config = require('config');
const mysql = require('mysql2');

var pool = mysql.createPool({
  host: config.get("datasource.host"),
  user: config.get("datasource.user"),
  password: config.get("datasource.password"),
  database: config.get("datasource.database"),
  connectionLimit: 10
});

function insertRecord(partIds, oldHeader, newHeader) {
    var generatedUuid = uuid();
    partIds = (typeof partIds === 'undefined') ? [] : partIds;
    oldHeader = (typeof oldHeader === 'undefined') ? null : oldHeader;
    newHeader = (typeof newHeader === 'undefined') ? null : newHeader;
    pool.getConnection(function(err, con) {
      if (err) throw err;
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
    return generatedUuid;
}

function create(body) {
    var transactionId = insertRecord([body.partId], body.oldHeader, body.newHeader);
    return JSON.stringify({ 'description' : 'Created interchange: [' + body.partId  + '].', 'transactionId': transactionId});
}
async function leave(body) {
    var transactionId = insertRecord([body.partId], body.oldHeader, body.newHeader);
    var con = pool.promise();
    const [rows,fields] = await con.query('SELECT manfr_part_num FROM part WHERE id = ' + body.partId);
    return JSON.stringify({ 'description' : 'The part [[' + body.partId + '] - ' + rows[0].manfr_part_num + '] migrated from interchange group [' + body.oldHeader + '] to [' + body.newHeader + '].', 'transactionId': transactionId});
}

async function add(body) {
    var transactionId = insertRecord([body.partId], body.oldHeader, body.newHeader);
    var con = pool.promise();
    const [fromRows, fromFields] = await con.query('SELECT manfr_part_num FROM part WHERE id = ' + body.partId);
    const [toRows, toFields] = await con.query('SELECT manfr_part_num FROM part WHERE id = ' + body.toPartId);
    return JSON.stringify({ 'description' : 'Part [' + body.partId + '] - ' + fromRows[0].manfr_part_num + ' added to the part [' + body.toPartId + '] - ' + toRows[0].manfr_part_num + ' as interchange.', 'transactionId': transactionId});
}

async function merge(body) {
    var transactionId = insertRecord(body.partIds, body.oldHeader, body.newHeader);
    var con = pool.promise();
    const [fromRows, fromFields] = await con.query('SELECT manfr_part_num FROM part WHERE id = ' + body.partIds[1]);
    const [toRows, toFields] = await con.query('SELECT manfr_part_num FROM part WHERE id = ' + body.partIds[0]);
    return JSON.stringify({ 'description' : 'Part [' + body.partIds[1] + '] - ' + fromRows[0].manfr_part_num + ' and all its interchanges[' + body.partIds.slice(2) + '] added to the part [' + body.partIds[0] + '] - ' + toRows[0].manfr_part_num + ' as interchanges.', 'transactionId': transactionId});
}

module.exports.create = create;
module.exports.leave = leave;
module.exports.add = add;
module.exports.merge = merge;