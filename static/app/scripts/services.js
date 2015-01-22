/**
 * Created by lintong on 2015/1/12.
 */
/**
 *
 * 因为调用地址和调用参数需要在使用的时候指定，所以作为对象的成员变量，而整个http通信过程可以做成一个统一的函数，所以写成了原型的函数
 *
 */
function HttpService() {
    this.url = "";
    this.getArgs = {};
    this.postArgs = {};
    this.get = function (successCallback, errorCallback) {
        this._get(this.url, this.getArgs, successCallback, errorCallback);
    };
    this.post = function (successCallback, errorCallback) {
        this._post(this.url, this.postArgs, successCallback, errorCallback);
    };
}

HttpService.prototype.$http = null;
HttpService.prototype._get = function (url, params, successCallback, errorCallback) {
    this.$http({method: "GET", url: url, params: params})
        .success(function (data, status, headers, config) {
            successCallback(data, status, headers, config);
        })
        .error(function (data, status, headers, config) {
            errorCallback(data, status, headers, config);
        });
};

HttpService.prototype._post = function (url, data, successCallback, errorCallback) {
    this.$http({method: "POST", url: url, data: data})
        .success(function (data, status, headers, config) {
            successCallback(data, status, headers, config);
        })
        .error(function (data, status, headers, config) {
            errorCallback(data, status, headers, config);
        });
};


/*
 * 目录
 */
ShanbayApp.factory("Categroy", ["$http", function ($http) {
    var category = new HttpService();
    category.url = "/api/category/";
    category.getArgs = {};
    category.$http = $http;
    return category;
}]);

/*
 *单词
 */
ShanbayApp.factory("Word", ["$http", function ($http) {
    var word = new HttpService();
    word.url = "/api/word/";
    word.getArgs = {category: ""};

    word.$http = $http;
    return word;
}]);