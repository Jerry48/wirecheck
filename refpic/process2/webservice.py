# -*- coding: utf-8 -*-
"""
Created on Fri Nov 07 03:19:55 2014

@author: smartvision
"""
import json, requests, datetime

def uploadeventTowebservice(host, port, data ,dataType):

    class CJsonEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, datetime.datetime):
                return obj.strftime('%Y-%m-%d %H:%M:%S')
            elif isinstance(obj, datetime.date):
                return obj.strftime('%Y-%m-%d')
            else:
                return json.JSONEncoder.default(self, obj) 
                   
    def uploadEvent(host, port, data):
        url = 'http://'+ host+':'+port+'/v1/device/klUploadResult'
        #print json.dumps(data,cls=CJsonEncoder)
        requests.post(url,data=json.dumps(data,cls=CJsonEncoder),headers={'content-type': 'application/json'})

    def uploadWarning(host, port, data):
        url = 'http://'+ host+':'+port+'/v1/picture/analysis/klAlert'
        #print json.dumps(data,cls=CJsonEncoder)
        requests.post(url,data=json.dumps(data,cls=CJsonEncoder),headers={'content-type': 'application/json'})

    def setRefPic(host, port, data):
        #print data
        url = 'http://'+ host+':'+port+'/v1/device/klSetReference'
        print json.dumps(data,cls=CJsonEncoder)
        requests.post(url,data=json.dumps(data,cls=CJsonEncoder),headers={'content-type': 'application/json'})

    if dataType == 0:
        uploadEvent(host, port, data)
        print 'upload succeed'
    elif dataType == 1:
        uploadWarning(host, port, data)
        print 'upload warning succeed'
    else:
        setRefPic(host, port, data)
        print 'set Pic succeed'

def queryData(conf):
    host = conf['host']
    port = conf['port']
    #url = 'https://'+ host+':'+port+'/v1/device/klGetJob'
    url = 'http://'+ host+':'+port+'/v1/device/klGetJob'
    response = requests.get(url)
    #print response.content
    event = json.loads(response.content)
    #del event['id']
    #del event['resource_uri']
    #del event['gettime']
    return event
    
def UploadData(conf, data, dataType):
#    camera_ip="192.168.0.201"
#    eventtype_id=2
#    description=desc
    host = conf['host']
    port = conf['upload_port']
    uploadeventTowebservice(host, port, data, dataType) 

def UploadWarning(conf, warning, dataType):
    host = conf['host']
    port_warning = conf['upload_port_warning']
    uploadeventTowebservice(host, port_warning, warning, dataType) 
