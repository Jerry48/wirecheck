# -*- coding: utf-8 -*-
"""
Created on Sat Mar 26 13:53:30 2016
@author: yys
"""

import numpy as np
import cv2
import cv2.cv as cv
import time
from matplotlib import pyplot as plt
from skimage.transform import rotate
from skimage.feature import local_binary_pattern
from skimage import data
from skimage.color import label2rgb
from scipy.spatial.distance import cosine
from scipy.spatial.distance import correlation
import scipy.fftpack as fftpack 
import os

# Split the two pictures into n*n patches
def splitPic(img, nRow, nCol):
    sub_images = []
    w, h = img.shape[1], img.shape[0]
    sub_h, sub_w = h/nRow, w/nCol
    for i in xrange(nRow):
        for j in xrange(nCol):
            sub = img[i*sub_h:(i+1)*sub_h,j*sub_w:(j+1)*sub_w]
            sub_images.append(sub)
            #cv2.imshow("sub", sub)
            #cv2.waitKey(0)
    #cv2.destroyAllWindows()
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
    f1 = fftpack.fftshift(f1)
    psd1 = np.abs( f1 )
    
    f2 = fftpack.fft2(im2)
    f2 = fftpack.fftshift(f2)
    psd2 = np.abs( f2 )
    
    hist1 = psd1.ravel()
    hist2 = psd2.ravel()
    score = correlation(hist1, hist2)*100
    return score
    
def imgSimilarity(imgPath, refImgPath, conf):
    img1 = cv2.imread(imgPath,0)
    img2 = cv2.imread(refImgPath,0)
    nx, ny = conf['nx'], conf['ny']
    img1 = cv2.resize(img1, (conf['width'], conf['height']))
    img2 = cv2.resize(img2, (conf['width'], conf['height']))
    #if conf['blur']:
    #    img1 = cv2.blur(img1,(3,3))
    #    img2 = cv2.blur(img2,(3,3))
    sub_images1 = splitPic(img1,nx,ny)
    sub_images2 = splitPic(img2,nx,ny)
    locs = splitPicLoc(img1,nx,ny)
    match = np.zeros([nx,ny])
    for c, (i,j) in enumerate(zip(sub_images1, sub_images2)):
        d = fftMatch(i,j)
        match[i][j] = d
        strtext = '{0:1.2f}'.format(d)
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(img1, strtext, locs[c], font, 0.5, (255,0,0),2)
        #print c, match[k][i][j]
    salient = 0 
    salient_loc = []
    mean = np.mean(match)
    std = np.std(match)
    for i in range(nx):
        for j in range(ny):
            if abs(match[i][j] - mean) > 3*std: 
                salient += 1
                salient_loc.append(locPatch(img1, nx, ny, i, j))
    cv2.imwrite(os.path.join(conf['resultPath'],os.path.basename(imgPath)), img1)
    outputPath = os.path.join(conf['resultPath'],os.path.basename(imgPath))
    return salient, salient_loc, outputPath


def PCA(img_list):
    #print len(img_lists), len(img_lists[0]), len(img_lists[0][0])
    matrix = None
    for img in img_list:
        img = np.array(img)
        img = img.flatten()
        try:
            matrix = np.vstack((matrix, img))
        except:
            matrix = img
    # normalize first
    mean = np.mean(matrix, 0)
    matrix = matrix - np.tile(mean,(len(img_list),1))
    sigma = np.dot(matrix, matrix.T)
    
    #print matrix.shape
    #print np.mean(matrix, axis = 0).shape
    mean, eigenvectors = cv2.PCACompute(sigma, np.mean(sigma, axis=0).reshape(1,-1))
    k = 75
    U = eigenvectors[:,:k]
    res = np.dot(U, np.dot(U.T, matrix))
    print 'res shape: ',res.shape
    t = np.zeros([600,800])
    sub_h, sub_w = 60, 80
    c = 0
    for i in range(10):
        for j in range(10):
            a = res[c,:]
            cv2.normalize(a,a,0,255,cv2.NORM_MINMAX)
            #print a.astype(np.int)
            t[i*sub_h:(i+1)*sub_h,j*sub_w:(j+1)*sub_w] = a.reshape(60,80)
            c += 1
    t = t.astype(np.uint8)
    print t
    
    cv2.imshow('pca',t)
    while(True):
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
#==============================================================================
#     res = []
#     for i in range(eigenvectors.shape[0]):
#         res.append(eigenvectors[i,:].reshape(60,80))
#     
#     t = np.zeros([600,800])
#     #w, h = t.shape[1], t.shape[0]
#     c = 0
#     sub_h, sub_w = 60, 80
#     for i in range(10):
#         for j in range(10):
#             a = res[c]
#             cv2.normalize(a,a,0,255,cv2.NORM_MINMAX)
#             #print a.astype(np.int)
#             t[i*sub_h:(i+1)*sub_h,j*sub_w:(j+1)*sub_w] = a
#             c += 1
#     t = t.astype(np.uint8)
#==============================================================================
    return res
