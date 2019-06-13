const express = require("express");
const app = express();
const conf = require("./config");
const request = require("request");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const charset = require('superagent-charset');
const baseUrl = 'http://www.qqtn.com/'; 
const superagent = require('superagent');

app.use(express.static("img"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Content-Length, Authorization, Accept,X-Requested-With"
  );
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", "bmy");
  if (req.method == "OPTIONS") res.send(200);
  else next();
});

/**
 * 获取煎蛋网，段子内容
 * 访问地址：http://127.0.0.1:8080/index?page=70
 * 获取段子评论：http://jandan.net/tucao/3984420
 */
app.get("/index", function(req, res) {
  let URL = null, pageid = req.query.page;
  req.query.page >= 0 ? URL = `${conf.IndexUrl}/page-${pageid}` :  URL =  `${conf.IndexUrl}`
  console.log(URL)
  request(URL, function(error, response, body) {
    const $ = cheerio.load(body);
    let list = $(".commentlist li");
    let dzlist = [];
    list.each(function(index, ele) {
      dzlist.push({
        id: index + 1,
        posid: $(this).find(".text a").text(),
        author: $(this).find(".author strong").text(),
        photo: `${conf.domain}${index + 1}.jpg`,
        like: $(this).find(".tucao-like-container span").text(),
        unlike: $(this).find(".tucao-unlike-container span").text(),
        content: $(this).find(".text p").text()
      });
    });
    // 像前端输出json数据
    res.json({
      status: 200,
      maxPage: (($(".cp-pagenavi .current-comment-page").text()).replace(/[^0-9]/ig,"")).substring(0,2),
      datas: dzlist
    });
  });
});

/**
 * 获取对应段子的评论
 * 访问地址：http://127.0.0.1/tucao?postid=3986571
 */
app.get("/tucao", function(req, res) {
  let postid = req.query.postid;
  request(`${conf.TuCaoUrl}${postid}`, function(error, response, body) {
    res.json(JSON.parse(body));
  });
});

/**
 * 实现发布新的段子内容
 * 访问地址：http://127.0.0.1/comment
 */
app.post("/comment", function(req, res) {
  var formData = {
    author: req.body.author,
    email: req.body.email,
    comment: req.body.comment,
    comment_post_ID: "55592"
  };

  request.post(
    { url: `${conf.CommentUrl}`, formData: formData },
    function optionalCallback(err, httpResponse, body) {
      if (err) {
        return console.error("upload failed:", err);
      }
      res.json({
        status: "200",
        postid: body
      });
    }
  );
});


app.post("/SetPostcomment", function(req, res) {
  var formData = {
    author: req.body.author,
    email: req.body.email,
    content: req.body.comment,
    comment_id: req.body.postid
  };


  request.post(
    { url: `${conf.TuCaoComment}`, formData: formData },
    function optionalCallback(err, httpResponse, body) {
      if (err) {
        return console.error("upload failed:", err);
      }
      res.json({
        status: "200",
        postid: JSON.parse(body)
      });
    }
  );
});

/**
 * 实现对段子文章的点赞
 * 访问地址：http://127.0.0.1/like
 */
app.post("/like", function(req, res) {
  // 前端传过来的操作类型，like 表示喜欢，其他都是不喜欢
  let type = req.body.type
  var formData = {
    comment_id: req.body.postid,
    data_type: "comment"
  };
  
  if(type == "like"){
    formData.like_type = "pos"
  }else {
    formData.like_type = "neg"
  }

  request.post(
    { url: `${conf.LikeUrl}`, formData: formData },
    function optionalCallback(err, httpResponse, body) {
      if (err) {
        return console.error("upload failed:", err);
      }
      res.json({
        status: "200",
        postid: body
      });
    }
  );
});


/**
 * 获取快手主播主页的视频数据
 */
app.get("/profile", function(req, res) {
  var userid = req.query.userid;

  request(`${conf.kuaiShou}${userid}`, function(error, response, body) {
      var data = body.match(/VUE_MODEL_INIT_STATE\[\'profileGallery\'\]=([\s\S]*?);/)[1]
      res.json(JSON.parse(data))
  })
})

app.get('/picture', function(req, res) {
  //类型
  charset(superagent);
  var type = req.query.type;
  //页码
  var page = req.query.page;
  type = type || 'weixin';
  page = page || '1';
  var route = `tx/${type}tx_${page}.html`
     
  superagent.get(baseUrl + route)
      .charset('gb2312')
      .end(function(err, sres) {
          var items = [];
          if (err) {
              console.log('ERR: ' + err);
              res.json({ code: 400, msg: err, sets: items });
              return;
          }
          var $ = cheerio.load(sres.text);
          $('div.g-main-bg ul.g-gxlist-imgbox li a').each(function(idx, element) {
              var $element = $(element);
              var $subElement = $element.find('img');
              var thumbImgSrc = $subElement.attr('src');
              items.push({
                  title: $(element).attr('title'),
                  href: $element.attr('href'),
                  src: thumbImgSrc
              });
          });
          res.json({ code: 200, msg: "", data: items });
      });
});

app.listen(8080, function() {
  console.log("Example app listening on port 8080!");
});
