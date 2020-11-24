import os
import io
import random
import pandas as pd

from PIL import Image

from flask import Flask, request, jsonify


DATA_FOLDER = '../../data'
MAX_COUNT_PER_DIGIT = 100
MAX_COUNT_ALL = MAX_COUNT_PER_DIGIT * 10
IMAGE_PREFIX = 'png'

classes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
columns = (['user'] + classes)

data_stats = pd.DataFrame(columns=columns)

for user in os.listdir(DATA_FOLDER):
	
	row = {}
	row['user'] = user
	
	for _cls in os.listdir(f'{DATA_FOLDER}/{user}'):
		cls_path = f'{DATA_FOLDER}/{user}/{_cls}'
		row[_cls] = len(os.listdir(cls_path))
		
	data_stats = data_stats.append(row, ignore_index=True)


""" FLASK CONFIG """

app = Flask(__name__)
app.config['DEBUG'] = True
PORT = 9315
HOST = '0.0.0.0'

""" ################### """



""" ##### BEGIN FUNCTIONS ##### """

def get_next_random_num(user: str):

	global data_stats
	
	user_stats = data_stats[data_stats.user == user]

	non_full_classes = []

	for _cls in classes:
		if user_stats[_cls].iloc[0] < MAX_COUNT_PER_DIGIT:
			non_full_classes.append(_cls)

	return random.choice(non_full_classes)


def create_new_user(user: str):

	global data_stats

	os.mkdir(f'{DATA_FOLDER}/{user}')

	for _cls in classes:
		os.mkdir(f'{DATA_FOLDER}/{user}/{_cls}')

	data_stats = data_stats.append({'user':user,
		'0':0, '1':0, '2':0, '3':0, '4':0, '5':0, '6':0, '7':0, '8':0, '9':0},
		ignore_index=True)


def calculate_count(user: str):
	global data_stats

	user_dict = data_stats[data_stats.user == user].to_dict('records')[0]
	count = 0
	for _cls in classes:
		count += user_dict[_cls]

	return count

""" ##### END FUNCTIONS ##### """



@app.route('/new_user', methods=['GET'])
def new_user():
	first_name = request.args.get('first_name')
	last_name = request.args.get('last_name')
	
	user = f'{first_name}_{last_name}'

	if not first_name or not last_name:
		response = jsonify({'message':'no first or last name'})
		response.status = '400'
		return response


	global data_stats

	if user not in list(data_stats.user):
		create_new_user(user)

	response = jsonify(data_stats[data_stats.user == user].to_dict('records')[0])
	response.status = '200'
	return response


@app.route('/save/<string:user>/<string:img_cls>', methods=['POST'])
def save(user, img_cls):

	if not user:
		response = jsonify({'message':'no user provided'})
		response.status = '400'
		return response

	if not img_cls:
		response = jsonify({'message':'no image class provided'})
		response.status = '400'
		return response

	global data_stats

	if user not in list(data_stats.user):
		create_new_user(user)

	user_stats = data_stats[data_stats.user == user]
	count = user_stats[img_cls].iloc[0]
	save_path = f'{DATA_FOLDER}/{user}/{img_cls}/{count}.{IMAGE_PREFIX}'

	file = request.files['image']
	# file.save(save_path)
	img = Image.open(file.stream)
	img.save(save_path, IMAGE_PREFIX)

	data_stats.at[user_stats.index[0], img_cls] = count + 1

	next_number = get_next_random_num(user)
	response = jsonify({'next_number':next_number, 'current_count':calculate_count(user), 'max_needed':MAX_COUNT_ALL})
	response.status = '200'
	
	return response


@app.route('/next_number/<string:user>', methods=['GET'])
def next_number(user):
	
	if not user:
		response = jsonify({'message':'no user provided'})
		response.status = '400'
		return response

	global data_stats

	if user not in list(data_stats.user):
		create_new_user(user)

	next_number = get_next_random_num(user)
	response = jsonify({'next_number':next_number, 'current_count':calculate_count(user), 'max_needed':MAX_COUNT_ALL})
	response.status = '200'
	
	return response


if __name__ == '__main__':
	app.run(host=HOST, port=PORT)
