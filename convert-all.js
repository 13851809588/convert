var fs = require("fs");
var path = require("path");
var process = require("process");
var readLine = require('lei-stream').readLine;
var writeLine = require('lei-stream').writeLine;
var q = require('q');
var queue = require('queue-fun').Queue();
var _=require('lodash');

var originDir = "d:";
var targetDir = "f:";
var pathDir = 'd:\\test\\gui\\hawk';

//var pattern = /([\u4E00-\u9FA5]|[\uFE30-\uFFA0])+/gi;
//var pattern = /\"([^\"][\u4E00-\u9FA5]|[^\"][\uFE30-\uFFA0])+\"|\'([^\'][\u4E00-\u9FA5]|[^\'][\uFE30-\uFFA0])+\'|>([^<>][\u4E00-\u9FA5]|[^<>][\uFE30-\uFFA0])+</gi;
var fmtPattern = /<fmt:message\s*key=[\'|\"]([\u4E00-\u9FA5]+.*?)[\'|\"]\s*\/\s*>/i;
//var fmtPattern = /(?<=<fmt:message\s*key=\[\'|\"])([\u4E00-\u9FA5]+.*?)(?=[\\'|\\"]\s*\/\s*>)/i;
var htmlPattern = /<[^>]*>([^>]*[\u4E00-\u9FA5]+[^>]*)<\/[^>]*>/i;
var p = /title=\s*\"([\u4E00-\u9FA5]+)\"\s*/i;

var javaPattern = /messageSource\.getMessage\(\"(.*?)\"/i;
var jp = /(RequestContextUtils\.getLocale\(request\))/i;


var outputResult = null;
var outputMsg = null;
var outputAppMsg = null;

var msg = [
    {
        'key':'新增',
        'value':'common.button.add'
    },
    {
        'key':'删除',
        'value':'common.button.del'
    },
    {
        'key':'修改',
        'value':'common.button.modify'
    },
    {
        'key':'关闭',
        'value':'common.button.close'
    },
    {
        'key':'提交',
        'value':'common.button.submit'
    },
    {
        'key':'取消',
        'value':'common.buttion.cancel'
    },
    {
        'key':'返回',
        'value':'common.button.back'
    },
    {
        'key':'查询',
        'value':'common.button.search'
    },
    {
        'key':'清空',
        'value':'common.button.clear'
    },
    {
        'key':'导出',
        'value':'common.button.export'
    },
    {
        'key':'添加',
        'value':'common.button.append'
    },
    {
        'key':'下载',
        'value':'common.button.download'
    },
    {
        'key':'降序',
        'value':'common.page.desc'
    },
    {
        'key':'升序',
        'value':'common.page.asc'
    },
    {
        'key':'排序方式',
        'value':'common.page.sortmethod'
    },
    {
        'key':'排序字段',
        'value':'common.page.sortfield'
    },
    {
        'key':'选择日期',
        'value':'common.page.selectdate'
    },
    {
        'key':'开始时间',
        'value':'common.page.starttime'
    },
    {
        'key':'终止时间',
        'value':'common.page.endtime'
    },
    {
        'key':'操作',
        'value':'common.table.oper'
    },
    {
        'key':'必填项',
        'value':'common.valid.required'
    },
    {
        'key':'描述',
        'value':'common.desc'
    },
    {
        'key':'是',
        'value':'common.option.yes'
    },
    {
        'key':'否',
        'value':'common.option.no'
    },
    {
        'key':'查询条件',
        'value':'common.searchcondition'
    },
    {
        'key':'参数绑定错误!',
        'value':'common.param.bind'
    },
    {
        'key':'序号',
        'value':'common.table.no'
    }
];

function getValue(key){
    return _.result(_.find(msg, 'key', key), 'value');
}



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

function processFile(pathname,type){
    var deferred = q.defer();

    var inputFile = pathname;
    var outputFile = pathname.replace(originDir,targetDir);

    var output = writeLine(outputFile);
    var input = readLine(inputFile);

    var keyname = parseFilename(pathname,type);
    var no = 1;
    var value = "";

    outputResult.write("\n#===========================" + outputFile + "===========================");
    if(type == 1){
        outputMsg.write("\n#===========================" + outputFile + "===========================");
    }else if(type ==2){
        outputAppMsg.write("\n#===========================" + outputFile + "===========================");
    }
    input.go(function(data,next){
        if(type == 1){
            var m = data.match(fmtPattern);
            if(m != null){
                //outputResult.write(data);
                value = getValue(m[1]);
                if(value != undefined){
                    data = data.replace(m[1],value);
                    no++;
                }else{
                    outputMsg.write(keyname +"." + no + "=" + m[1]);
                    data = data.replace(m[1],keyname+"." + no);
                    no++;
                }
            }
            var m = data.match(fmtPattern);
            if(m != null){
                //outputResult.write(data);
                value = getValue(m[1]);
                if(value != undefined){
                    data = data.replace(m[1],value);
                }else{
                    outputMsg.write(keyname +"." + no + "=" + m[1]);
                    data = data.replace(m[1],keyname+"." + no);
                }
                no++;
            }
            var m = data.match(htmlPattern);
            if(m != null){
                outputMsg.write(keyname +"." + no + "=" + m[1]);
                data = data.replace(m[1],"<fmt:message key='" +  keyname + "." + no + "'/>");
                no++;
            }
            var m = data.match(p);
            if(m != null){
                value = getValue(m[1]);
                if(value != undefined){
                    data = data.replace(m[1],"<fmt:message key='" +  value + "'/>");
                }else{
                    outputMsg.write(keyname +"." + no + "=" + m[1]);
                    data = data.replace(m[1],"<fmt:message key='" +  keyname + "." + no + "'/>");
                }
                no++;
            }

        }else if(type == 2){

            var m = data.match(javaPattern);
            if(m != null){
                value = getValue(m[1]);
                if(value != undefined){
                    data = data.replace(m[1],value);
                }else{
                    outputAppMsg.write(keyname +"." + no + "=" + m[1]);
                    data = data.replace(m[1],keyname+"." + no);
                }
                no++;

            }
            var m = data.match(jp);
            if(m != null){
                data = data.replace(m[1],"null");
                //no++;
            }
        }
        output.write(data,next)

    },function(){
        output.end(function(){
           //printMemoryUsage();
        });
        input.close();
        output.close();
        deferred.resolve(pathname + " process success");
    });

    return deferred.promise;
}

function parseFilename(filePath,type){
    var filePathObj = path.parse(filePath);
    var pathDirArr = (filePathObj.dir).split(path.sep);
    var result = "";
    var len = pathDirArr.length;
    if(type == 1){//jsp or js file
        result = "web." + pathDirArr[len-1] + "."  + filePathObj.name;
    }else if(type == 2){ //java file
        result = "app." + pathDirArr[len-1] + "."  + filePathObj.name;
    }
    return result;
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
    var queues = new queue(1);

    deleteDir(pathDir.replace(originDir,targetDir));

    mkdirsSync(pathDir.replace(originDir,targetDir));
    outputResult = writeLine(path.join(pathDir.replace(originDir,targetDir),"result.txt"));
    outputMsg = writeLine(path.join(pathDir.replace(originDir,targetDir),"web-message.txt"));
    outputAppMsg = writeLine(path.join(pathDir.replace(originDir,targetDir),"app-message.txt"));

    _.forEach(msg,function(v,k){
       outputMsg.write(v.value + "=" + v.key);
    });

    travel(pathDir, function (pathname) {
        if(path.extname(pathname) == '.jsp' ){
            queues.push(processFile,[pathname,1]).then();
            num++;
        }
        if(path.extname(pathname) == '.java' ){
            queues.push(processFile,[pathname,2]).then();
            num++;
        }
        if(path.extname(pathname) == '.js' ){
            queues.push(processFile,[pathname,3]).then();
            num++;
        }
    });

    queues.start();
    console.log(num++);

}

main();