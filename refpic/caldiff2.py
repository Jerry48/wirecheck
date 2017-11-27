# -*- coding: utf-8 -*-
"""
Created on Sat Mar 26 13:53:30 2016
@author: yys
"""

import numpy as np
from PIL import Image, ImageFilter, ImageFont, ImageDraw
import time
from matplotlib import pyplot as plt
from scipy.spatial.distance import cosine
from scipy.spatial.distance import correlation
import scipy.fftpack as fftpack
import os
import logging
import warnings
warnings.simplefilter("error")

fileRoot = '/home/yzhou51/workspace/wire_check-dev-yzhou51/picserver/files'

# Split the two pictures into n*n patches
def splitPic(img, nRow, nCol):
    sub_images = []
    w, h = img.shape[1], img.shape[0]
    sub_h, sub_w = h/nRow, w/nCol
    print sub_h
    print sub_w
    for i in xrange(nRow):
        for j in xrange(nCol):
            print i*sub_h
            print (i+1)*sub_h
            print j*sub_w
            print (j+1)*sub_w
            sub = img[i*sub_h:(i+1)*sub_h,j*sub_w:(j+1)*sub_w]
            sub_images.append(sub)
            print sub
    return sub_images

def splitPicLoc(img, nRow, nCol):
    sub_images = []
    w, h = img.shape[1], img.shape[0]
    sub_h, sub_w = h/nRow, w/nCol
    for i in xrange(nRow):
        for j in xrange(nCol):
            sub_images.append((j*sub_w+sub_w/2, i*sub_h+sub_h/2))
    return sub_images

def locPatch(img, nRow, nCol, rowIdx, colIdx):
    w, h = img.shape[1], img.shape[0]
    sub_h, sub_w = h/nRow, w/nCol
    return [rowIdx*sub_h, colIdx*sub_w, sub_h, sub_w]

def fftMatch(im1, im2):
    #fft_im1 = FFT(im1)
    #fft_im2 = FFT(im2)
    f1 = fftpack.fft2(im1)
    #f1 = fftpack.fftshift(f1)
    psd1 = np.abs( f1 )

    f2 = fftpack.fft2(im2)
    #f2 = fftpack.fftshift(f2)
    psd2 = np.abs( f2 )

    hist1 = psd1.ravel()
    #print 'fft power: size:',hist1.shape
    hist2 = psd2.ravel()
    score = correlation(hist1, hist2)
    return score


def contain(patch, roi):
    if roi[0] <= patch[0] < patch[2] <= roi[2] and roi[1] <= patch[1] < patch[3] <= roi[3]:
        print '-------- function contain()'
        print roi[0],roi[1],roi[2],roi[3],patch[0],patch[1],patch[2],patch[3]
        return True
    else:
        return False

def imgSimilarity(imgPath, refImgPath, roi, conf, senstivity):
    log_file = 'test.log'
    rgb_img1 = Image.open(imgPath)
    rgb_img2 = Image.open(refImgPath)

    img1 = rgb_img1.convert('L')
    img2 = rgb_img2.convert('L')

    nx, ny = conf['nx'], conf['ny']

    timg1 = np.array(img1.getdata(), dtype=np.uint8).reshape(img1.size[1], -1)
    timg2 = np.array(img2.getdata(), dtype=np.uint8).reshape(img2.size[1], -1)
    # timg1 = np.array(img1.getdata(), dtype=np.uint8).reshape(img1_width, -1)
    # timg2 = np.array(img2.getdata(), dtype=np.uint8).reshape(img2_width, -1)
    print "-------- originalPic"
    print timg1.shape[1],timg1.shape[0]
    print "-------- refPic"
    print timg2.shape[1],timg2.shape[0]
    sub_x, sub_y = timg1.shape[1]/nx, timg1.shape[0]/ny
    print 'sub_x,sub_y:',sub_x,sub_y 

    # get the roi
    # roi = [conf['top'], conf['left'], conf['bottom'], conf['right']]
    sub_images1 = splitPic(timg1,nx,ny)
    sub_images2 = splitPic(timg2,nx,ny)

    # print sub_images1
    # print sub_images2
    locs = splitPicLoc(timg1,nx,ny)
    match = []
    index = []
    # Initialize the drawer
    draw = ImageDraw.Draw(rgb_img1)
    # font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf', 16)
    # draw.text((200,400),'text', 255, font=font)
    

    for c, (i,j) in enumerate(zip(sub_images1, sub_images2)):
        rowIdx, colIdx = c/nx , c%nx
        patch = [colIdx*sub_x, rowIdx*sub_y, (colIdx+1)*sub_x, (rowIdx+1)*sub_y]
        for m,roix in enumerate(roi):
            draw.rectangle(((roix[0], roix[1]),(roix[2], roix[3])), outline = "red")
            if contain(patch, roix):
                #print patch, roi
                print "-------- print i"
                print i
                print "-------- print j"
                print j

                d = fftMatch(i,j)
                index.append(c)
                match.append(d)
                strtext = '{0:1.2f}'.format(d*100)
            else:
                strtext = '' 
            # draw.text((locs[c][0]-20, locs[c][1]-20), strtext, 0, font=font)

    #img1.show()
    salient = 0
    salient_loc = []
    match = np.array(match)
    index = np.array(index)
    print match
    print index
    mean = np.mean(match)
    std = np.std(match)
    n = float(15 - senstivity)/10
    for i in range(match.shape[0]):
        if match[i] - mean > n*std:
            salient += 1
            salient_loc.append(locPatch(timg1, nx, ny, index[i]/nx, index[i]%nx))
    #print salient, salient_loc
    for s in salient_loc:
        draw.rectangle(((s[1], s[0]),(s[1]+s[3],s[0]+s[2])), outline = "red")
    #print os.path.join(conf['resultPath'],os.path.basename(imgPath))
    #save_name = os.path.basename(imgPath).split('.')[0] + '_result.jpg'
    #save_path = os.path.join(os.path.join(fileRoot,conf['resultPath']),save_name)
    #rgb_img1.save(save_path)
    #img1.save('test.jpg')
    #outputPath = os.path.join(conf['resultPath'],os.path.basename(imgPath))
    return salient, salient_loc, rgb_img1 


#def main():
#    img1 = '1.png'
#    img2 = '2.png'
#    #img1 = 'test1.jpg'
#    #img2 = 'test1r.jpg'
#    conf = dict()
#    conf['nx']=10
#    conf['ny']=10
#    conf['width']=1280
#    conf['height']=768
#    conf['resultPath']='output'
#    conf['blur'] = False
#    conf['top'] =0 
#    conf['left'] = 0
#    conf['bottom'] = 500
#    conf['right'] = 800
#    start=time.clock()
#    imgSimilarity(img1,img2,conf)
#    finish=time.clock()
#    print finish-start
    
