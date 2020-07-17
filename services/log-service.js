const { uuid } = require('uuidv4');
const config = require('config');
const mysql = require('mysql2');

let pool = mysql.createPool({
  host: config.get("datasource.host"),
  user: config.get("datasource.user"),
  password: config.get("datasource.password"),
  database: config.get("datasource.database"),
  connectionLimit: 10
});

let generateResponse = (description, transactionId) => JSON.stringify({ 'description' : description, 'transactionId': transactionId});

let insertRecords = async (partIds, oldHeader, newHeader) => {
    let generatedUuid = uuid();
    partIds = (typeof partIds === 'undefined') ? [] : partIds;
    oldHeader = (typeof oldHeader === 'undefined') ? null : oldHeader;
    newHeader = (typeof newHeader === 'undefined') ? null : newHeader;
    await insertLog(partIds, oldHeader, newHeader, generatedUuid);
    await insertTransaction(generatedUuid, partIds);
    return generatedUuid;
}

let insertLog = async (partIds, oldHeader, newHeader, generatedUuid) => {
    let con = pool.promise();
    const [rows,] = await con.query(`INSERT INTO interchange_audit_log(transaction_id, old_header, new_header) values('${generatedUuid}', ${oldHeader}, ${newHeader})`);
    pool.releaseConnection(con);
    return rows;
}

let insertTransaction = async (transactionId, partIds) => {
    partIds.forEach(function(partId) {
        let con = pool.promise();
        con.query(`INSERT INTO interchange_audit_log_transactions(transaction_id, part_id) values('${transactionId}', ${partId})`);
        pool.releaseConnection(con);
    });
}

let getPartNumberById = async (partId) => {
    let con = pool.promise();
    const [rows,] = await con.query(`SELECT manfr_part_num FROM part WHERE id = ${partId}`);
    pool.releaseConnection(con);
    return rows[0].manfr_part_num;
}

let create = async (body) => {
    let transactionId = await insertRecords([body.partId], body.oldHeader, body.newHeader);
    let description = `Created interchange: [${body.partId}].`;
    return generateResponse(description, transactionId);
}
let leave = async (body) => {
    let transactionId = await insertRecords([body.partId], body.oldHeader, body.newHeader);
    let description = `The part [[${body.partId}] - ${await getPartNumberById(body.partId)}] migrated from interchange group [${body.oldHeader}] to [${body.newHeader}].`;
    return generateResponse(description, transactionId);
}

let add = async (body) => {
    let transactionId = await insertRecords([body.partId], body.oldHeader, body.newHeader);
    let description = 'Part [' + body.partId + '] - ' + await getPartNumberById(body.partId) + ' added to the part [' + body.toPartId + '] - ' + await getPartNumberById(body.toPartId)+ ' as interchange.';
    return generateResponse(description, transactionId);
}

let merge = async (body) => {
    let transactionId = await insertRecords(body.partIds, body.oldHeader, body.newHeader);
    let description = 'Part [' + body.partIds[1] + '] - ' + await getPartNumberById(body.partIds[1]) + ' and all its interchanges[' + body.partIds.slice(2) + '] added to the part [' + body.partIds[0] + '] - ' + await getPartNumberById(body.partIds[0]) + ' as interchanges.';
    return generateResponse(description, transactionId);
}

module.exports.create = create;
module.exports.leave = leave;
module.exports.add = add;
module.exports.merge = merge;
