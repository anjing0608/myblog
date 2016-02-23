var mongodb = require('./db');
var markdown = require('markdown').markdown;
var crypto = require('crypto');

function Post(name, title, post){
	this.name = name;
	this.title = title;
	this.post = post;
};
module.exports = Post;

//存储文章信息
Post.prototype.save = function(callback){
	var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
		date: date,
		year : date.getFullYear(),
      	month : date.getFullYear() + "-" + (date.getMonth() + 1),
      	day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      	minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      	date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
	}
	//存储文章信息
	var post = {
		name: this.name,
		title: this.title,
		time: time,
		post: this.post
	}
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		////读取 posts 集合
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//
			collection.insert(post, {
				safe: true
			}, function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

//读取文章信息
Post.getAll = function(name, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		//
		db.collection('posts', function(err, collection){
			if(err){
			mongodb.close();
			return callback(err);
			}
			var query = {};
      		if (name) {
        	query.name = name;
      		}
      		//解析markdown为html

      		//根据 query 对象查询文章
      		collection.find(query).sort({
        	time: -1
      		}).toArray(function (err, docs) {
        	mongodb.close();
        	if (err) {
          		return callback(err);//失败！返回 err
        	}
        	docs.forEach(function (doc){
      			doc.post = markdown.toHTML(doc.post);
      		});
        	callback(null, docs);//成功！以数组形式返回查询的结果
      });
    });
  });
}

//返回通过标题关键字查询的所有文章信息
Post.search =function(keywords, callback){
	//打开数据库
	mongodb.open(function(err, db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		//
		db.collection('posts', function (err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var pattern  = new RegExp(keywords, 'i');
			collection.find({
				'title': pattern
			},{
				'name': 1,
				'time': 1,
				'title': 1
			}).sort({
				time: -1
			}).toArray(function (err, docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
}

//获取一篇文章
Post.getOne = function(name, day, title, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取post集合
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
		}
		//根据 用户名，发布日期及文章名进行查询
      		collection.findOne({
        	"name": name,
        	"time.day": day,
        	"title": title
      		}, function (err, doc) {
        	mongodb.close();
        	if (err) {
          		return callback(err);//失败！返回 err
        	}
        	
      			doc.post = markdown.toHTML(doc.post);
      		
        	callback(null, doc);//成功！以数组形式返回查询的结果
      		});
		})
	})
}