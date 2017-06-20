// var archiver = require('archiver');
var fs = require('fs');
var path = require('path');
// //±»´ò°üÎÄ¼þ
// var files = [
//   '1-04.png',
//   '2-04.png'
//   ];
// var zipPath = '/home/yzhou51/workspace/wire_check-dev-yzhou51/picserver/files/test.zip';
// //´´½¨Ò»×îÖÕ´ò°üÎÄ¼þµÄÊä³öÁ÷
// var output = fs.createWriteStream(zipPath);
// //Éú³Éarchiver¶ÔÏó£¬´ò°üÀàÐÍÎªzip
// var zipArchiver = archiver('zip');
// //½«´ò°ü¶ÔÏóÓëÊä³öÁ÷¹ØÁª
// zipArchiver.pipe(output);
// for(var i=0; i < files.length; i++) {
//   console.log(files[i]);
//   //½«±»´ò°üÎÄ¼þµÄÁ÷Ìí¼Ó½øarchiver¶ÔÏóÖÐ
//   zipArchiver.append(fs.createReadStream(files[i]), {'name': files[i]});
// }
// //´ò°ü
// zipArchiver.finalize();
fs.readFile('/home/yzhou51/workspace/wire_check-dev-yzhou51/updateFiles/test.zip', function(err, data){
    console.log(data);
    console.log(data.length);
});

var file=path.resolve('/home/yzhou51/workspace/wire_check-dev-yzhou51/updateFiles/test.zip');  
	var rs=fs.createReadStream(file,{highWaterMark:5});  
	var dataArr=[], 
	    len=0;  
	/* 
	*  
	 */  
	rs.on('data',function(chunk){  
	    // console.log(Buffer.isBuffer(chunk));  
	    dataArr.push(chunk);  
	    len+=chunk.length;  
	});  
	rs.on('end',function(){  
	    var result=Buffer.concat(dataArr,len);  
	    console.log(result);  
	    console.log(result.length);
	});