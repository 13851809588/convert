var fs = require("fs");
var path = require("path");
var process = require("process");
var readLine = require('lei-stream').readLine;
var writeLine = require('lei-stream').writeLine;
var q = require('q');
var queue = require('queue-fun').Queue();
var _ = require('lodash');

var pattern = /(\d+,\d+)/i

var output = writeLine("./flow_new.xml");

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
            console.log(m[1]);
            tmpArr = m[1].split(",");
            tmpArr[0] = parseInt(tmpArr[0]) + 16;
            tmpArr[1] = parseInt(tmpArr[1]) + 16;
            data = data.replace(m[1],tmpArr[0]+"," + tmpArr[1]);
        }
        output.write(data,next)

    }, function () {
        input.close();
        deferred.resolve(pathname + " process success");
    });

    return deferred.promise;
}

function main() {

    var queues = new queue(1);
    queues.push(processFile, ["./flow.xml"]).then();
    queues.start();
}

main();