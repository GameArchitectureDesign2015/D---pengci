require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Background":[function(require,module,exports){
"use strict";
cc._RF.push(module, '4a8a8g8fIlLSZ5xoRWc4YRl', 'Background');
// Scripts/Background.js

'use strict';

var Constant = require('Constant');

var Background = cc.Class({
    extends: cc.Component,

    properties: {
        // 地板节点数组
        groundNode: {
            default: [],
            type: [cc.Node]
        },
        // 地板图片对象
        groundImg: {
            default: null,
            type: cc.Sprite
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        // 获取屏幕尺寸
        this._size = cc.winSize;
        // 获取地板图片的宽度
        this._width = this.groundImg.spriteFrame.getRect().width;
        // 启动“地板移动控制”计时器
        this.schedule(this.onGroundMove, Constant.GROUND_MOVE_INTERVAL);
    },

    onGroundMove: function onGroundMove() {
        this.groundNode[0].x += Constant.GROUND_VX;
        this.groundNode[1].x += Constant.GROUND_VX;
        if (this.groundNode[0].x + this._width / 2 < -this._size.width / 2) {
            this.groundNode[0].x = this.groundNode[1].x + this._width - 5;
        }
        if (this.groundNode[1].x + this._width / 2 < -this._size.width / 2) {
            this.groundNode[1].x = this.groundNode[0].x + this._width - 5;
        }
    }
});

cc._RF.pop();
},{"Constant":"Constant"}],"Bird":[function(require,module,exports){
"use strict";
cc._RF.push(module, 'dba40+MKV5FjpALbo9uDYLc', 'Bird');
// Scripts/Bird.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        // 小鸟重力值
        gravity: 0.5,
        // 小鸟弹跳值
        birdJump: 6.6,
        // 动画名称
        AnimName: '',
        // 弹跳音效
        jumpAudio: {
            default: null,
            url: cc.AudioClip
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        // 获取本身的cc.Animation对象，并播放AnimName动画
        this.getComponent(cc.Animation).play(this.AnimName);
        // 初始化速度为0
        this.velocity = 0;
    },

    onStartDrop: function onStartDrop() {
        this.schedule(this.onDrop, 0.01);
    },

    onDrop: function onDrop() {
        this.node.y += this.velocity;
        this.velocity -= this.gravity;
    },

    onJump: function onJump() {
        // 弹跳时，重设向上的速度
        this.velocity = this.birdJump;
        // 播放弹跳音效
        cc.audioEngine.playEffect(this.jumpAudio, false);
    }

});

cc._RF.pop();
},{}],"Constant":[function(require,module,exports){
"use strict";
cc._RF.push(module, '1f331Khw8ZPUpFSgo3Y95tw', 'Constant');
// Scripts/Constant.js

'use strict';

var Constant = cc.Enum({
    // 地板移动时间间隔
    GROUND_MOVE_INTERVAL: 0.05,
    // 单位时间地板移动速度
    GROUND_VX: -5,
    // 上端管道序号为0
    PIPE_UP: 0,
    // 下端管道序号为1
    PIPE_DOWN: 1,
    // 游戏失败文字
    GAMEOVER_TXT: 'GAME OVER',
    // 最高分文字
    HIGHSCORE_TXT: 'HighScore: '
});

module.exports = Constant;

cc._RF.pop();
},{}],"Game":[function(require,module,exports){
"use strict";
cc._RF.push(module, '6bb266V8atHdb56fl6sfmwu', 'Game');
// Scripts/Game.js

'use strict';

var Bird = require('Bird');
var Background = require('Background');
var Constant = require('Constant');

var Storage = require('Storage');

var Game = cc.Class({
    extends: cc.Component,

    properties: {
        // 管道纵向最大偏移值
        pipeMaxOffsetY: 150,
        // 上下管道间最小间隙
        pipeMinGap: 80,
        // 上下管道间最大间隙
        pipeMaxGap: 150,
        // 管道生成时间间隔
        pipeSpawnInterval: 4.5,
        // 管道生成时，屏幕外横向偏移位置
        pipeSpawnOffsetX: 30,
        // 重新刷新时间
        gameReflashTime: 5,
        // 形变动画播放间隔
        scoreScaleDuration: 0.2,
        // 游戏菜单节点
        gameMenu: {
            default: null,
            type: cc.Node
        },
        // 小鸟对象
        bird: {
            default: null,
            type: Bird
        },
        // 管道创建节点
        pipesNode: {
            default: null,
            type: cc.Node
        },
        // 管道预制数组
        pipePrefabs: {
            default: [],
            type: [cc.Prefab]
        },
        // 地板对象
        background: {
            default: null,
            type: Background
        },
        // 游戏失败文字标签
        gameOverText: {
            default: null,
            type: cc.Label
        },
        // 当前分数标签
        scoreText: {
            default: null,
            type: cc.Label
        },
        // 最高分标签
        highScoreText: {
            default: null,
            type: cc.Label
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        // 初始化触摸事件
        this.setInputControl();
        // 初始化管道数组
        this.pipes = [];
        // 获取屏幕尺寸
        this.size = cc.winSize;
        // 获取地板的包围盒
        var groundBox = this.background.groundNode[0].getBoundingBox();
        // 获取地板顶部的纵坐标
        this.groundTop = groundBox.y + groundBox.height / 2;
        // 初始化游戏失败标志位
        this.isGameOver = false;
        // 初始化当前分数
        this.curScore = 0;
        // 开始游戏界面，如有历史最高分则显示该成绩
        if (Storage.getHighScore() > 0) {
            this.highScoreText.string = Constant.HIGHSCORE_TXT + Storage.getHighScore();
        }
    },

    setInputControl: function setInputControl() {
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: self._onTouchBegan.bind(self)
        }, self.node);
    },

    _onTouchBegan: function _onTouchBegan(touch, event) {
        if (this.isGameOver === true) return;
        this.bird.onJump();
    },

    onStartGame: function onStartGame() {
        // 关闭菜单节点显示
        this.gameMenu.active = false;
        // 小鸟开始下落
        this.bird.onStartDrop();
        // 从0开始显示分数
        this.scoreText.string = "" + this.curScore;
        // 启动管道生成定时器
        this.schedule(this.spawnPipes, this.pipeSpawnInterval);
        // 启动游戏逻辑更新定时器
        this.schedule(this.gameUpdate, Constant.GROUND_MOVE_INTERVAL);
    },

    spawnPipes: function spawnPipes() {
        // 从管道预制（上端），生成管道实例
        var pipeUp = cc.instantiate(this.pipePrefabs[Constant.PIPE_UP]);
        // 定义为上端类型
        pipeUp.getComponent('Pipe').init(Constant.PIPE_UP);
        // 获取管道的高度（上端与上端的相同）
        var pipeHeight = pipeUp.getComponent('cc.Sprite').spriteFrame.getRect().height;
        // 设置上端管道的横向起始位置（屏幕右端另加一定偏移）
        pipeUp.x = this.size.width / 2 + this.pipeSpawnOffsetX;
        // 设置上端管道的纵向起始位置（随机取偏移量）
        pipeUp.y = Math.floor(Math.random() * this.pipeMaxOffsetY) + pipeHeight / 2;
        // 下端生成逻辑基本与上端相同
        var pipeDown = cc.instantiate(this.pipePrefabs[Constant.PIPE_DOWN]);
        pipeDown.getComponent('Pipe').init(Constant.PIPE_DOWN);
        pipeDown.x = this.size.width / 2 + this.pipeSpawnOffsetX;
        // 随机生成上端与下端管道之间的间隙值（pipeMinGap与pipeMaxGap之间）
        var pipeGap = Math.floor(Math.random() * (this.pipeMaxGap - this.pipeMinGap)) + this.pipeMinGap;
        pipeDown.y = pipeUp.y - pipeGap - pipeHeight;
        // 添加管道到pipes节点上
        this.pipesNode.addChild(pipeUp);
        this.pipesNode.addChild(pipeDown);
        // 添加管道到管道数组中
        this.pipes.push(pipeUp);
        this.pipes.push(pipeDown);
    },

    gameUpdate: function gameUpdate() {
        for (var i = 0; i < this.pipes.length; i++) {
            // 获取当前管道对象节点
            var curPipeNode = this.pipes[i];
            // 对管道进行移动操作
            curPipeNode.x += Constant.GROUND_VX;

            // 获取小鸟的包围盒
            var birdBox = this.bird.node.getBoundingBox();
            // 获取当前管道的包围盒
            var pipeBox = curPipeNode.getBoundingBox();
            // var birdRect = new cc.Rect(birdBox.x - birdBox.width / 2, birdBox.y - birdBox.height / 2,
            //     birdBox.width, birdBox.height);
            // var pipeRect = new cc.Rect(pipeBox.x - pipeBox.width / 2, pipeBox.y - pipeBox.height / 2,
            //     pipeBox.width, pipeBox.height);
            // 根据两个矩形范围判断是否相交
            if (cc.Intersection.rectRect(birdBox, pipeBox)) {
                this.onGameOver();
                return;
            }

            // 获取当前管道对象
            var curPipe = curPipeNode.getComponent('Pipe');
            // 判断小鸟是否顺利通过管道，是则加分
            if (curPipeNode.x < this.bird.node.x && curPipe.isPassed === false && curPipe.type === Constant.PIPE_UP) {
                curPipe.isPassed = true;
                this.addScore();
            }

            // 超出屏幕范围的管道，从数组中移除，并从节点上删除
            if (curPipeNode.x < -(this.size.width / 2 + Constant.PIPE_SPAWN_OFFSET_X)) {
                this.pipes.splice(i, 1);
                this.pipesNode.removeChild(curPipeNode, true);
            }
        }

        // 小鸟触地，则死亡
        if (this.bird.node.y < this.groundTop) {
            this.onGameOver();
        }
    },

    addScore: function addScore() {
        // 加分
        this.curScore++;
        // 显示当前分数
        this.scoreText.string = "" + this.curScore;
        var action1 = cc.scaleTo(this.scoreScaleDuration, 1.1, 0.6);
        var action2 = cc.scaleTo(this.scoreScaleDuration, 0.8, 1.2);
        var action3 = cc.scaleTo(this.scoreScaleDuration, 1, 1);
        // 播放形变动画
        this.scoreText.node.runAction(cc.sequence(action1, action2, action3));
    },

    onGameOver: function onGameOver() {
        // 设置游戏失败标志位
        this.isGameOver = true;
        // 游戏失败，如超过最高分则成绩
        if (this.curScore > Storage.getHighScore()) {
            Storage.setHighScore(this.curScore);
        }
        // 死亡时，显示“Game Over”
        this.gameOverText.string = Constant.GAMEOVER_TXT;
        // 关闭所有定时器
        this.bird.unscheduleAllCallbacks();
        this.background.unscheduleAllCallbacks();
        this.unscheduleAllCallbacks();
        // 一定时间后，重新刷新游戏到开始状态
        this.schedule(function () {
            cc.director.loadScene('game');
        }, this.gameReflashTime);
    }

});

cc._RF.pop();
},{"Background":"Background","Bird":"Bird","Constant":"Constant","Storage":"Storage"}],"Pipe":[function(require,module,exports){
"use strict";
cc._RF.push(module, 'fc122qToQhByr8kag01h1T3', 'Pipe');
// Scripts/Pipe.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        // 小鸟通过管道与否的标志位
        isPassed: false
    },

    // use this for initialization
    onLoad: function onLoad() {},

    init: function init(type) {
        // 设置管道的类型（上或下）
        this.type = type;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RF.pop();
},{}],"Storage":[function(require,module,exports){
"use strict";
cc._RF.push(module, '66102528YBJXJl8YVn9PiMH', 'Storage');
// Scripts/Storage.js

'use strict';

var Storage = {
    getHighScore: function getHighScore() {
        var score = cc.sys.localStorage.getItem('HighScore') || 0;
        return parseInt(score);
    },

    setHighScore: function setHighScore(score) {
        cc.sys.localStorage.setItem('HighScore', score);
    }
};

module.exports = Storage;

cc._RF.pop();
},{}]},{},["Background","Bird","Constant","Game","Pipe","Storage"])

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9TY3JpcHRzL0JhY2tncm91bmQuanMiLCJhc3NldHMvU2NyaXB0cy9CaXJkLmpzIiwiYXNzZXRzL1NjcmlwdHMvQ29uc3RhbnQuanMiLCJhc3NldHMvU2NyaXB0cy9HYW1lLmpzIiwiYXNzZXRzL1NjcmlwdHMvUGlwZS5qcyIsImFzc2V0cy9TY3JpcHRzL1N0b3JhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUVBO0FBQ0k7O0FBRUE7QUFDSTtBQUNBO0FBQ0k7QUFDQTtBQUZRO0FBSVo7QUFDQTtBQUNJO0FBQ0E7QUFGTztBQVBIOztBQWFaO0FBQ0E7QUFDSTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSDs7QUFFRDtBQUNJO0FBQ0E7QUFDQTtBQUNJO0FBQ0g7QUFDRDtBQUNJO0FBQ0g7QUFDSjtBQW5DcUI7Ozs7Ozs7Ozs7QUNGMUI7QUFDSTs7QUFFQTtBQUNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSTtBQUNBO0FBRk87QUFSSDs7QUFjWjtBQUNBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDSDs7QUFFRDtBQUNJO0FBQ0g7O0FBRUQ7QUFDSTtBQUNBO0FBQ0g7O0FBRUQ7QUFDSTtBQUNBO0FBQ0E7QUFDQTtBQUNIOztBQXZDSTs7Ozs7Ozs7OztBQ0FUO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWm1COztBQWV2Qjs7Ozs7Ozs7OztBQ2ZBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNJOztBQUVBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSTtBQUNBO0FBRk07QUFJVjtBQUNBO0FBQ0k7QUFDQTtBQUZFO0FBSU47QUFDQTtBQUNJO0FBQ0E7QUFGTztBQUlYO0FBQ0E7QUFDSTtBQUNBO0FBRlM7QUFJYjtBQUNBO0FBQ0k7QUFDQTtBQUZRO0FBSVo7QUFDQTtBQUNJO0FBQ0E7QUFGVTtBQUlkO0FBQ0E7QUFDSTtBQUNBO0FBRk87QUFJWDtBQUNBO0FBQ0k7QUFDQTtBQUZXO0FBbkRQOztBQXlEWjtBQUNBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSTtBQUNIO0FBQ0o7O0FBRUQ7QUFDSTtBQUNBO0FBQ0k7QUFDQTtBQUZ3QjtBQUkvQjs7QUFFRDtBQUNJO0FBRUE7QUFDSDs7QUFFRDtBQUNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0g7O0FBRUQ7QUFDSTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0g7O0FBRUQ7QUFDSTtBQUNJO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0k7QUFDQTtBQUNIOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBRUk7QUFDQTtBQUNIOztBQUVEO0FBQ0E7QUFDSTtBQUNBO0FBQ0g7QUFDSjs7QUFFRDtBQUNBO0FBQ0k7QUFDSDtBQUNKOztBQUVEO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0g7O0FBRUQ7QUFDSTtBQUNBO0FBQ0E7QUFDQTtBQUNJO0FBQ0g7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0k7QUFDSDtBQUNKOztBQS9NZTs7Ozs7Ozs7OztBQ05wQjtBQUNJOztBQUVBO0FBQ0k7QUFDQTtBQUZROztBQUtaO0FBQ0E7O0FBSUE7QUFDSTtBQUNBO0FBQ0g7O0FBRUQ7QUFDQTs7QUFFQTtBQXJCSzs7Ozs7Ozs7OztBQ0FUO0FBQ0k7QUFDSTtBQUNBO0FBQ0g7O0FBRUQ7QUFDSTtBQUNIO0FBUlM7O0FBV2QiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQ29uc3RhbnQgPSByZXF1aXJlKCdDb25zdGFudCcpO1xyXG5cclxudmFyIEJhY2tncm91bmQgPSBjYy5DbGFzcyh7XHJcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXHJcblxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIOWcsOadv+iKgueCueaVsOe7hFxyXG4gICAgICAgIGdyb3VuZE5vZGU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogW10sXHJcbiAgICAgICAgICAgIHR5cGU6IFtjYy5Ob2RlXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5Zyw5p2/5Zu+54mH5a+56LGhXHJcbiAgICAgICAgZ3JvdW5kSW1nOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IGNjLlNwcml0ZVxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g6I635Y+W5bGP5bmV5bC65a+4XHJcbiAgICAgICAgdGhpcy5fc2l6ZSA9IGNjLndpblNpemU7XHJcbiAgICAgICAgLy8g6I635Y+W5Zyw5p2/5Zu+54mH55qE5a695bqmXHJcbiAgICAgICAgdGhpcy5fd2lkdGggPSB0aGlzLmdyb3VuZEltZy5zcHJpdGVGcmFtZS5nZXRSZWN0KCkud2lkdGg7XHJcbiAgICAgICAgLy8g5ZCv5Yqo4oCc5Zyw5p2/56e75Yqo5o6n5Yi24oCd6K6h5pe25ZmoXHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZSh0aGlzLm9uR3JvdW5kTW92ZSwgQ29uc3RhbnQuR1JPVU5EX01PVkVfSU5URVJWQUwpO1xyXG4gICAgfSxcclxuXHJcbiAgICBvbkdyb3VuZE1vdmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdW5kTm9kZVswXS54ICs9IENvbnN0YW50LkdST1VORF9WWDtcclxuICAgICAgICB0aGlzLmdyb3VuZE5vZGVbMV0ueCArPSBDb25zdGFudC5HUk9VTkRfVlg7XHJcbiAgICAgICAgaWYgKHRoaXMuZ3JvdW5kTm9kZVswXS54ICsgdGhpcy5fd2lkdGgvMiA8IC0gdGhpcy5fc2l6ZS53aWR0aC8yKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kTm9kZVswXS54ID0gdGhpcy5ncm91bmROb2RlWzFdLnggKyB0aGlzLl93aWR0aCAtIDU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmdyb3VuZE5vZGVbMV0ueCArIHRoaXMuX3dpZHRoLzIgPCAtIHRoaXMuX3NpemUud2lkdGgvMikge1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VuZE5vZGVbMV0ueCA9IHRoaXMuZ3JvdW5kTm9kZVswXS54ICsgdGhpcy5fd2lkdGggLSA1O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xyXG4gICAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcclxuXHJcbiAgICAvLyB9LFxyXG59KTtcclxuIiwiY2MuQ2xhc3Moe1xyXG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxyXG5cclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvLyDlsI/puJ/ph43lipvlgLxcclxuICAgICAgICBncmF2aXR5OiAwLjUsXHJcbiAgICAgICAgLy8g5bCP6bif5by56Lez5YC8XHJcbiAgICAgICAgYmlyZEp1bXA6IDYuNixcclxuICAgICAgICAvLyDliqjnlLvlkI3np7BcclxuICAgICAgICBBbmltTmFtZTogJycsXHJcbiAgICAgICAgLy8g5by56Lez6Z+z5pWIXHJcbiAgICAgICAganVtcEF1ZGlvOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHVybDogY2MuQXVkaW9DbGlwXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cclxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOiOt+WPluacrOi6q+eahGNjLkFuaW1hdGlvbuWvueixoe+8jOW5tuaSreaUvkFuaW1OYW1l5Yqo55S7XHJcbiAgICAgICAgdGhpcy5nZXRDb21wb25lbnQoY2MuQW5pbWF0aW9uKS5wbGF5KHRoaXMuQW5pbU5hbWUpO1xyXG4gICAgICAgIC8vIOWIneWni+WMlumAn+W6puS4ujBcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gMDtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIG9uU3RhcnREcm9wOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZSh0aGlzLm9uRHJvcCwwLjAxKTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIG9uRHJvcDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5ub2RlLnkgKz0gdGhpcy52ZWxvY2l0eTtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5IC09IHRoaXMuZ3Jhdml0eTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIG9uSnVtcDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8g5by56Lez5pe277yM6YeN6K6+5ZCR5LiK55qE6YCf5bqmXHJcbiAgICAgICAgdGhpcy52ZWxvY2l0eSA9IHRoaXMuYmlyZEp1bXA7XHJcbiAgICAgICAgLy8g5pKt5pS+5by56Lez6Z+z5pWIXHJcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLmp1bXBBdWRpbywgZmFsc2UpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgXHJcbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xyXG4gICAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcclxuXHJcbiAgICAvLyB9LFxyXG59KTtcclxuIiwidmFyIENvbnN0YW50ID0gY2MuRW51bSh7XHJcbiAgICAvLyDlnLDmnb/np7vliqjml7bpl7Tpl7TpmpRcclxuICAgIEdST1VORF9NT1ZFX0lOVEVSVkFMOiAwLjA1LFxyXG4gICAgLy8g5Y2V5L2N5pe26Ze05Zyw5p2/56e75Yqo6YCf5bqmXHJcbiAgICBHUk9VTkRfVlg6IC01LFxyXG4gICAgLy8g5LiK56uv566h6YGT5bqP5Y+35Li6MFxyXG4gICAgUElQRV9VUDogMCxcclxuICAgIC8vIOS4i+err+euoemBk+W6j+WPt+S4ujFcclxuICAgIFBJUEVfRE9XTjogMSxcclxuICAgIC8vIOa4uOaIj+Wksei0peaWh+Wtl1xyXG4gICAgR0FNRU9WRVJfVFhUOiAnR0FNRSBPVkVSJyxcclxuICAgIC8vIOacgOmrmOWIhuaWh+Wtl1xyXG4gICAgSElHSFNDT1JFX1RYVDogJ0hpZ2hTY29yZTogJyxcclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbnN0YW50O1xyXG5cclxuIiwiY29uc3QgQmlyZCA9IHJlcXVpcmUoJ0JpcmQnKTtcclxuY29uc3QgQmFja2dyb3VuZCA9IHJlcXVpcmUoJ0JhY2tncm91bmQnKTtcclxuY29uc3QgQ29uc3RhbnQgPSByZXF1aXJlKCdDb25zdGFudCcpOyBcclxuXHJcbnZhciBTdG9yYWdlID0gcmVxdWlyZSgnU3RvcmFnZScpO1xyXG5cclxudmFyIEdhbWUgPSBjYy5DbGFzcyh7XHJcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXHJcblxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIOeuoemBk+e6teWQkeacgOWkp+WBj+enu+WAvFxyXG4gICAgICAgIHBpcGVNYXhPZmZzZXRZOiAxNTAsXHJcbiAgICAgICAgLy8g5LiK5LiL566h6YGT6Ze05pyA5bCP6Ze06ZqZXHJcbiAgICAgICAgcGlwZU1pbkdhcDogODAsXHJcbiAgICAgICAgLy8g5LiK5LiL566h6YGT6Ze05pyA5aSn6Ze06ZqZXHJcbiAgICAgICAgcGlwZU1heEdhcDogMTUwLFxyXG4gICAgICAgIC8vIOeuoemBk+eUn+aIkOaXtumXtOmXtOmalFxyXG4gICAgICAgIHBpcGVTcGF3bkludGVydmFsOiA0LjUsXHJcbiAgICAgICAgLy8g566h6YGT55Sf5oiQ5pe277yM5bGP5bmV5aSW5qiq5ZCR5YGP56e75L2N572uXHJcbiAgICAgICAgcGlwZVNwYXduT2Zmc2V0WDogMzAsXHJcbiAgICAgICAgLy8g6YeN5paw5Yi35paw5pe26Ze0XHJcbiAgICAgICAgZ2FtZVJlZmxhc2hUaW1lOiA1LFxyXG4gICAgICAgIC8vIOW9ouWPmOWKqOeUu+aSreaUvumXtOmalFxyXG4gICAgICAgIHNjb3JlU2NhbGVEdXJhdGlvbjogMC4yLFxyXG4gICAgICAgIC8vIOa4uOaIj+iPnOWNleiKgueCuVxyXG4gICAgICAgIGdhbWVNZW51OiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWwj+m4n+WvueixoVxyXG4gICAgICAgIGJpcmQ6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogQmlyZFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g566h6YGT5Yib5bu66IqC54K5XHJcbiAgICAgICAgcGlwZXNOb2RlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOeuoemBk+mihOWItuaVsOe7hFxyXG4gICAgICAgIHBpcGVQcmVmYWJzOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IFtdLFxyXG4gICAgICAgICAgICB0eXBlOiBbY2MuUHJlZmFiXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5Zyw5p2/5a+56LGhXHJcbiAgICAgICAgYmFja2dyb3VuZDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBCYWNrZ3JvdW5kXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmuLjmiI/lpLHotKXmloflrZfmoIfnrb5cclxuICAgICAgICBnYW1lT3ZlclRleHQ6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWxcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOW9k+WJjeWIhuaVsOagh+etvlxyXG4gICAgICAgIHNjb3JlVGV4dDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5pyA6auY5YiG5qCH562+XHJcbiAgICAgICAgaGlnaFNjb3JlVGV4dDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5Yid5aeL5YyW6Kem5pG45LqL5Lu2XHJcbiAgICAgICAgdGhpcy5zZXRJbnB1dENvbnRyb2woKTtcclxuICAgICAgICAvLyDliJ3lp4vljJbnrqHpgZPmlbDnu4RcclxuICAgICAgICB0aGlzLnBpcGVzID0gW107XHJcbiAgICAgICAgLy8g6I635Y+W5bGP5bmV5bC65a+4XHJcbiAgICAgICAgdGhpcy5zaXplID0gY2Mud2luU2l6ZTtcclxuICAgICAgICAvLyDojrflj5blnLDmnb/nmoTljIXlm7Tnm5JcclxuICAgICAgICB2YXIgZ3JvdW5kQm94ID0gdGhpcy5iYWNrZ3JvdW5kLmdyb3VuZE5vZGVbMF0uZ2V0Qm91bmRpbmdCb3goKTtcclxuICAgICAgICAvLyDojrflj5blnLDmnb/pobbpg6jnmoTnurXlnZDmoIdcclxuICAgICAgICB0aGlzLmdyb3VuZFRvcCA9IGdyb3VuZEJveC55ICsgZ3JvdW5kQm94LmhlaWdodC8yO1xyXG4gICAgICAgIC8vIOWIneWni+WMlua4uOaIj+Wksei0peagh+W/l+S9jVxyXG4gICAgICAgIHRoaXMuaXNHYW1lT3ZlciA9IGZhbHNlO1xyXG4gICAgICAgIC8vIOWIneWni+WMluW9k+WJjeWIhuaVsFxyXG4gICAgICAgIHRoaXMuY3VyU2NvcmUgPSAwO1xyXG4gICAgICAgIC8vIOW8gOWni+a4uOaIj+eVjOmdou+8jOWmguacieWOhuWPsuacgOmrmOWIhuWImeaYvuekuuivpeaIkOe7qVxyXG4gICAgICAgIGlmICggU3RvcmFnZS5nZXRIaWdoU2NvcmUoKSA+IDAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaFNjb3JlVGV4dC5zdHJpbmcgPSBDb25zdGFudC5ISUdIU0NPUkVfVFhUICsgU3RvcmFnZS5nZXRIaWdoU2NvcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHNldElucHV0Q29udHJvbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGNjLmV2ZW50TWFuYWdlci5hZGRMaXN0ZW5lcih7XHJcbiAgICAgICAgICAgIGV2ZW50OiBjYy5FdmVudExpc3RlbmVyLlRPVUNIX09ORV9CWV9PTkUsXHJcbiAgICAgICAgICAgIG9uVG91Y2hCZWdhbjogc2VsZi5fb25Ub3VjaEJlZ2FuLmJpbmQoc2VsZilcclxuICAgICAgICB9LCBzZWxmLm5vZGUpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgX29uVG91Y2hCZWdhbjogZnVuY3Rpb24oIHRvdWNoLCBldmVudCApIHtcclxuICAgICAgICBpZiAoIHRoaXMuaXNHYW1lT3ZlciA9PT0gdHJ1ZSApXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB0aGlzLmJpcmQub25KdW1wKCk7XHJcbiAgICB9LCAgICBcclxuICAgIFxyXG4gICAgb25TdGFydEdhbWU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDlhbPpl63oj5zljZXoioLngrnmmL7npLpcclxuICAgICAgICB0aGlzLmdhbWVNZW51LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIC8vIOWwj+m4n+W8gOWni+S4i+iQvVxyXG4gICAgICAgIHRoaXMuYmlyZC5vblN0YXJ0RHJvcCgpO1xyXG4gICAgICAgIC8vIOS7jjDlvIDlp4vmmL7npLrliIbmlbBcclxuICAgICAgICB0aGlzLnNjb3JlVGV4dC5zdHJpbmcgPSBcIlwiICsgdGhpcy5jdXJTY29yZTtcclxuICAgICAgICAvLyDlkK/liqjnrqHpgZPnlJ/miJDlrprml7blmahcclxuICAgICAgICB0aGlzLnNjaGVkdWxlKHRoaXMuc3Bhd25QaXBlcywgdGhpcy5waXBlU3Bhd25JbnRlcnZhbCk7XHJcbiAgICAgICAgLy8g5ZCv5Yqo5ri45oiP6YC76L6R5pu05paw5a6a5pe25ZmoXHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZSh0aGlzLmdhbWVVcGRhdGUsIENvbnN0YW50LkdST1VORF9NT1ZFX0lOVEVSVkFMKTtcclxuICAgIH0sXHJcblxyXG4gICAgc3Bhd25QaXBlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8g5LuO566h6YGT6aKE5Yi277yI5LiK56uv77yJ77yM55Sf5oiQ566h6YGT5a6e5L6LXHJcbiAgICAgICAgdmFyIHBpcGVVcCA9IGNjLmluc3RhbnRpYXRlKHRoaXMucGlwZVByZWZhYnNbQ29uc3RhbnQuUElQRV9VUF0pO1xyXG4gICAgICAgIC8vIOWumuS5ieS4uuS4iuerr+exu+Wei1xyXG4gICAgICAgIHBpcGVVcC5nZXRDb21wb25lbnQoJ1BpcGUnKS5pbml0KENvbnN0YW50LlBJUEVfVVApO1xyXG4gICAgICAgIC8vIOiOt+WPlueuoemBk+eahOmrmOW6pu+8iOS4iuerr+S4juS4iuerr+eahOebuOWQjO+8iVxyXG4gICAgICAgIHZhciBwaXBlSGVpZ2h0ID0gcGlwZVVwLmdldENvbXBvbmVudCgnY2MuU3ByaXRlJykuc3ByaXRlRnJhbWUuZ2V0UmVjdCgpLmhlaWdodDtcclxuICAgICAgICAvLyDorr7nva7kuIrnq6/nrqHpgZPnmoTmqKrlkJHotbflp4vkvY3nva7vvIjlsY/luZXlj7Pnq6/lj6bliqDkuIDlrprlgY/np7vvvIlcclxuICAgICAgICBwaXBlVXAueCA9IHRoaXMuc2l6ZS53aWR0aCAvIDIgKyB0aGlzLnBpcGVTcGF3bk9mZnNldFg7XHJcbiAgICAgICAgLy8g6K6+572u5LiK56uv566h6YGT55qE57q15ZCR6LW35aeL5L2N572u77yI6ZqP5py65Y+W5YGP56e76YeP77yJXHJcbiAgICAgICAgcGlwZVVwLnkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLnBpcGVNYXhPZmZzZXRZKSArIHBpcGVIZWlnaHQvMjtcclxuICAgICAgICAvLyDkuIvnq6/nlJ/miJDpgLvovpHln7rmnKzkuI7kuIrnq6/nm7jlkIxcclxuICAgICAgICB2YXIgcGlwZURvd24gPSBjYy5pbnN0YW50aWF0ZSh0aGlzLnBpcGVQcmVmYWJzW0NvbnN0YW50LlBJUEVfRE9XTl0pO1xyXG4gICAgICAgIHBpcGVEb3duLmdldENvbXBvbmVudCgnUGlwZScpLmluaXQoQ29uc3RhbnQuUElQRV9ET1dOKTtcclxuICAgICAgICBwaXBlRG93bi54ID0gdGhpcy5zaXplLndpZHRoIC8gMiArIHRoaXMucGlwZVNwYXduT2Zmc2V0WDtcclxuICAgICAgICAvLyDpmo/mnLrnlJ/miJDkuIrnq6/kuI7kuIvnq6/nrqHpgZPkuYvpl7TnmoTpl7TpmpnlgLzvvIhwaXBlTWluR2Fw5LiOcGlwZU1heEdhcOS5i+mXtO+8iVxyXG4gICAgICAgIHZhciBwaXBlR2FwID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHRoaXMucGlwZU1heEdhcCAtIHRoaXMucGlwZU1pbkdhcCkpICsgdGhpcy5waXBlTWluR2FwO1xyXG4gICAgICAgIHBpcGVEb3duLnkgPSBwaXBlVXAueSAtIHBpcGVHYXAgLSBwaXBlSGVpZ2h0O1xyXG4gICAgICAgIC8vIOa3u+WKoOeuoemBk+WIsHBpcGVz6IqC54K55LiKXHJcbiAgICAgICAgdGhpcy5waXBlc05vZGUuYWRkQ2hpbGQocGlwZVVwKTtcclxuICAgICAgICB0aGlzLnBpcGVzTm9kZS5hZGRDaGlsZChwaXBlRG93bik7XHJcbiAgICAgICAgLy8g5re75Yqg566h6YGT5Yiw566h6YGT5pWw57uE5LitXHJcbiAgICAgICAgdGhpcy5waXBlcy5wdXNoKHBpcGVVcCk7XHJcbiAgICAgICAgdGhpcy5waXBlcy5wdXNoKHBpcGVEb3duKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2FtZVVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgdGhpcy5waXBlcy5sZW5ndGg7IGkgKysgKSB7XHJcbiAgICAgICAgICAgIC8vIOiOt+WPluW9k+WJjeeuoemBk+WvueixoeiKgueCuVxyXG4gICAgICAgICAgICB2YXIgY3VyUGlwZU5vZGUgPSB0aGlzLnBpcGVzW2ldO1xyXG4gICAgICAgICAgICAvLyDlr7nnrqHpgZPov5vooYznp7vliqjmk43kvZxcclxuICAgICAgICAgICAgY3VyUGlwZU5vZGUueCArPSBDb25zdGFudC5HUk9VTkRfVlg7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyDojrflj5blsI/puJ/nmoTljIXlm7Tnm5JcclxuICAgICAgICAgICAgdmFyIGJpcmRCb3ggPSB0aGlzLmJpcmQubm9kZS5nZXRCb3VuZGluZ0JveCgpO1xyXG4gICAgICAgICAgICAvLyDojrflj5blvZPliY3nrqHpgZPnmoTljIXlm7Tnm5JcclxuICAgICAgICAgICAgdmFyIHBpcGVCb3ggPSBjdXJQaXBlTm9kZS5nZXRCb3VuZGluZ0JveCgpO1xyXG4gICAgICAgICAgICAvLyB2YXIgYmlyZFJlY3QgPSBuZXcgY2MuUmVjdChiaXJkQm94LnggLSBiaXJkQm94LndpZHRoIC8gMiwgYmlyZEJveC55IC0gYmlyZEJveC5oZWlnaHQgLyAyLFxyXG4gICAgICAgICAgICAvLyAgICAgYmlyZEJveC53aWR0aCwgYmlyZEJveC5oZWlnaHQpO1xyXG4gICAgICAgICAgICAvLyB2YXIgcGlwZVJlY3QgPSBuZXcgY2MuUmVjdChwaXBlQm94LnggLSBwaXBlQm94LndpZHRoIC8gMiwgcGlwZUJveC55IC0gcGlwZUJveC5oZWlnaHQgLyAyLFxyXG4gICAgICAgICAgICAvLyAgICAgcGlwZUJveC53aWR0aCwgcGlwZUJveC5oZWlnaHQpO1xyXG4gICAgICAgICAgICAvLyDmoLnmja7kuKTkuKrnn6nlvaLojIPlm7TliKTmlq3mmK/lkKbnm7jkuqRcclxuICAgICAgICAgICAgaWYgKGNjLkludGVyc2VjdGlvbi5yZWN0UmVjdChiaXJkQm94LCBwaXBlQm94KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkdhbWVPdmVyKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIOiOt+WPluW9k+WJjeeuoemBk+WvueixoVxyXG4gICAgICAgICAgICB2YXIgY3VyUGlwZSA9IGN1clBpcGVOb2RlLmdldENvbXBvbmVudCgnUGlwZScpO1xyXG4gICAgICAgICAgICAvLyDliKTmlq3lsI/puJ/mmK/lkKbpobrliKnpgJrov4fnrqHpgZPvvIzmmK/liJnliqDliIZcclxuICAgICAgICAgICAgaWYgKCBjdXJQaXBlTm9kZS54IDwgdGhpcy5iaXJkLm5vZGUueCAmJiBjdXJQaXBlLmlzUGFzc2VkID09PSBmYWxzZSBcclxuICAgICAgICAgICAgICAgICYmIGN1clBpcGUudHlwZSA9PT0gQ29uc3RhbnQuUElQRV9VUCkge1xyXG4gICAgICAgICAgICAgICAgY3VyUGlwZS5pc1Bhc3NlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFNjb3JlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIOi2heWHuuWxj+W5leiMg+WbtOeahOeuoemBk++8jOS7juaVsOe7hOS4reenu+mZpO+8jOW5tuS7juiKgueCueS4iuWIoOmZpFxyXG4gICAgICAgICAgICBpZiAoIGN1clBpcGVOb2RlLnggPCAtKHRoaXMuc2l6ZS53aWR0aC8yICsgQ29uc3RhbnQuUElQRV9TUEFXTl9PRkZTRVRfWCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGlwZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5waXBlc05vZGUucmVtb3ZlQ2hpbGQoY3VyUGlwZU5vZGUsIHRydWUpO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyDlsI/puJ/op6blnLDvvIzliJnmrbvkuqFcclxuICAgICAgICBpZiAodGhpcy5iaXJkLm5vZGUueSA8IHRoaXMuZ3JvdW5kVG9wICkge1xyXG4gICAgICAgICAgICB0aGlzLm9uR2FtZU92ZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBhZGRTY29yZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8g5Yqg5YiGXHJcbiAgICAgICAgdGhpcy5jdXJTY29yZSArKztcclxuICAgICAgICAvLyDmmL7npLrlvZPliY3liIbmlbBcclxuICAgICAgICB0aGlzLnNjb3JlVGV4dC5zdHJpbmcgPSBcIlwiICsgdGhpcy5jdXJTY29yZTtcclxuICAgICAgICB2YXIgYWN0aW9uMSA9IGNjLnNjYWxlVG8odGhpcy5zY29yZVNjYWxlRHVyYXRpb24sIDEuMSwgMC42KTtcclxuICAgICAgICB2YXIgYWN0aW9uMiA9IGNjLnNjYWxlVG8odGhpcy5zY29yZVNjYWxlRHVyYXRpb24sIDAuOCwgMS4yKTtcclxuICAgICAgICB2YXIgYWN0aW9uMyA9IGNjLnNjYWxlVG8odGhpcy5zY29yZVNjYWxlRHVyYXRpb24sIDEsIDEpO1xyXG4gICAgICAgIC8vIOaSreaUvuW9ouWPmOWKqOeUu1xyXG4gICAgICAgIHRoaXMuc2NvcmVUZXh0Lm5vZGUucnVuQWN0aW9uKGNjLnNlcXVlbmNlKGFjdGlvbjEsIGFjdGlvbjIsIGFjdGlvbjMpKTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIG9uR2FtZU92ZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIOiuvue9rua4uOaIj+Wksei0peagh+W/l+S9jVxyXG4gICAgICAgIHRoaXMuaXNHYW1lT3ZlciA9IHRydWU7XHJcbiAgICAgICAgLy8g5ri45oiP5aSx6LSl77yM5aaC6LaF6L+H5pyA6auY5YiG5YiZ5oiQ57upXHJcbiAgICAgICAgaWYgKCB0aGlzLmN1clNjb3JlID4gU3RvcmFnZS5nZXRIaWdoU2NvcmUoKSApIHtcclxuICAgICAgICAgICAgU3RvcmFnZS5zZXRIaWdoU2NvcmUodGhpcy5jdXJTY29yZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOatu+S6oeaXtu+8jOaYvuekuuKAnEdhbWUgT3ZlcuKAnVxyXG4gICAgICAgIHRoaXMuZ2FtZU92ZXJUZXh0LnN0cmluZyA9IENvbnN0YW50LkdBTUVPVkVSX1RYVDtcclxuICAgICAgICAvLyDlhbPpl63miYDmnInlrprml7blmahcclxuICAgICAgICB0aGlzLmJpcmQudW5zY2hlZHVsZUFsbENhbGxiYWNrcygpO1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZC51bnNjaGVkdWxlQWxsQ2FsbGJhY2tzKCk7XHJcbiAgICAgICAgdGhpcy51bnNjaGVkdWxlQWxsQ2FsbGJhY2tzKCk7XHJcbiAgICAgICAgLy8g5LiA5a6a5pe26Ze05ZCO77yM6YeN5paw5Yi35paw5ri45oiP5Yiw5byA5aeL54q25oCBXHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdnYW1lJyk7XHJcbiAgICAgICAgfSwgdGhpcy5nYW1lUmVmbGFzaFRpbWUpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xyXG4gICAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcclxuXHJcbiAgICAvLyB9LFxyXG59KTtcclxuIiwiY2MuQ2xhc3Moe1xyXG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxyXG5cclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvLyDlsI/puJ/pgJrov4fnrqHpgZPkuI7lkKbnmoTmoIflv5fkvY1cclxuICAgICAgICBpc1Bhc3NlZDogZmFsc2UsXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBpbml0OiBmdW5jdGlvbiAodHlwZSkge1xyXG4gICAgICAgIC8vIOiuvue9rueuoemBk+eahOexu+Wei++8iOS4iuaIluS4i++8iVxyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcclxuICAgIC8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XHJcblxyXG4gICAgLy8gfSxcclxufSk7XHJcbiIsInZhciBTdG9yYWdlID0ge1xyXG4gICAgZ2V0SGlnaFNjb3JlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2NvcmUgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ0hpZ2hTY29yZScpIHx8IDA7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHNjb3JlKTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIHNldEhpZ2hTY29yZTogZnVuY3Rpb24oc2NvcmUpIHtcclxuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ0hpZ2hTY29yZScsIHNjb3JlKTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU3RvcmFnZTtcclxuXHJcbiJdLCJzb3VyY2VSb290IjoiIn0=