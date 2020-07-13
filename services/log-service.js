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

function insertRecord(partIds, oldHeader, newHeader, action) {
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
    return JSON.stringify(partIds.map(id => { return { 'description' : generateDescription(id, oldHeader, newHeader, action), 'transactionId': generatedUuid}}));
}
function generateDescription(partId, oldHeader, newHeader, action) {
    if(action == 'leave')
        return 'The part [[' + partId + '] - $PART_NUMBER] migrated from interchange group [' + oldHeader + '] to [' + newHeader + '].';
    if(action == 'create')
        return 'Created interchange: [' + partId  +'].';
    if(action == 'add')
        return 'Part [' + partId + "] - $PART_NUMBER added to the part [$PART_ID] - $PART_NUMBER as interchange.";
    if(action == 'addGroup')
        return 'Part [' + partId + '] - $PART_NUMBER and all its interchanges[$INTERCHANGES] added to the part [$PART_ID] - $PART_NUMBER as interchanges.';
    throw new Error('Wrong action!');
}

module.exports.insertRecord = insertRecord;