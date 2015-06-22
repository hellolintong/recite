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
    this.index = 0;
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
ShanbayApp.factory("Category", ["$http", function ($http) {
    var category = new HttpService();
    category.url = "/api/category/";
    category.indexUrl = "/api/set_index/";
    category.getIndexArgs = {category_id: ""};
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

/*
*索引
*/
ShanbayApp.factory("WordIndex", ["$http", function ($http) {
    var index = new HttpService();
    index.url = "/api/set_index/";
    index.getArgs = {category_id: ""};
    index.postArgs = {category_id: "", index: ""};
    index.$http = $http;
    return index;
}]);

/*
* 当前背诵目录
*/
ShanbayApp.factory("ReciteCategory", ["$http", function ($http){
    var reciteCategory = new HttpService();
    reciteCategory.url = "/api/recite_category/";
    reciteCategory.postArgs = {category_id: ""};
    reciteCategory.$http = $http;
    return reciteCategory;
}]);
