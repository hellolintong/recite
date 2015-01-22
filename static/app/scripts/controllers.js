/**
 * Created by lintong on 2015/1/12.
 */
var ShanbayApp = angular.module("ShanbayApp", []);

ShanbayApp.controller("ShanbayController", ["$scope", "$document", "Categroy", "Word", function ($scope, $document, Category, Word) {
    $scope.category_list = [];
    $scope.word_list = [];
    $scope.curIndex = 0;
    $scope.word = {};
    $scope.isError = false;

    $scope.getCategoryList = function () {
        Category.get(
            function (data, status, headers, config) {
                $scope.category_list = data;
            },
            function (data, status, headers, config) {
            }
        )
    };
    $scope.getWordList = function (category) {
        document.getElementById("startReciteBtn").click();
        $scope.word = {};
        $scope.word["category"] = "后台正在获取数据，请耐心等待...";
        Word.getArgs["category"] = category;
        Word.get(
            function (data, status, headers, config) {
                $scope.word_list = data;
                $scope.curIndex = -1;
                getNextWord();
                document.getElementById("wordInput").focus();
            },
            function (data, status, headers, config) {
            }
        );
    };
    $scope.reciteWords = function (category) {
        $scope.getWordList(category);
    };
    $scope.playSound = function(){
        var player = document.getElementById("player");
        var oldSrc = player.src;
        player.src = "";
        player.src = oldSrc;
        player.play();
    };
    function shieldWord(word) {
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
    }

    function getNextWord() {
        $scope.curIndex += 1;
        if ($scope.curIndex == $scope.word_list.length) {
            return false;
        }
        $scope.word = $scope.word_list[$scope.curIndex];
        $scope.word["hint"] = shieldWord($scope.word["english"]);
        $scope.word["originalHint"] = $scope.word["hint"];
        var player = document.getElementById("player");
        player.src = "/static/sound/" + $scope.word["sound"];
        player.play();

        return true;
    }

    $scope.recite = function (event) {
        if($scope.isError){
            $scope.isError = false;
        }
        if($scope.word["hint"] == $scope.word["english"]){
            $scope.word["hint"] = $scope.word["originalHint"];
        }
        if(event.keyCode != 13){
            return;
        }

        if (event.target.value== $scope.word["english"]) {
            if (!getNextWord()) {
                //退出对话框
                document.getElementById("closeReciteBtn").click();
            }
            //更新进度
            var finishRate = ($scope.curIndex + 1) / $scope.word_list.length;
            finishRate = finishRate.toString() + "%";
            document.getElementById("finishProgress").style.width = finishRate;
        }
        else {
            $scope.isError = true;
            $scope.word["hint"] = $scope.word["english"];
        }
        event.target.value = "";
        event.target.focus();
    };


    $document.ready(function () {
        $scope.getCategoryList();
    });

}]);



