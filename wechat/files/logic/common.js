var HOST = "";
$.getJSON ("config", function (data)  
{  
    HOST = "http://"+data.domain;
});  

