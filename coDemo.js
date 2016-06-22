/**
 * Created by yanjun on 2016/5/11.
 */

var co = require('co');

function func1() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve('/home/ben');
        }, 1000);
    });
}

function func2() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve('/home/ben');
        }, 1000);
    });
}

function func3() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve('/home/ben');
        }, 1000);
    });
}

function func4(name) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(name);
        }, 1000);
    });
}

co(function *(){
    var a = func1();
    var b = func2();
    var c = func3();
    var d = Promise.resolve('/usr/local');
    var res = yield[a,b,c,d];
    console.log(res);
}).catch(onerror);


co(function *(){
    var res = yield {
        1:func1(),
        2:func2(),
        3:func3(),
        4:Promise.resolve('/usr/bin')
    };
    console.log(res);
}).catch(onerror);

function onerror(err){
    console.error(err.stack);
}

// a promise
co(function* () {
    return yield Promise.resolve(true);
}).then(function (val) {
    console.log(val);
}, function (err) {
    console.error(err.stack);
});

co(function* () {
    return func1();
}).then(function (val) {
    console.log(val);
}, function (err) {
    console.error(err.stack);
});


var fn = co.wrap(function* (val) {
    return yield Promise.resolve(val);
});

fn(true).then(function (val) {
    console.log(val);
});


fn = co.wrap(function* (val) {
    return func4(val);
});

fn('test').then(function (val) {
    console.log(val);
});