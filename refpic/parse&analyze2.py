# -*- coding: utf-8 -*-
"""
Created on Sat Apr  9 13:07:56 2016

@author: yys
"""

import numpy as np
from scipy.spatial.distance import correlation
import socket
import webservice
import xml.dom.minidom 
from matplotlib import pyplot as plt 
import caldiff2
import os
import time
from PIL import Image

def parseConfig(xmlPath):
    if xmlPath:
        dom = xml.dom.minidom.parse(xmlPath)
    else:
        dom = xml.dom.minidom.parse("./config.xml")
    root = dom.documentElement
    conf = {}
    conf['host'] = root.getElementsByTagName('host')[0].firstChild.data
    conf['port'] = root.getElementsByTagName('port')[0].firstChild.data
    conf['upload_port'] = root.getElementsByTagName('upload_port')[0].firstChild.data
    conf['upload_port_warning'] = root.getElementsByTagName('upload_port_warning')[0].firstChild.data
    conf['nx'] = int(root.getElementsByTagName('nx')[0].firstChild.data)
    conf['ny'] = int(root.getElementsByTagName('ny')[0].firstChild.data)
    conf['threshold'] = int(root.getElementsByTagName('threshold')[0].firstChild.data)
    conf['width'] = int(root.getElementsByTagName('width')[0].firstChild.data)
    conf['height'] = int(root.getElementsByTagName('height')[0].firstChild.data)
    conf['sleep'] = int(root.getElementsByTagName('sleep')[0].firstChild.data)
    #conf['resultPath'] = root.getElementsByTagName('resultPath')[0].firstChild.data
    conf['refPath'] = root.getElementsByTagName('refPath')[0].firstChild.data
    conf['top'] = int(root.getElementsByTagName('top')[0].firstChild.data)
    conf['left'] = int(root.getElementsByTagName('left')[0].firstChild.data)
    conf['bottom'] = int(root.getElementsByTagName('bottom')[0].firstChild.data)
    conf['right'] = int(root.getElementsByTagName('right')[0].firstChild.data)
    conf['blur'] = root.getElementsByTagName('blur')[0].firstChild.data == 'True'
    return conf
    
def main():
    # Get image list from host
    conf = parseConfig('')
    time.sleep(int(conf['sleep']))
    response = webservice.queryData(conf)
    imageList = response['result']['list']
    roiLists = response['result']['rois']
    # Initialize the result of analyzation     
    #result['common-params'] = response['common-params']
    # Start analysizing images
    resItem = {}
    warning = {}
    fileRoot = '../../files'
    for idx,item in enumerate(imageList):
        # get pic path and ref_pic path
        # print item['picPath'], item['refPicPath']
        print idx,item
        img, refImg = os.path.join(fileRoot,item['picPath']), os.path.join(fileRoot, item['refPicPath'])
        print 'query image: ' ,os.path.basename(img), 'reference image: ', os.path.basename(refImg)

        rois = roiLists[idx]
        sensitivity = item['sensitivity']

        start = time.time()
        # try:
        #     salient, salient_loc, resImage = caldiff2.imgSimilarity(img, refImg, rois, conf, sensitivity)
        # except:
        #     continue
        salient, salient_loc, resImage = caldiff2.imgSimilarity(img, refImg, rois, conf, sensitivity)

        end = time.time()
        print 'Time cost: ', end-start

        outputName = os.path.basename(item['picPath']).split('.')[0] + '_res.jpg'
        outputPath = os.path.join(os.path.dirname(item['picPath']), outputName)
        # save the result image
        resImage.save(os.path.join(fileRoot, outputPath))
        #img.save(outputPath)
        resItem['id'] = item['id']        
        resItem['deviceId'] = item['deviceId']
        resItem['originalPicId'] = item['picId']
        #resItem['path'] = os.path.join(conf['resultPath'],outputName)
        resItem['path'] = outputPath
        resItem['name'] = outputName
        resItem['resolution'] = 0
        resItem['result'] = '0'
        resItem['comment'] = ""
        resItem['hostname'] = socket.gethostname()
        resItem['roiId'] = idx

        warning['id'] = item['picId']
        warning['roiId'] = idx
        webservice.UploadData(conf, resItem, 0)
        # if salient > conf['threshold']:
        # 	webservice.UploadWarning(conf, warning, 1)
        webservice.UploadWarning(conf, warning, 1)
  
        #refName = 'pic_0.jpg'
        #resItem['deviceId'] = item['deviceId']
        #resItem['path'] = os.path.join(conf['refPath'],refName)
        #resItem['resolution'] = 0
        #resItem['name'] = refName
        #webservice.UploadData(conf, resItem, 1)
        #result['list'].append(resItem)
    
        
#def getImage(path, refPath):
#    img = cv2.imread(path)
#    refImg = cv2.imread(refPath)
#    return img, refImg
    
main()
