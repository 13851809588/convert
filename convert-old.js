var fs = require("fs");
var path = require("path");
var process = require("process");
var readLine = require('lei-stream').readLine;
var writeLine = require('lei-stream').writeLine;

var originDir = "d:";
var targetDir = "e:";

var fileArrs = [];

var pattern = /([\u4E00-\u9FA5]|[\uFE30-\uFFA0])+/gi;
var re1 = new RegExp("^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9])*$");

function travel(dir, callback) {
    mkdirsSync(dir.replace(originDir,targetDir));
    fs.readdirSync(dir).forEach(function (file) {
        var pathname = path.join(dir, file);

        if (fs.statSync(pathname).isDirectory()) {
            mkdirsSync(pathname.replace(originDir,targetDir));
            travel(pathname, callback);
        } else {
            callback(pathname);
        }
    });
}


function mkdirsSync(dirpath, mode) {
    if (!fs.existsSync(dirpath)) {
        var pathtmp;
        dirpath.split(path.sep).forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            }
            else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        });
    }
    return true;
}

function deleteDir(pathname) {
    pathname = pathname.replace(originDir,targetDir);
    var files = [];
    if( fs.existsSync(pathname) ) {

        files = fs.readdirSync(pathname);

        files.forEach(function(file,index){

            var curPath = pathname + "/" + file;
            if(fs.statSync(curPath).isDirectory()) {
                deleteDir(curPath);
            } else {
                fs.unlinkSync(curPath);
            }

        });

        fs.rmdirSync(pathname);

    }

}

function processFile(pathname){
    console.log("start process file[" + pathname + "]");

    var inputFile = pathname;
    var outputFile = pathname.replace(originDir,targetDir);

    var output = writeLine(outputFile);
    var input = readLine(inputFile);

    input.go(function(data,next){
        output.write(data,next)
    },function(){
        //console.log('end');
        output.end(function(){
           //printMemoryUsage();
        });
        input.close();
        output.close();
    });
}


function printMemoryUsage () {
    var info = process.memoryUsage();
    function mb (v) {
        return (v / 1024 / 1024).toFixed(2) + 'MB';
    }
    console.log('rss=%s, heapTotal=%s, heapUsed=%s', mb(info.rss), mb(info.heapTotal), mb(info.heapUsed));
}

function main() {
    var num = 0;
    var pathDir = 'd:\\test\\hawk';
    deleteDir(pathDir);
    travel(pathDir, function (pathname) {
        if(path.extname(pathname) == '.jsp' || path.extname(pathname) == '.java' || path.extname(pathname) == '.js'){
            processFile(pathname);
            num++;
        }
    });
    console.log(num++);

}

main();