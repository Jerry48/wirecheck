//  data model and API
// copyright@CCFLab.sjtu.edu.cn reserved, 2016
/*
 * history:
 * 2016.03.26, created by Andy.zhou
 *  
 */
'use strict';
var moment = require('moment');
var db = require('../../common/db');
var errorCode = require('../../common/errorCode');
var TIMEOUT = 10000;//10s

var DBModel = module.exports = function(options){
    if(!(this instanceof DBModel)) return new DBModel(options);

    this.refModel   = options.refModel;
    this.debug      = options.debug;
    this.table_name = options.table_name;
    this.model_name = options.model_name;

    this.validate = validate;
    this.filter = filter;
    this.lookup = lookup;
    this.create = create;
    this.update = update;
    this.remove = remove;
    this.count  = count;
    this.query = query;
    
}

/// input validate on 
/// check if fields are exist and correct data type.
/// - if model is valid, return true, 
/// - otherwise return false
function validate(model) {    
    var refModel = this.refModel;
    var table_name = this.table_name;
    var debug = this.debug;
    var model_name = this.model_name;

    debug('validate model: %j', model);

    for (var k in model) { 
        // check existence
        if (!(k in refModel)) { 
            console.error( table_name + ' no filed:'+k);
            return false;
        }
        
        if((typeof refModel[k] ==='number') && !isNaN(model[k])) {
            model[k] = Number(model[k]);
        }

        // check type
        if (!(typeof refModel[k] === typeof model[k])) {
            console.error(table_name +' typeof refModel[k]:' + (typeof refModel[k]));
            console.error(table_name +' typeof model[k]:' + (typeof model[k]));            
            console.error(table_name +' invalid field:' + k+',value:'+model[k]);
            return false;
        }
        
        // check format, TBD...
        // like Date, etc
    }
        
    return true;
}

/// input select fields filter on 
/// - return avaibale fields in {f1: 1, f2: 1, f3: 1 ...} if have some
/// - return false if no available fields
/// - return entire fields if * is in select
function filter(select) {
    var refModel = this.refModel;
    var table_name = this.table_name;
    var debug = this.debug;
    var model_name = this.model_name;

    debug('filter select: %j', select);

    var filtered = {};
    
    // allow *
    if ('*' in select)
        return {'*': 1};
    
    // filer valid fields
    Object.keys(select).forEach(function (k) {
        if (k in refModel)
            filtered[k] = 1;
    });

    return filtered;
}


/// lookup 
/// notes: query include match and select two part
/// - match used to lookup, 
/// - select for filter fields
function lookup(query, fn) {
    var refModel    = this.refModel;
    var table_name  = this.table_name;
    var debug       = this.debug;
    var model_name  = this.model_name;

    var match = query.match;  // don't allow null or empty
    var expect = query.select; // null means entire record fields
    var timeout = query.timeout || TIMEOUT;

    // 1.
    // Validate input
    // if failed return error
    if (!this.validate(match)) {
        var msg = ' Invalid lookup input';
        console.error(table_name + msg);
        return fn({code: errorCode.DB_PARAMS_INVALID, msg: msg});
    }
    
    var select = this.filter(expect);
    if (!select) {
        var msg = table_name +' invalid select input';
        console.error(msg);
        return fn({code: errorCode.DB_PARAMS_INVALID, msg: msg});
    }
    
    debug(model_name+' calling Database lookup');

    // 2.
    // Execute SQL
    db.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection err:'+err);
            return fn({code: errorCode.DB_CONNECTION_FAIL, msg: err});
        }
        
        // 2.1
        // Construct SQL string according to query.match and query.select
        // SELECT field1, field2,...fieldN table_name1, table_name2... [WHERE Clause] [OFFSET M ][LIMIT N]
        var sqlstr = '';
        
        // select part
        sqlstr += 'select ';
        sqlstr += Object.keys(select).join(',');
        sqlstr += ' from '+table_name+' where ';
        
        // condition part support only AND statement for now
        var ca = [];
        Object.keys(match).forEach(function (k) {
            if(typeof match[k] === 'object'){
                var date = moment(match[k]).format('YYYY-MM-DD HH:mm:ss');
                ca.push('' + k + '=' + '\'' + date + '\'');
            }else {
                 ca.push('' + k + '=' + (typeof match[k] === 'string' ? '"' + match[k] + '"' : match[k]));
            }           
        });
        sqlstr += ca.join(' and ');
        sqlstr += ';';
        
        debug(model_name +' lookup for ' + sqlstr);
        
        // Use the connection
        connection.query({sql:sqlstr, timeout:timeout}, function (err, rows) {
            // And done with the connection.
            connection.release();
            
            // 2.2
            // Check result
            if (err) {
                var msg = model_name + ' sql query failed:' + err;
                console.error(msg);
                fn({code:errorCode.DB_QUERY_FAIL, msg:err});
            } else {
                // 2.3
                // Process result ...
                var result = rows;
                
                fn(null, result);
            }
        });
    });

}

/// create record
function create(query, fn) {
    var refModel = this.refModel;
    var table_name = this.table_name;
    var debug = this.debug;
    var model_name = this.model_name;

    var expect = query.fields;  // don't allow null or empty
    var values = query.values;  // value's key must match to fields
    var timeout = query.timeout || TIMEOUT;
    
    if (!Array.isArray(values)) {
        values = [values];
    }
    
    //set the default value
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        value.state = value.state || 0;
        value.createTime = value.createTime || moment();
        value.updateTime = value.updateTime || moment(); 
    }

    expect.state = refModel.state;
    expect.createTime = moment();
    expect.updateTime = moment();

    // 1.
    // Validate input
    // if failed return error
    var fields = this.filter(expect);
    if (!fields) {
        var msg = 'Invalid lookup input';
        console.error(table_name + msg);
        return fn({code: errorCode.DB_PARAMS_INVALID, msg: msg});
    }
    
    for (var k in values){
        if (!this.validate(values[k])) {
            var msg = 'Invalid values input';
            console.error(table_name + msg);
            return fn({code: errorCode.DB_VALUES_INVALID, msg: msg});
        }
    }

    debug(model_name+' calling Database create');
    
    // 2.
    // Execute SQL
    db.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection err:'+err);
            return fn({code: errorCode.DB_CONNECTION_FAIL, msg: err});
        }
        
        // 2.1
        // Construct SQL string       
        // INSERT INTO table_name(field1, field2,...fieldN) VALUES (value1, value2,...valueN),...
        var sqlstr = 'insert into '+table_name;
        
        // fields part
        sqlstr += ' (' + Object.keys(fields).join(',') + ') ';
        
        // values part
        var va = [];
        values.forEach(function (v) {
            var vs = '(';
            var vsa = [];
            Object.keys(fields).forEach(function (k) {
                if(typeof v[k] === 'object'){
                    var date = moment(v[k]).format('YYYY-MM-DD HH:mm:ss');
                    vsa.push('\'' + date + '\'');
                }else {
                    vsa.push(typeof v[k] === 'string' ? '"' + v[k] + '"' : v[k]);
                }
            });
            vs += vsa.join(',');
            vs += ')';
            
            va.push(vs);
        });
        sqlstr += ' values '
        sqlstr += va.join(',');
        sqlstr += ';';
        
        debug(table_name +' create sql: ' + sqlstr);
        
        // Use the connection
        connection.query({sql:sqlstr, timeout:timeout}, function (err, rows) {
            // And done with the connection.
            connection.release();
            
            // 2.2
            // Check result
            if (err) {
                var msg = model_name + ' sql query failed:' + err;
                console.error( msg);
                fn({code:errorCode.DB_QUERY_FAIL, msg:err});
            } else {
                // 2.3
                // Process result ...
                var result = rows;
                
                fn(null, result);
            }
        });
    });

}

/// update record
function update(query, fn) {
    var refModel = this.refModel;
    var table_name = this.table_name;
    var debug = this.debug;
    var model_name = this.model_name;

    var match = query.match;  // don't allow null or empty
    var update = query.update; // don't allow null or empty
    var timeout = query.timeout || TIMEOUT;
    
    //set the default value
    update.updateTime = update.updateTime || new Date();

    // 1.
    // Validate input
    // if failed return error
    if (!this.validate(match)) {
        var msg = ' Invalid match input';
        console.error(table_name + msg);
        return fn({code: errorCode.DB_PARAMS_INVALID, msg: msg});
    }
    
    if (!this.validate(update)) {        
        var msg = ' Invalid update input';
        console.error(table_name + msg);
        return fn({code: errorCode.DB_VALUES_INVALID, msg: msg});
    }
    
    debug(model_name+' calling Database update');
    
    // 2.
    // Execute SQL
    db.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection err:'+err);
            return fn({code: errorCode.DB_CONNECTION_FAIL, msg: err});
        }
        
        // 2.1
        // Construct SQL string
        // UPDATE table_name SET field1=new-value1, field2=new-value2 [WHERE Clause]
        var sqlstr = 'update '+table_name+' set ';
        
        // update part
        var ua = [];
        Object.keys(update).forEach(function (k) {
            if(typeof update[k] === 'object'){
                var date = moment(update[k]).format('YYYY-MM-DD HH:mm:ss');
                ua.push('' + k + '='+'\'' + date + '\'');
            }else
            {
                ua.push('' + k + '=' + (typeof update[k] === 'string' ? '"' + update[k] + '"' : update[k]));
            }            
        });
        sqlstr += ua.join(',');
        
        // condition part support only AND statement for now
        sqlstr += ' where ';
        
        var ca = [];
        Object.keys(match).forEach(function (k) {
            if(typeof match[k] === 'object'){
                var date = moment(match[k]).format('YYYY-MM-DD HH:mm:ss');
                ca.push('' + k + '=' + '\'' + date + '\'');
            }else {
                ca.push('' + k + '=' + (typeof match[k] === 'string' ? '"' + match[k] + '"' : match[k]));
            }
        });
        sqlstr += ca.join(' and ');
        sqlstr += ';';
        
        debug('update: '+sqlstr);

        // Use the connection
        connection.query({sql:sqlstr, timeout:timeout}, function (err, rows) {
            // And done with the connection.
            connection.release();
            
            // 2.2
            // Check result
            if (err) {
                var msg = model_name + ' sql query failed:' + err;
                console.error(msg);
                fn({code:errorCode.DB_QUERY_FAIL, msg:err});
            } else {
                // 2.3
                // Process result ...
                var result = rows;
                
                fn(null, result);
            }
        });
    });

}

/// remove record
function remove(query, fn) {
    var refModel = this.refModel;
    var table_name = this.table_name;
    var debug = this.debug;
    var model_name = this.model_name;

    var match = query.match;  // don't allow null or empty
    var timeout = query.timeout || TIMEOUT;
    
    // 1.
    // Validate input
    // if failed return error
    if (!this.validate(match)) {
        var msg = ' Invalid delete input';
        console.error(table_name + msg);
        return fn({code: errorCode.DB_PARAMS_INVALID, msg: msg});
    }
    
    debug(model_name+' calling Database remove');
    
    // 2.
    // Execute SQL
    db.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection err:'+err);
            return fn({code: errorCode.DB_CONNECTION_FAIL, msg: err});
        }
        
        // 2.1
        // Construct SQL string
        // DELETE FROM table_name [WHERE Clause]
        var sqlstr = 'delete from '+table_name+' where ';
        
        // condition part support only AND statement for now
        var ca = [];
        Object.keys(match).forEach(function (k) {
            if(typeof match[k] === 'object'){
                var date = moment(match[k]).format('YYYY-MM-DD HH:mm:ss');
                ca.push('' + k + '=' + '\'' + date + '\'');
            }else {
                ca.push('' + k + '=' + (typeof match[k] === 'string' ? '"' + match[k] + '"' : match[k]));
            }
        });
        sqlstr += ca.join(' and ');
        sqlstr += ';';
        
        // Use the connection
        connection.query({sql:sqlstr, timeout:timeout}, function (err, rows) {
            // And done with the connection.
            connection.release();
            
            // 2.2
            // Check result
            if (err) {
                var msg = model_name + ' sql query failed:' + err;
                console.error(msg);
                fn({code:errorCode.DB_QUERY_FAIL, msg:err});
            } else {
                // 2.3
                // Process result ...
                var result = rows;
                
                fn(null, result);
            }
        });
    });
}

//count record
function count(query, fn){
    var refModel = this.refModel;
    var table_name = this.table_name;
    var debug = this.debug;
    var model_name = this.model_name;

    var match = query.match;  // don't allow null or empty
   // var expect = query.select; // null means entire record fields
    var timeout = query.timeout || TIMEOUT;
    
    // 1.
    // Validate input
    // if failed return error
    if (!this.validate(match)) {
        var msg = ' Invalid match input';
        console.error(table_name + msg);
        return fn({code: errorCode.DB_PARAMS_INVALID, msg: msg});
    }
    
   // var select = this.filter(expect);
   // if (!select) {
   //     return fn(table_name +' invalid select input');
   // }
    debug(model_name+' calling Database count');
    // 2.
    // Execute SQL
    db.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection err:'+err);
            return fn({code: errorCode.DB_CONNECTION_FAIL, msg: err});
        }
        
        // 2.1
        // Construct SQL string according to query.match and query.select
        // SELECT field1, field2,...fieldN table_name1, table_name2... [WHERE Clause] [OFFSET M ][LIMIT N]
        var sqlstr = '';
        
        // select part
        sqlstr += 'select count(*) as total ';       
        sqlstr += ' from '+table_name+' where ';
        
        // condition part support only AND statement for now
        var ca = [];
        Object.keys(match).forEach(function (k) {
            if(typeof match[k] === 'object'){
                var date = moment(match[k]).format('YYYY-MM-DD HH:mm:ss');
                ca.push('' + k + '=' + '\'' + date + '\'');
            }else {
                ca.push('' + k + '=' + (typeof match[k] === 'string' ? '"' + match[k] + '"' : match[k]));
            }           
        });
        sqlstr += ca.join(' and ');
        sqlstr += ';';
        
        debug(model_name +' count for: ' + sqlstr);
        
        // Use the connection
        connection.query({sql:sqlstr, timeout:timeout}, function (err, rows) {
            // And done with the connection.
            connection.release();
            
            // 2.2
            // Check result
            if (err) {
                var msg = model_name + ' sql query failed:' + err;
                console.error(msg);
                fn({code:errorCode.DB_QUERY_FAIL, msg:err});
            } else {
                // 2.3
                // Process result ...
                var result = rows[0];
               // console.log('count result:%j', rows);
                fn(null, result.total);
            }
        });
    });
}

function query(param, fn){
    var refModel = this.refModel;
    var table_name = this.table_name;
    var debug = this.debug;
    var model_name = this.model_name;

    var timeout = param.timeout || TIMEOUT;
    var sqlstr  = param.sqlstr || param.sqlStr || param;

    debug(model_name+' calling Database query');

    // 2.
    // Execute SQL
    db.getConnection(function (err, connection) {
        if (err) {
            console.error('Database connection err:'+ err);
            return fn({code: errorCode.DB_CONNECTION_FAIL, msg: err});
        }
        
        // 2.1         
        debug(model_name+' SQL: ' + sqlstr);
        
        // Use the connection
        connection.query({sql:sqlstr, timeout:timeout}, function (err, rows) {
            // And done with the connection.
            connection.release();
            
            // 2.2
            // Check result
            if (err) {
                var msg = model_name + ' sql query failed:' + err;
                console.error(msg);
                fn({code:errorCode.DB_QUERY_FAIL, msg:err});
            } else {
                // 2.3
                // Process result ...
                
               // console.log('count result:%j', rows);
                fn(null, rows);
            }
        });
    });
}
