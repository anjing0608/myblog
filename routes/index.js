var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var express = require('express');
var router = express.Router();
// var mongoose = require('mongoose');
var user = require('../models/user').user;
// mongoose.connect('mongodb://localhost:27017/myblog');

// req.query： 处理 get 请求，获取 get 请求参数
// req.params： 处理 /:xxx 形式的 get 或 post 请求，获取请求参数
// req.body： 处理 post 请求，获取 post 请求体
// req.param()： 处理 get 和 post 请求，但查找优先级由高到低为 req.params→req.body→req.query


/* GET home page. */
router.get('/', function(req, res) {
  Post.getAll(null, function (err, posts) {
    if (err) {
      posts = [];
    } 
    res.render('index', {
      title: '主页',
      user: req.session.user,
      posts: posts,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

/*archive*/
router.get('/archive', checkLogin);
router.get('/archive', function(req, res) {
  res.render('archive', { 
    title: '存档',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
  });
});

/*tags*/
router.get('/tags', function(req, res) {
  res.render('tags', { title: '标签',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
   });
});

/*music*/
router.get('/music', function(req, res) {
  res.render('music', { 
    title: '我的音乐',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
   });
});

/*links*/
router.get('/links', function(req, res) {
  res.render('links', { 
    title: '友情链接',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
   });
});

/*upload*/
router.get('/upload', checkLogin);
router.get('/upload', function(req, res) {
  res.render('upload', { 
    title: '上传',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
 });
});
router.post('/upload', checkLogin);
router.post('/upload', function(req, res) {
  req.flash('success', '文件上传成功！');
  res.redirect('/upload');

});

router.get('/u/:name', function (req, res) {
  //检查用户是否存在
  User.get(req.params.name, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在!'); 
      return res.redirect('/');//用户不存在则跳转到主页
    }
    //查询并返回该用户的所有文章
    Post.getAll(user.name, function (err, posts) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      } 
      res.render('user', {
        title: user.name,
        posts: posts,
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      });
    });
  }); 
});

router.get('/u/:name/:day/:title', function (req, res) {
  Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    res.render('article', {
      title: req.params.title,
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

/*post*/
router.get('/post', checkLogin);
router.get('/post', function(req, res) {
  res.render('post', { 
title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
  });
});
router.post('/post', checkLogin);
router.post('/post', function(req, res) {
  var currentUser = req.session.user,
      post = new Post(currentUser.name, req.body.title, req.body.post);
  post.save(function (err) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    req.flash('success', '发布成功!');
    res.redirect('/');//发表成功跳转到主页
  });
});

/*search*/
router.get('/search', function(req, res){
  Post.search(req.query.keywords, function(err, posts){
    if(err){
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('search', {
      title: "search:" + req.query.keywords,
      posts:posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

/*logout*/
router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
  req.session.user = null;
  req.flash('success', '登出成功!');
  res.redirect('/');//登出成功后跳转到主页
});


/*login*/
router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
  res.render('login', {
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()});
});
router.post('/login', checkNotLogin);
router.post('/login', function (req, res) {
  //生成密码的 md5 值
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  //检查用户是否存在
  User.get(req.body.name, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在!'); 
      return res.redirect('/login');//用户不存在则跳转到登录页
    }
    //检查密码是否一致
    if (user.password != password) {
      req.flash('error', '密码错误!'); 
      return res.redirect('/login');//密码错误则跳转到登录页
    }
    //用户名密码都匹配后，将用户信息存入 session
    req.session.user = user;
    req.flash('success', '登陆成功!');
    res.redirect('/');//登陆成功后跳转到主页
  });
});
/*reg*/
router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
  res.render('reg', { 
    title: '注册',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
   });
});
router.post('/reg', function (req, res) {
  var name = req.body.name,
      password = req.body.password,
      password_re = req.body['password-repeat'];
  //检验用户两次输入的密码是否一致
  if (password_re != password) {
    req.flash('error', '两次输入的密码不一致!'); 
    return res.redirect('/reg');//返回注册页
  }
  //生成密码的 md5 值
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  var newUser = new User({
      name: name,
      password: password,
      email: req.body.email
  });
  //检查用户名是否已经存在 
  User.get(newUser.name, function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (user) {
      req.flash('error', '用户已存在!');
      return res.redirect('/reg');//返回注册页
    }
    //如果不存在则新增用户
    newUser.save(function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');//注册失败返回主册页
      }
      req.session.user = newUser;//用户信息存入 session
      req.flash('success', '注册成功!');
      res.redirect('/');//注册成功后返回主页
    });
  });
});
function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录!'); 
      res.redirect('/login');
    }
    next();
  }

  function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录!'); 
      res.redirect('back');
    }
    next();
  }
module.exports = router;