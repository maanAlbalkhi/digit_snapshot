#!/usr/bin/env python
# coding: utf-8

# In[1]:


import os
import shutil
import random
import numpy as np

from PIL import Image


# In[2]:


WORKING_DIR = '/home/maan/BA/code'
os.chdir(WORKING_DIR)

ROOT_DIR= 'DATA/SERVER'
DATA_DIR = f'{ROOT_DIR}/origin_data'


# In[3]:


empty_images = dict()

for user in os.listdir(DATA_DIR):
    user_path = f'{DATA_DIR}/{user}'
    
    user_empty_images = dict()
    
    for _cls in os.listdir(user_path):
        cls_path = f'{user_path}/{_cls}'
        
        cls_empty_images = []
        
        for file in os.listdir(cls_path):
            
            img = Image.open(f'{cls_path}/{file}')
            img = np.asarray(img)
            img = img[:, :, 3]
            
            if img.mean() == 0:
                cls_empty_images.append(file)
        
        if cls_empty_images:
            user_empty_images[_cls] = cls_empty_images
    
    if user_empty_images:
        empty_images[user] = user_empty_images


# In[4]:


print(empty_images)


# In[5]:


for user, classes in empty_images.items():
    user_path = f'{DATA_DIR}/{user}'
    
    for _cls, images in classes.items():
        cls_path = f'{user_path}/{_cls}'
        
        """ REMOVE EMPTY IMAGES """
        for img in images:
            img_path = f'{cls_path}/{img}'
            os.remove(img_path)
        
        """ REDORDER IMAGES NAMES """
        # create tmp folder
        tmp_cls_path = f'{cls_path}_TMP'
        shutil.rmtree(tmp_cls_path, ignore_errors=True)
        os.mkdir(tmp_cls_path)
        
        # get images names in ascending order
        class_images = os.listdir(cls_path)
        class_images = sorted(class_images, key=lambda file: int(''.join(filter(str.isdigit, file))))
        
        # copy to TMP folder
        for i, cls_image in enumerate(class_images):
            shutil.copyfile(f'{cls_path}/{cls_image}', f'{tmp_cls_path}/{i}.png')
        
        shutil.rmtree(cls_path, ignore_errors=True)
        os.rename(tmp_cls_path, cls_path)

