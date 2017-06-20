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

fileRoot = '/home/yzhou51/workspace/wire_check-dev-yzhou51/picserver/files'
# Split the two pictures into n*n patches
def splitPic(img, nRow, nCol):
    sub_images = []
    w, h = img.shape[1], img.shape[0]
    sub_h, sub_w = h/nRow, w/nCol
    for i in xrange(nRow):
        for j in xrange(nCol):
            sub = img[i*sub_h:(i+1)*sub_h,j*sub_w:(j+1)*sub_w]
            sub_images.append(sub)
            #print sub.shape
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
        return True
    else:
        return False

def imgSimilarity(imgPath, refImgPath, conf):
    log_file = 'test.log'
    rgb_img1 = Image.open(imgPath)
    rgb_img2 = Image.open(refImgPath)
    # preprocess and resize
    if conf['blur']:
        rgb_img1 = rgb_img1.filter(ImageFilter.BLUR)
        rgb_img2 = irgb_img2.filter(ImageFilter.BLUR)
    rgb_img1 = rgb_img1.resize((conf['width'], conf['height']))
    rgb_img2 = rgb_img2.resize((conf['width'], conf['height']))
    img1 = rgb_img1.convert('L')
    img2 = rgb_img2.convert('L')
    nx, ny = conf['nx'], conf['ny']
    origin_width, origin_height = img1.size[1], img1.size[0]
    timg1 = np.array(img1.getdata(), dtype=np.uint8).reshape(img1.size[1], img1.size[0])
    timg2 = np.array(img2.getdata(), dtype=np.uint8).reshape(img2.size[1], img2.size[0])
    sub_x, sub_y = timg1.shape[0]/nx, timg1.shape[1]/ny

    # get the roi
    roi = [conf['top'], conf['left'], conf['bottom'], conf['right']]

    sub_images1 = splitPic(timg1,nx,ny)
    sub_images2 = splitPic(timg2,nx,ny)
    locs = splitPicLoc(timg1,nx,ny)
    match = []
    # Initialize the drawer
    draw = ImageDraw.Draw(rgb_img1)
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf', 16)
    #draw.text((200,400),'text', 255, font=font)
    for c, (i,j) in enumerate(zip(sub_images1, sub_images2)):
        rowIdx, colIdx = c/ny , c%ny
        patch = [rowIdx*sub_x, colIdx*sub_y, (rowIdx+1)*sub_x, (colIdx+1)*sub_y]
        if contain(patch, roi):
            #print patch, roi
            d = fftMatch(i,j)
            match.append(d)
            strtext = '{0:1.2f}'.format(d*100)
        else:
            strtext = '-1' 
        draw.text((locs[c][0]-20, locs[c][1]-20), strtext, 0, font=font)
    #img1.show()
    salient = 0
    salient_loc = []
    match = np.array(match)
    mean = np.mean(match)
    std = np.std(match)
    for i in range(match.shape[0]):
        if match[i] - mean > 3*std:
            salient += 1
            salient_loc.append(locPatch(timg1, nx, ny, i/10, i%10))
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
    
