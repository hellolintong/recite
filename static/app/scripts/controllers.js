/** * Created by lintong on 2015/1/12.
 */
var ShanbayApp = angular.module("ShanbayApp", []);

ShanbayApp.controller("ShanbayController", ["$scope", "$document", "Category", "Word", "WordIndex", "ReciteCategory", "ErrorWord", function ($scope, $document, Category, Word, WordIndex, ReciteCategory, ErrorWord) {
    //单词目录对象，key为category_id，value为对应的单词列表
    $scope.CategoryObj = {
    };
    //当前正在背诵的单词列表
    $scope.curWordListObj = {
    };
    //scope私有函数
    $scope.private = {
    };

    //背诵的目录
    $scope.reciteCategoryId = 0;

    /*************单词列表对象*********************/
    function WordList(category_id, category_name){
        this.category_id = category_id;
        this.category_name = category_name;
        this.wordList = [];
        this.wordIndex = -1;
        this.originalWordIndex = -1;
        this.repeatNum = 0;
        this.intervalFunc = null;
        this.finishNum = 0;
        this.initIndex =0;//初始的索引
        this.repeatFlag = false;
    }

    WordList.prototype.addIndex = function(){
        this.wordIndex = (this.wordIndex + 1) % this.wordList.length;
    };

    WordList.prototype.delIndex = function(){
        this.wordIndex -= 1;
        if(this.wordIndex < 0){
            this.wordIndex = this.wordList.length - 1;
        }
    };

    WordList.prototype.shieldWord = function(word){
        if (word.length < 4) {
            return "";
        }
        var charArray = [];
        for (var i = 0; i < word.length; ++i) {
            charArray.push(word.charAt(i));
        }

        var shieldNum = parseInt(Math.random() * (word.length - 1));
        if (shieldNum < word.length / 2) {
            shieldNum = word.length / 2 + 1;
        }

        for (i = 0; i < shieldNum; ++i) {
            var j = parseInt(Math.random() * (charArray.length - 1));
            while (charArray.indexOf(j) == "_.") {
                j = (++j) % charArray.length;
            }
            charArray[j] = "_.";
        }
        return charArray.join("");
    };

    WordList.prototype.setShield = function(){
        var word = this.getWord();
        word["hint"] = this.shieldWord(word["english"]);
        //当单词背诵错误的适合，hint会显示单词，所以要先将hint备份一下
        word["originalHint"] = word["hint"];
    };

    WordList.prototype.getWord = function () {
      return this.wordList[this.wordIndex];
    };

    //重置hint
    WordList.prototype.resetHint = function(){
        var word = this.getWord();
        if (word["hint"] == word["english"]) {
            word["hint"] = word["originalHint"];
        }
    };

    //将hint设置为单词，这样能提示用户
    WordList.prototype.setHint = function(){
        var word = this.getWord();
        word["hint"] = word["english"];
    };

    WordList.prototype.checkValue = function(word){
        var curWord = $scope.curWordListObj.getWord();
        return word == curWord["english"];
    };
    WordList.prototype.addFinishNum = function(){
        this.finishNum += 1;
        if(this.finishNum == this.wordList.length){
            this.finishNum = 0;
        }
        //每单元只有100个单词
        if(this.finishNum == 100){
            this.wordIndex = this.initIndex;
            this.repeatFlag = true;
            this.finishNum = 0;
        }
    };
    WordList.prototype.reset = function(){
        this.finishNum = 0;
        this.repeatNum = 0;
        this.repeatFlag = false;
        this.wordIndex = this.initIndex;
    };
    WordList.prototype.nextUnit = function(){
        if(this.repeatFlag == false){
            return false;
        }
        this.initIndex = (this.initIndex + 100)% this.wordList.length;
        this.reset();
        return true;
    };

    WordList.prototype.lastUnit = function(){
        this.initIndex -= 100;
        if(this.initIndex < 0){
            this.initIndex = 0;
        }
        this.reset();
    };

    WordList.prototype.addRepeat = function(){
        this.repeatNum = (this.repeatNum + 1) % 3;
    };

    WordList.prototype.needRepeat = function(){
        return this.repeatNum != 2;
    }


/***********scope相关方法*************/
    //获取正在背诵的单词
    $scope.private.getReciteCategory = function(){
        ReciteCategory.get(
             function(data, status, headers, config){
                 $scope.reciteCategoryId = data["recite_category_id"];
                 $scope.reciteWords($scope.reciteCategoryId);
             },
             function(data, status, headers, config){
             }
        );
    };

    //发送用户当前正在背诵的词库信息
    $scope.private.postReciteCategory = function () {
        ReciteCategory.postArgs["category_id"] = $scope.reciteCategoryId;
        ReciteCategory.post(
            function(data, status, headers, config){
            },
            function(data, status, headers, config){}
        )
    };

   //根据词库id获取单词列表
    $scope.private.getWordList = function (category_id) {
        document.getElementById("startReciteBtn").click();
        //单词列表为空，或者是错误单词背诵则去后台获取数据
        if($scope.CategoryObj[category_id].wordList.length == 0 || $scope.CategoryObj[category_id].category_id == "22"){
            var category_name = $scope.CategoryObj[category_id].category_name;
            $scope.curWordListObj = $scope.CategoryObj[category_id];
            $scope.CategoryObj[category_id].category_name = "后台正在获取数据，请耐心等待...";
            Word.getArgs["category_id"] = category_id;
            Word.get(
                function (data, status, headers, config) {
                    if(data.length == 0){
                        $scope.CategoryObj[category_id].wordList = [];
                        $scope.CategoryObj[category_id].category_name = category_name;
                    }
                    else{
                        $scope.CategoryObj[category_id].wordList = data;
                        $scope.CategoryObj[category_id].category_name = category_name;
                        //获取上次背诵的位置
                        WordIndex.getArgs["category_id"] = category_id;
                        WordIndex.get(
                            function(data, status, headers, config){
                                $scope.CategoryObj[category_id].wordIndex = data["index"] - 1;
                                $scope.CategoryObj[category_id].initIndex = data["index"] - 1;
                                $scope.private.play(1);
                            },
                            function(data, status, headers, config){
                            }
                        );
                    }
                },
                function (data, status, headers, config) {
                }
            );
        }
        else{
            $scope.curWordListObj = $scope.CategoryObj[category_id];
            $scope.private.play(1);
        }

    };

    //发送当前索引
    $scope.private.postIndex = function(){
        WordIndex.postArgs["category_id"] = $scope.curWordListObj.category_id;
        WordIndex.postArgs["index"] = $scope.curWordListObj.wordIndex;
        WordIndex.post(function(data, status, headers, config){
            },
            function (data, status, headers, config) {
            }
        );
    }

    //获取单词，distance标志表示获取前一个还是后一个
    $scope.private.play = function(distance) {
        if(distance > 0){
            $scope.curWordListObj.addIndex();
        }
        else{
            $scope.curWordListObj.delIndex();
        }
        $scope.curWordListObj.setShield();
        var player = document.getElementById("player");
        var word = $scope.curWordListObj.getWord();
        player.src = "/static/sound/" + word["sound"];
        document.getElementById("wordInput").value = "";
        $scope.private.focus();
        player.play();
        return true;
    }

    //将光标设置到input末尾
    $scope.private.focus = function(){
        var input = document.getElementById("wordInput");
        var val = input.value; //store the value of the element
        input.value = val.slice(0, input.value.length - 1); //set that value back.
        input.focus();
    }


    //从服务器获取所有词库信息
    $scope.getCategoryList = function () {
        Category.get(
            function (data, status, headers, config) {
                for(var i = 0; i < data.length; ++i){
                    $scope.CategoryObj[data[i].category_id] = new WordList(data[i].category_id, data[i].category_name);
                }
            },
            function (data, status, headers, config) {
            }
        )
    };

    //根据词库的id背诵单词
    $scope.reciteWords = function (category_id) {
        if(!category_id) {
            return;
        }
        $scope.private.getWordList(category_id);
        if($scope.curWordListObj.category_id != "22"){
            $scope.reciteCategoryId = category_id;
        }
        $scope.private.postReciteCategory();
    };


    //播放声音
    $scope.playSound = function () {
        var player = document.getElementById("player");
        var oldSrc = player.src;
        player.src = "";
        player.src = oldSrc;
        player.play();
        $scope.private.focus();
    };

    //自动播放功能
    $scope.autoPlay = function(){
        if($scope.curWordListObj.intervalFunc == null){
            document.getElementById("autoPlay").style.backgroundColor = "#1FFFFF";
            $scope.curWordListObj.originalWordIndex = $scope.curWordListObj.wordIndex;
            $scope.curWordListObj.intervalFunc = setInterval(function(){
                //在自动播放过程中，如果用户输入数据，则先暂停自动播放
                if(document.getElementById("wordInput").value == ""){
                    document.getElementById("lastReciteBtn").click();
                }
            }, 5000);
        }
        else{
            clearInterval($scope.curWordListObj.intervalFunc);
            document.getElementById("autoPlay").style.backgroundColor = "#428BCA";
            $scope.curWordListObj.intervalFunc = null;
            $scope.curWordListObj.wordIndex = $scope.curWordListObj.originalWordIndex;
        }
    };

    //背诵上次背诵的词库
    $scope.reciteLastCategory = function(){
        $scope.private.getReciteCategory();
    };

    //下一个单词
    $scope.nextWord = function () {
        $scope.repeatNum = 0;
        $scope.private.play(1);
    };

    //上一个单词
    $scope.lastWord = function () {
        $scope.repeatNum = 0;
        $scope.private.play(-1);
    };

    //下一个单元
    $scope.nextUnit = function(){
        if($scope.curWordListObj.nextUnit()){
            $scope.private.play(-1);
        }
    };

    //上一个单元
    $scope.lastUnit = function(){
        $scope.curWordListObj.lastUnit();
        $scope.private.play(-1);
    };

    //背诵
    $scope.recite = function (event) {
        $scope.curWordListObj.resetHint();

        //用户按下tab键
        if(event.keyCode == 49){
            $scope.playSound();
        }
        //用户按下回车键
        if (event.keyCode == 13) {
            if ($scope.curWordListObj.checkValue(event.target.value)){
                //在自动播放过程中输入
                if($scope.curWordListObj.intervalFunc != null){
                    document.getElementById("wordInput").value = "";
                    return;
                }

                //需要连续输入3次才能跳到下一个单词
                $scope.curWordListObj.addRepeat();
                if($scope.curWordListObj.needRepeat()){
                    $scope.private.play(-1);
                    $scope.private.play(1);
                    return;
                }

                //如果是错误单词，则让后台删除
                if($scope.curWordListObj.category_id == "22"){
                    var word = $scope.curWordListObj.getWord();
                    ErrorWord.postArgs["word_id"] = word["id"];
                    ErrorWord.postArgs["op"] = "delete";
                    ErrorWord.post(
                        function(data, status, headers, config){
                        },
                        function (data, status, headers, config){
                        }
                    );
                 }

                $scope.private.play(1);
                $scope.curWordListObj.addFinishNum();

                //发送当前的索引位置
                if($scope.curWordListObj.repeatFlag == false){
                    $scope.private.postIndex();
                }
            }
            else {
                //发送错词到后台
                var word = $scope.curWordListObj.getWord();
                ErrorWord.postArgs["word_id"] = word["id"];
                ErrorWord.postArgs["op"] = "add";
                ErrorWord.post(
                    function(data, status, headers, config){
                    },
                    function (data, status, headers, config){
                    }
                );
                $scope.curWordListObj.setHint();
                $scope.playSound();
            }
            event.target.value = "";
            $scope.private.focus();
        }
    };

    //关闭模态对话框
    $scope.closeModel = function(){
        if($scope.curWordListObj.intervalFunc != null){
              $scope.autoPlay();
        }
    };

    $document.ready(function () {
        $scope.getCategoryList();
        $.fn.bootstrapSwitch.defaults.size = "mini";

        $('input[name="showChineseBox"]').on('switchChange.bootstrapSwitch', function (event, state) {
            if (state) {
                $('#chinese').css("visibility", "visible");
            }
            else {
                $('#chinese').css("visibility", "hidden");
            }
        });

        $('input[name="showSoundMarkBox"]').on('switchChange.bootstrapSwitch', function (event, state) {
            if (state) {
                $('#soundMark').css("visibility", "visible");
            }
            else {
                $('#soundMark').css("visibility", "hidden");
            }
        });

        $('input[name="showHintBox"]').on('switchChange.bootstrapSwitch', function (event, state) {
            if (state) {
                $('#hint').css("visibility", "visible");
            }
            else {
                $('#hint').css("visibility", "hidden");
            }
        });

        $("[name='showChineseBox']").bootstrapSwitch();
        $("[name='showSoundMarkBox']").bootstrapSwitch();
        $("[name='showHintBox']").bootstrapSwitch();
    });
}]);
