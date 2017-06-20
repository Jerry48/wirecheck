


var fs=require('fs');  
var path = require('path');  
var fileArray = [];
function ls(ff)  
    {  
        var files=fs.readdirSync(ff);  
        for(fn in files)  
        {  
            var fname = ff+path.sep+files[fn];  
            var stat = fs.lstatSync(fname);  
            if(stat.isDirectory() == true)  
            {  
                ls(fname);  
            }  
            else  
            {  
                console.log(fname); 
                fileArray.push(fname);
            }  
        }  
    }  
ls('../logic');  
console.log(fileArray);