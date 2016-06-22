var fs = require("fs");
var path = require("path");
var process = require("process");
var readLine = require('lei-stream').readLine;
var writeLine = require('lei-stream').writeLine;
var q = require('q');
var queue = require('queue-fun').Queue();
var _ = require('lodash');

var pattern = /(^[^#].+?)\s*/i

var output = writeLine("./result3.txt");

var oArr = [];


function getValue(key) {
    return _.result(_.find(oArr, 'key', key), 'value');
}


function processFile(pathname) {
    var deferred = q.defer();

    var input = readLine(pathname);

    var tmpArr = null;
    input.go(function (data, next) {

        var m = data.match(pattern);
        if (m != null) {
            tmpArr = data.split("=");
            oArr.push({
                'key': tmpArr[1],
                'value': tmpArr[0]
            });
        }
        input.next();

    }, function () {
        input.close();
        deferred.resolve(pathname + " process success");
    });

    return deferred.promise;
}

function processFile2(pathname) {
    var deferred = q.defer();

    var input = readLine(pathname);
    var tmpArr = null;
    input.go(function (data, next) {

        var m = data.match(pattern);
        if (m != null) {
            tmpArr = data.split("=");
            var v = getValue(tmpArr[1].replace('\r',''));
            if(v != undefined){
                data = tmpArr[0] + "=" + getValue(tmpArr[1].replace('\r',''));
            }else{
                data = tmpArr[0] + "=" + tmpArr[1].replace('\r','');
            }
            console.log(data);
        }
        output.write(data,next)

    }, function () {
        output.end(function () {
            console.log("process file end.")
        });
        input.close();
        output.close();
        deferred.resolve(pathname + " process success");
    });

    return deferred.promise;
}


function main() {

    var queues = new queue(1);

    queues.push(processFile, ["./result.txt"]).then();
    queues.push(processFile2, ["./en-message.txt"]).then();

    queues.start();
}

main();