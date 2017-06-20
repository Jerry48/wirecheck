// file server  API
// copyright@Catosoft.com reserved, 2015
/*
 * history:
 * 2015.06.07, created by Andy.zhou
 *  
 */

var moduleName = 'file_server.logic';
var debug = require('debug')(moduleName);

var http = require('http');
var https = require('https');
var url = require('url');
var fs = require('fs');
var mime = require('./mime');
// some utility method designed to help handle range request
var port = (process.env.PORT_ENV && parseInt(process.env.PORT_ENV, 10)) || 9090;

var rge = require('./range');
var SERVERPRV_KEY = __dirname +'/../back/keys/serverprv.pem';
var SERVERCERT = __dirname +'/../back/keys/servercert.pem';

var option = {
    key: fs.readFileSync(SERVERPRV_KEY),
    cert: fs.readFileSync(SERVERCERT),
};  

function appCallback(request, response) {
  try{
            // this is the file name
        var fname = url.parse(request.url).pathname.substring(1);
        if(!fname) {
            response.writeHead(404);
            response.write("Not Found!");
            response.end();
            return;
        }
        // do not response the favicon.ico file request
        if (fname == 'favicon.ico') {
            response.end();
            return ;
        }
        
        debug(request.headers);
        debug('request: '+ fname);

        var filepath = '/home/yzhou51/workspace/files/' + fname;
        var suffix = fname.substring(fname.indexOf('.') + 1);       
        var type = mime.getMimeType(suffix);
        var stat = fs.statSync(filepath);
        
        // log file size
        debug('File path: ' + filepath);
        debug('File Size: ' + stat.size);
        // check whether the header has the Range field
        var range = request.headers['range'];
        if (range) {
            debug('Range Download');
            // partial download
            range = rge.parseRange(range, stat.size);
            console.log(range);
            // assume the format is right, no error handling
            response.writeHead(206, {'Content-Type': type,
                'Conteng-Range': 'bytes ' + range.start + '-'
                + range.end + '/' + stat.size,
                'Content-Length': range.start - range.end + 1});
            fs.createReadStream(filepath, range).pipe(response);
        } else {
            debug('Full Download');
            response.writeHead(200, {'Content-Type': type, 
                'Content-Length': stat.size,
                });
            // send the file
            fs.createReadStream(filepath).pipe(response);
        } 
    }catch(err){
        var json = {};
        json.code = 1;
        json.message = err;
        json.result = {};
        console.error(moduleName +': ' +err);

        response.writeHead(404);
        response.write(JSON.stringify(json));
        response.end();
    }   
}   

http.createServer(appCallback).listen(port);
//https.createServer(option, appCallback).listen(9091);
console.log('CCFLab SJTU file server started on port 9090');
//console.log('All papapa https server started on port 9091');