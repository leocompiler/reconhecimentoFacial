//var pg = require('pg-db')();
var pg = require('pg');
pg.defaults.poolSize = 25;

var conString = global.conString;
function setConnectionString(con){
    conString = con;
}
module.exports.setConnectionString = setConnectionString;

function query(sql, param, callback) {
    //if (global.env=='development') { logger.debug('Query: ' + sql); }
    pg.connect(conString, function(err, client, done) {
        if (err)
            console.error("Erro ao executar: %s ", err);
        client.query(sql, param, function(err, result) {
            done();
            if (err)
                console.error("Erro ao executar: %s ", err);
            return callback(err, result);
        });
    });
};
module.exports.query = query;

function queryResult(sql, param, callback) {
    //if (global.env=='development') { logger.debug('Query: ' + sql); }
    pg.connect(conString, function(err, client, done) {
        if (err)
            console.error("Erro ao executar: %s ", err);
        client.query(sql, param, function(err, result) {
            done();
            if (err)
                console.error("Erro ao executar: %s ", err);
            return callback(err, result.rows);
        });
    });
};
module.exports.queryResult = queryResult;


function testConnection() {
    pg.connect(conString, function(err, client, done) {
        if (err) {
            console.error("Não foi possivel abrir conexão com o banco de dados: %s", err);
            console.info("ConnectionString: %s", conString);
        } else {
            console.info("Conexão com o banco de dados OK");
        }
    });
};

module.exports.testConnection = testConnection;

var queryHelper = {

    selectAll: function(tableName, orderBy, callback) {

        var sql = "SELECT * FROM " + tableName;

        if (orderBy) {
            sql += " ORDER BY " + orderBy;
        }

        query(sql, null, function(err, res) {

            if (err) {
                console.error(err);
                callback(err, []);
            } else {
                callback(undefined, res.rows);
            }
        });
    },

    selectWhere: function(tableName, whereProp, callback) {

        var propName = Object.keys(whereProp)[0];
        var propValue = whereProp[propName];

        var sql = "SELECT * FROM " + tableName + " WHERE " + propName + "= $1";

        query(sql, [propValue], function(err, res) {

            if (err) {
                console.error(err);
                callback(err, []);
            } else {
                callback(undefined, res.rows);
            }
        });
    },

    updateItem: function(tableName, idProp, props, callback) {

        var propsSql = "";
        var objProps = Object.keys(props);
        var arrValues = [];
        for (var i = 0; i < objProps.length; i++) {
            propsSql += (objProps[i] + "=$" + (i + 1));
            if (i < objProps.length - 1) {
                propsSql += ", ";
            }
            var pValue = props[objProps[i]];
            arrValues.push(pValue);
        }

        var idPropName = Object.keys(idProp)[0];
        var id = idProp[idPropName];
        arrValues.push(id);

        var sql = "update " + tableName + " set " + propsSql + " where " + idPropName + "=$" + (objProps.length + 1);

        query(sql, arrValues, function(err, res) {

            if (err) {
                console.error(err);
                callback(err, undefined);
            } else {
                var updated = res.rowCount > 0;
                callback(undefined, updated);
            }
        });
    },

    insertItem: function(tableName, props, callback) {

        var propsSql = "";
        var argSql = "";
        var objProps = Object.keys(props);
        var arrValues = [];
        for (var i = 0; i < objProps.length; i++) {
            propsSql += objProps[i];
            argSql += ("$" + (i + 1));
            if (i < objProps.length - 1) {
                propsSql += ", ";
                argSql += ",";
            }
            var pValue = props[objProps[i]];
            arrValues.push(pValue);
        }

        var sql = "insert into " + tableName + " (" + propsSql + ") values (" + argSql + ") RETURNING *";

        query(sql, arrValues, function(err, res) {

            if (err) {
                console.error(err);
                callback(err, []);
            } else {
                callback(undefined, res.rows[0]);
            }
        });
    }

};
module.exports.queryHelper = queryHelper;