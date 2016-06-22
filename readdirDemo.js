/**
 * Created by yanjun on 2016/5/11.
 */
var fs = require('fs');

//经典的callback写法
function getBlogList1(blogDir,callback) {
    fs.readdir(blogDir, function (err, files) {
        if(err){
            callback(err);
            return;
        }
        
        var blogList = [];
        if (files && files.length) {
            files.forEach(function (filename) {
                //split file name and generate url...
                //...
                //create a blogItem { title: blogTitle, url: blogUrl }
                blogList.push(filename);
            });
        }
        callback(null,blogList);
    });
}

// 使用方法

getBlogList1("/",function(err, blogList){
    //这里就可以用 blogList
    console.log(JSON.stringify(blogList));
})

// 第二种写法，Promise
function getBlogList2(blogDir) {
    return new Promise(function(resolve,reject){
        fs.readdir(blogDir, function (err, files) {
            if(err) reject(err);
            var blogList = [];
            if (files && files.length) {
                files.forEach(function (filename) {
                    //split file name and generate url...
                    //...
                    //create a blogItem { title: blogTitle, url: blogUrl }
                    blogList.push(filename);
                });
            }
            resolve(blogList);
        });
    })
}

// 使用方法

var bloglistP= getBlogList2("/");
bloglistP.then(function(blogList){
    //这里就可以用 blogList
    console.log(JSON.stringify(blogList));
})


// 第三种写法，生成器yield模式，需要co或者koa来配合，需要node>=0.11.0
var co=require("co"),thunkify=require("thunkify");
var readdir= thunkify(fs.readdir);
function* getBlogList3(blogDir) {
    var files= yield readdir(blogDir);
    var blogList = [];
    if (files && files.length) {
        files.forEach(function (filename) {
            //split file name and generate url...
            //...
            //create a blogItem { title: blogTitle, url: blogUrl }
            blogList.push(filename);
        });
    }
    return blogList;
}

//使用方法
co(function*(){
    //这里就可以用 blogList
    var blogList=yield getBlogList3("/");
    console.log(JSON.stringify(blogList));
});
