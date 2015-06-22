/**
 * Created by lintong on 2015/1/12.
 */
var ShanbayApp = angular.module("ShanbayApp", []);

ShanbayApp.controller("ShanbayController", ["$scope", "$document", "Category", "Word", "WordIndex", "ReciteCategory", function ($scope, $document, Category, Word, WordIndex, ReciteCategory) {
    //单词目录对象，key为category_id，value为对应的单词列表
    $scope.CategoryObj = {

    };
    //当前正在背诵的单词列表
    $scope.curWordListObj = {

    };

    //背诵的目录
    $scope.reciteCategoryId = 0;

    //单词列表对象
    function WordList(category_id, category_name){
        this.category_id = category_id;
        this.category_name = category_name;
        this.wordList = [];
        this.wordIndex = -1;
        this.errorWordIndex = 0;
        this.reciteErrorFlag = false;
        this.finishNum = 0;
        this.initIndex =0;
        this.repeatFlag = false;
        this.errorWordList = [];
    }

    WordList.prototype.addIndex = function(){
        this.wordIndex += 1;
        if(this.finishNum == 4){
            this.wordIndex = this.initIndex;
            this.repeatFlag = true;
            this.finishNum = 0;
        }
        if (this.wordIndex == this.wordList.length) {
            this.wordIndex = 0;
        }
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
        word["originalHint"] = word["hint"];
    };

    WordList.prototype.getWord = function () {
      return this.wordList[this.wordIndex];
    };

    WordList.prototype.addErrorWord = function(){
        var word = this.getWord();
        for(var i = 0; i < this.errorWordList.length; ++i){
            if(this.errorWordList[i] == word){
                return;
            }
        }
        this.errorWordList.push(word);
    };
    WordList.prototype.delErrorWord = function(){
        var word = this.getWord();
        for(var i = 0; i < this.wordList.length; ++i){
            if(this.wordList[i] == word){
                this.wordList.splice(i, 1);
                if(this.wordIndex >= this.wordList.length && this.wordIndex != 0){
                    this.wordIndex = this.wordList.length - 1;
                }
                return;
            }
        }
    };

    WordList.prototype.resetHint = function(){
        var word = this.getWord();
        if (word["hint"] == word["english"]) {
            word["hint"] = word["originalHint"];
        }
    };
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
    };
    WordList.prototype.reset = function(){
        this.finishNum = 0;
        this.repeatFlag = false;
        this.wordIndex = this.initIndex;
        this.nextWord();
    };
    WordList.prototype.nextUnit = function(){
        if(this.repeatFlag == false && this.reciteErrorFlag == true){
            return;
        }
        this.initIndex += 100;
        this.initIndex = this.initIndex % this.wordList.length;
        this.reset();
    };

    WordList.prototype.lastUnit = function(){
        this.initIndex -= 100;
        if(this.initIndex < 0){
            this.initIndex = 0;
        }
        this.reset();
    };

    /**********/
    $scope.isError = false;

   $scope.getReciteCategory = function(){
        ReciteCategory.get(
             function(data, status, headers, config){
                    $scope.reciteCategoryId = data["recite_category_id"];
                },
             function(data, status, headers, config){
             }
        );
    };


    $scope.getCategoryList = function () {
        Category.get(
            function (data, status, headers, config) {
                $scope.getReciteCategory();
                for(var i = 0; i < data.length; ++i){
                    $scope.CategoryObj[data[i].category_id] = new WordList(data[i].category_id, data[i].category_name);
                }
            },
            function (data, status, headers, config) {
            }
        )
    };

     $scope.postReciteCategory = function () {
        ReciteCategory.postArgs["category_id"] = $scope.reciteCategoryId;
        ReciteCategory.post(
            function(data, status, headers, conifg){
            },
            function(data, status, headers, conifg){}
        )
    };

    $scope.getWordList = function (category_id) {
        document.getElementById("startReciteBtn").click();

        if($scope.CategoryObj[category_id].wordList.length == 0){
            var category_name = $scope.CategoryObj[category_id].category_name;
            $scope.CategoryObj[category_id].category_name = "后台正在获取数据，请耐心等待...";
            Word.getArgs["category_id"] = category_id;
            Word.get(
                function (data, status, headers, config) {
                    $scope.CategoryObj[category_id].wordList = data;
                    $scope.CategoryObj[category_id].category_name = category_name;
                    WordIndex.getArgs["category_id"] = category_id;
                    //获取上次背诵的位置
                    WordIndex.get(
                        function(data, status, headers, config){
                            $scope.CategoryObj[category_id].wordIndex = data["index"] - 1;
                            $scope.CategoryObj[category_id].initIndex = data["index"] - 1;
                            getWord(1);
                        },
                        function(data, status, headers, config){

                        }
                    );
                },
                function (data, status, headers, config) {
                }
            );
        }
        else{
            document.getElementById("wordInput").value = "";
            document.getElementById("wordInput").focus();
        }
        $scope.curWordListObj = $scope.CategoryObj[category_id];

    };

    $scope.reciteWords = function (category_id) {
        if(!category_id) {
            return;
        }
        $scope.getWordList(category_id);
        $scope.reciteCategoryId = category_id;
        $scope.postReciteCategory();
    };

    $scope.playSound = function () {
        var player = document.getElementById("player");
        var oldSrc = player.src;
        player.src = "";
        player.src = oldSrc;
        player.play();
    };


    //获取单词，distance标志表示获取前一个还是后一个
    function getWord(distance) {
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
        document.getElementById("wordInput").focus();
        player.play();
        //发送当前的索引位置
        if($scope.curWordListObj.repeatFlag == false){
            postIndex();
        }
        return true;
    }
    function postIndex(){
        WordIndex.postArgs["category_id"] = $scope.curWordListObj.category_id;
        WordIndex.postArgs["index"] = $scope.curWordListObj.wordIndex;
        WordIndex.post(function(data, status, headers, config){
            },
            function (data, status, headers, config) {
            }
        );
    }

    $scope.reciteLastCategory = function(){
        $scope.reciteWords($scope.reciteCategoryId);
    };

    $scope.nextWord = function () {
        $scope.curWordListObj.addErrorWord();
        getWord(1);
    };

    $scope.lastWord = function () {
        getWord(-1);
    };

    $scope.nextUnit = function(){
        $scope.curWordListObj.nextUnit();
    };

    $scope.lastUnit = function(){
        $scope.contentDocument.lastUnit();
    };
    $scope.recite = function (event) {
        if ($scope.isError) {
            $scope.isError = false;
        }

        $scope.curWordListObj.resetHint();

        if (event.keyCode == 13) {

            if ($scope.curWordListObj.checkValue(event.target.value)) {

                if($scope.curWordListObj.reciteErrorFlag){
                    getWord(1);
                    if($scope.curWordListObj.wordList.length == 0){
                        $scope.reciteError();
                    }
                }
                //更新进度
                else{
                    getWord(1);
                    $scope.curWordListObj.addFinishNum();
                }
            }
            else {
                if(!$scope.curWordListObj.reciteErrorFlag){
                    $scope.curWordListObj.addErrorWord();
                }
                $scope.curWordListObj.setHint();
                $scope.playSound();
                $scope.isError = true;

            }
            event.target.value = "";
            event.target.focus();

        }

    };
    $scope.reciteError = function(){
        if($scope.curWordListObj.errorWordList.length == 0){
            return;
        }
        var tempWord = $scope.curWordListObj.wordList;
        var tempIndex = $scope.curWordListObj.wordIndex;
        $scope.curWordListObj.wordList = $scope.curWordListObj.errorWordList;
        $scope.curWordListObj.errorWordList = tempWord;
        $scope.curWordListObj.wordIndex = $scope.curWordListObj.errorWordIndex;
        $scope.curWordListObj.errorWordIndex = tempIndex;
        $scope.curWordListObj.reciteErrorFlag = !$scope.curWordListObj.reciteErrorFlag;
        if($scope.curWordListObj.reciteErrorFlag){
            $('#deleteErrorWord').css("visibility", "visible");
            $('#reciteErrorWords').text("背诵单词");
        }
        else{
            $('#deleteErrorWord').css("visibility", "hidden");
            $('#reciteErrorWords').text("错词背诵");
        }

        //先回退一格，这样能播放声音
        $scope.curWordListObj.wordIndex -= 1;
        getWord(1);

    };
    $scope.deleteError = function(){
        $scope.curWordListObj.delErrorWord();
        if($scope.curWordListObj.wordList.length == 0){
            $scope.reciteError();
        }else{
            $scope.curWordListObj.wordIndex -= 1;
            getWord(1);
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



