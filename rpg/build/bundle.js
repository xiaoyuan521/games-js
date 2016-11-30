(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var characters = require("./characters.js");

// 走一步的时间
var walkTime = 100;


function Character(engin, CharacterName){
	this.engin = engin;
	this.characterData = null;
	this.intervalHandler = null;
	this.isWalking = false;

	// 人物动作的css偏移用 x = 0; y = 1
	this.currentMove = "01"; 
	// 人物面向的方向
	this.direction = "right";

	this.init(CharacterName);
}

Character.prototype = {
	constrctor: Character,

	init: function(CharacterName){
		this.loadCharacter(CharacterName);
		this.startTimer();
	},

	startTimer: function(){
		var _this = this;
		this.intervalHandler = setInterval(function(){

			if(_this.isWalking === false){
				return;
			}

			var nextMove = _this._getNextMove();
			_this._setCssDeviation(nextMove);
			_this.currentMove = nextMove;
		}, walkTime);
	},

	// 加载人物图片，初始化姿势
	loadCharacter: function(name){

		var characterData = this.characterData = characters[name];
		var characterSize = characterData.size;
		var imgPath = "images/" + characterData.imgName;

		var $characterDom = $('<div class="currentCharacter"></div>');
		$characterDom.appendTo($(".main"));

		$characterDom.css({
			"width": characterSize + "px",
			"height": characterSize + "px",
			"background-image": "url('" + imgPath + "')"
		})

		this._setCssDeviation(this.currentMove);
	},

	// 取得下一次移动的位置 
	// "03", "33" ...
	_getNextMove: function(){
		var currentMove = this.currentMove;
		var currentDirection = this.currentDirection;
		var returnMove = null;

		var moveInt = parseInt(currentMove[0], 10);
		moveInt++;
		if(moveInt > 3){
			moveInt = 0;
		}
		returnMove = moveInt + currentMove[1];
		return returnMove;
		
	},

	// 开始走路
	walk: function(){
		this.isWalking = true;
	},

	// 停止走路
	stop: function(){
		this.isWalking = false;
		var stopMove = "0" + this.currentMove[1];
		this._setCssDeviation(stopMove);
	},

	// 设定移动方向
	// 需要在walk方法调用前调用
	// 也可以单独调用，用于，撞墙，撞人时候的转向
	setDirection: function(direction){

		if(direction != this.currentDirection){
			// 面向当前方向
			switch(direction){
				case "left":
					this.currentMove = "03";
					break;
				case "right":
					this.currentMove = "01";
					break;
				case "up":
					this.currentMove = "02";
					break;
				case "down":
					this.currentMove = "00";
					break;
				default:
					break;
			}
		}

		this.currentDirection = direction;
		this._setCssDeviation(this.currentMove);

	},

	// 设定人物图片的偏移量
	// nextMove : "01", "33" ...
	_setCssDeviation: function(nextMove) {
		var nextPositions = this._getPositionXY(this.characterData.size, nextMove);
		var $characterDom = $(".currentCharacter");
		$characterDom.css({
			"position":"absolute",
			"background-position-x": nextPositions.x + "px",
			"background-position-y": nextPositions.y + "px"
		});
	},

	// 计算人物的css偏移量
	_getPositionXY: function(size, movePosition) {
		var x = size * parseInt(movePosition[0], 10) * -1;
		var y = size * parseInt(movePosition[1], 10) * -1;
		return {
			x: x,
			y: y
		}
	},

	getDirection: function() {
		return this.direction;
	}

}

module.exports = Character;
},{"./characters.js":6}],2:[function(require,module,exports){
var maps = require("./maps");
var Character = require("./Character.js");

var moveTime = 600;

function CharacterEngin(config) {
	this.config = config;
	this.engin = null;
	this.dataSource = null;

	// 人物移动方向， null代表停止
	this.nextDirection = null;

	this.currentCharacter = null;

	// 人物在地图中的位置
	this.x = 0;
	this.y = 0;

	this.isWalking = false;
}

CharacterEngin.prototype = {
	constructor: CharacterEngin,

	init: function(engin) {
		this.engin = engin;
		this.dataSource = engin.getDataSource();

		// 绑定键盘事件
		this.bindEvent();

		// 初始化人物
		var currentCharacter = this.currentCharacter = new Character(engin, "girl");
		// 人物放到地图空位置上
		var x = this.x = 3 * this.config.cellSize;
		var y = this.y = 3 * this.config.cellSize;
		$(".currentCharacter").css({
			left: x + "px",
			top: y + "px"
		});

		this.startTimer();
	},

	// 人物走动的键盘事件
	bindEvent: function() {
		var _this = this;
		$(document.body).on("keydown.character.walk", function(e){

			if(_this.isWalking === true){
				return;
			}

			switch(e.keyCode){
				case 37:
					_this.nextDirection = "left";
					break;
				case 38:
					_this.nextDirection = "up";
					break;
				case 39:
					_this.nextDirection = "right";
					break;
				case 40:
					_this.nextDirection = "down";
					break;
				default:
					break;
			}

			_this.currentCharacter.setDirection(_this.nextDirection);
		});
	},

	// 定时检测人物走动
	startTimer: function() {

		var _this = this;
		setInterval(function() {
			if(_this.isWalking === true) {
				return;
			}

			if(_this.nextDirection == null) {
				_this.currentCharacter.stop();
				return;
			}

			_this.walk();
		}, 10);
	},

	// 人物移动
	walk: function(){

		var _this = this;
		var $characterDom = $(".currentCharacter");
		if($characterDom.length == 0) {
			return;
		}

		var nextMapXy = this._getNextMapXy(this.nextDirection);
		var canWalkFlg = this._canWalk(nextMapXy);

		if(canWalkFlg === true){
			this.isWalking = true;
			this.currentCharacter.walk();
			this._moveCharacter(nextMapXy.x, nextMapXy.y, function(){
				_this.isWalking = false;
				_this.nextDirection = null;
				_this.x = nextMapXy.x;
				_this.y = nextMapXy.y;
			})
		}
	},

	_moveCharacter: function(x, y, callbackFn){
		var $characterDom = $(".currentCharacter");
		$characterDom.animate({
			"left": x + "px",
			"top": y + "px"
		}, moveTime, "linear", callbackFn);
	},

	// 地图中，下一个点是否为可以移动点
	_canWalk: function(nextMapXy){

		if(this.nextDirection == null){
			return false;
		}

		// 超出地图
		if(nextMapXy.x < 0 || nextMapXy.y < 0){
			return false;
		}

		// 不能行走的地图
		var mapCellName = this.dataSource.get(nextMapXy.x, nextMapXy.y).bg;
		if(maps["mapMapping"][mapCellName]["canWalk"] === false){
			return false;
		}

		return true;
	},

	// 根据行走方向取得，下一个地图的x，y坐标
	_getNextMapXy: function(direction){
		var cellSize = this.config.cellSize;
		var x = 0;
		var y = 0;
		switch(direction){
			case "left":
				x = this.x - cellSize;
				y = this.y;
				break;
			case "right":
				x = this.x + cellSize;
				y = this.y;
				break;
			case "up":
				x = this.x;
				y = this.y - cellSize;
				break;
			case "down":
				x = this.x;
				y = this.y + cellSize;
				break;
			default:
				break;
		}
		return {
			x:x,
			y:y
		}
	}
}

module.exports = CharacterEngin
},{"./Character.js":1,"./maps":9}],3:[function(require,module,exports){
var CoorMap = function(){
	this.map = new Map();
}
CoorMap.prototype = {
	constructor: CoorMap,
	get: function(x, y){
		var k = null;
		for(key of this.map.keys()){
			if(key.x == x && key.y == y){
				k = key;
			}
		}

		return this.map.get(k);
	},
	set: function(x,y, value){
		var k = null;
		for(key of this.map.keys()){
			if(key.x == x && key.y == y){
				k = key;
			}
		}
		if(k) {
			this.map.set(k, value);
		}else {
			this.map.set({"x":x , "y":y}, value);
		}
	},
	getMap: function() {
		return this.map;
	}
}

module.exports = CoorMap;
},{}],4:[function(require,module,exports){
var MapEngin = require("./MapEngin");
var CharacterEngin = require("./CharacterEngin.js");

function Engin(config) {
	this.config = config;
	this.dataSource = null;
	this.mapEngin = new MapEngin(config);
	this.characterEngin = new CharacterEngin(config);
}

Engin.prototype = {
	constructor: Engin,

	init: function() {
		this.mapEngin.init(this);
		this.characterEngin.init(this);
	},

	start: function() {

	},

	setDataSource: function(dataSource) {
		this.dataSource = dataSource;
	},

	getDataSource: function(){
		return this.dataSource;
	}
}

module.exports=Engin;

},{"./CharacterEngin.js":2,"./MapEngin":5}],5:[function(require,module,exports){
var CoorMap = require("./CoorMap.js");

function MapEngin(config){
	this.config = config;
	this.engin = null;
	this.maps = require("./maps.js");
	this.mapMapping = this.maps.mapMapping;
}

MapEngin.prototype = {
	constructor: MapEngin,

	init: function(engin){

		this.engin = engin;

		// pre-load all images
		var mapMapping = this.maps.mapMapping;
		var $loadDiv = $("<div class='display_none'></div>");
		$loadDiv.appendTo($(document.body));
		for(var key in mapMapping){
			var imagePath = "images/" + mapMapping[key].name;
			$('<img/>').attr("src", imagePath).appendTo($loadDiv);
		}

		this.loadMap("01");
	},

	loadMap: function(mapKey) {
		$(".main .mapLayer").remove();
		var $mapLayer = $("<div class='mapLayer'></div>");
		$mapLayer.appendTo($(".main"));

		// set map total height and width
		var mapData = this.maps[mapKey];
		var cellSize = this.config.cellSize;
		var hLen = mapData.length;
		var wLen = mapData[0].length;
		var width = wLen * cellSize;
		var height = hLen * cellSize;
		$mapLayer.css({
			width: width + "px",
			height: height + "px"
		});

		// 根据地图做数据成dataSource，并设定到engin对象中
		// 根据地图数据画出地图
		var value = null;
		var row = null;
		var x,y;
		var dataSource = new CoorMap();
		for(var j=0;j<mapData.length;j++){
			row = mapData[j];
			for(var i=0;i<row.length;i++){
				value = this.mapMapping[row[i]].name;
				x = i * cellSize;
				y = j * cellSize;

				// datasource
				dataSource.set(x,y, {bg: row[i]});

				// images
				// var $img = $('<img alt="" />').attr("src", "images/" + value);
				var $img = $('<div></div>').text(value.substring(0,2));
				$img.css({
					width: cellSize + "px",
					height: cellSize + "px",
					position: "absolute",
					left: x + "px",
					top: y + "px"
				}).appendTo($mapLayer);
			}
		}
		this.engin.setDataSource(dataSource);
	}
}

module.exports = MapEngin;

},{"./CoorMap.js":3,"./maps.js":9}],6:[function(require,module,exports){
var characters = {}

characters["girl"] = {
	imgName: "c_girl.png",
	size: 45

}

module.exports = characters;
},{}],7:[function(require,module,exports){
module.exports = {
	cellSize: 45
}
},{}],8:[function(require,module,exports){
var config = require("./config.js");
var Engin = require("./Engin.js");

var engin = new Engin(config);


$(function(){
	engin.init();
})
},{"./Engin.js":4,"./config.js":7}],9:[function(require,module,exports){
var maps = {}

maps["mapMapping"] = {
	"tr": {
		name: "tree.png",
		canWalk: false
	},
	"se": {
		name: "sea.png",
		canWalk: false
	},
	"be": {
		name: "beach.png",
		canWalk: true
	},
	"la": {
		name: "land.png",
		canWalk: true
	},
	"br": {
		name: "bridge.png",
		canWalk: true
	}
}

maps["01"] =
"tr,tr,tr,be,se,br,se,be,tr,tr,tr_" +
"tr,tr,tr,be,se,br,se,be,tr,tr,tr_" +
"tr,tr,tr,be,be,br,be,be,tr,tr,tr_" +
"tr,tr,tr,la,la,la,la,la,tr,tr,tr_" +
"tr,tr,tr,la,la,la,la,la,tr,tr,tr_" +
"la,la,la,la,la,la,la,la,la,la,la_" +
"tr,tr,tr,la,la,la,la,la,tr,tr,tr_" +
"tr,tr,tr,la,la,la,la,la,tr,tr,tr_" +
"tr,tr,tr,be,be,br,be,be,tr,tr,tr_" +
"tr,tr,tr,be,se,br,se,be,tr,tr,tr_" +
"tr,tr,tr,be,se,br,se,be,tr,tr,tr";


// 地图数据串转二维数组
function toArray(str){
	var returnArray = [];
	var lineArr = str.split("_");
	lineArr.forEach(function(line){
		returnArray.push(line.split(","));
	});
	return returnArray;
}


for(var key in maps){
	if(/\d\d/.test(key)){
		maps[key] = toArray(maps[key]);
	}
}

module.exports = maps
},{}]},{},[1,2,3,4,5,6,7,8,9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL1VzZXJzL3poYW9faG9uZ3NoZW5nL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJycGcvZnJvbnRlbmQvQ2hhcmFjdGVyLmpzIiwicnBnL2Zyb250ZW5kL0NoYXJhY3RlckVuZ2luLmpzIiwicnBnL2Zyb250ZW5kL0Nvb3JNYXAuanMiLCJycGcvZnJvbnRlbmQvRW5naW4uanMiLCJycGcvZnJvbnRlbmQvTWFwRW5naW4uanMiLCJycGcvZnJvbnRlbmQvY2hhcmFjdGVycy5qcyIsInJwZy9mcm9udGVuZC9jb25maWcuanMiLCJycGcvZnJvbnRlbmQvaW5kZXguanMiLCJycGcvZnJvbnRlbmQvbWFwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGNoYXJhY3RlcnMgPSByZXF1aXJlKFwiLi9jaGFyYWN0ZXJzLmpzXCIpO1xyXG5cclxuLy8g6LWw5LiA5q2l55qE5pe26Ze0XHJcbnZhciB3YWxrVGltZSA9IDEwMDtcclxuXHJcblxyXG5mdW5jdGlvbiBDaGFyYWN0ZXIoZW5naW4sIENoYXJhY3Rlck5hbWUpe1xyXG5cdHRoaXMuZW5naW4gPSBlbmdpbjtcclxuXHR0aGlzLmNoYXJhY3RlckRhdGEgPSBudWxsO1xyXG5cdHRoaXMuaW50ZXJ2YWxIYW5kbGVyID0gbnVsbDtcclxuXHR0aGlzLmlzV2Fsa2luZyA9IGZhbHNlO1xyXG5cclxuXHQvLyDkurrnianliqjkvZznmoRjc3PlgY/np7vnlKggeCA9IDA7IHkgPSAxXHJcblx0dGhpcy5jdXJyZW50TW92ZSA9IFwiMDFcIjsgXHJcblx0Ly8g5Lq654mp6Z2i5ZCR55qE5pa55ZCRXHJcblx0dGhpcy5kaXJlY3Rpb24gPSBcInJpZ2h0XCI7XHJcblxyXG5cdHRoaXMuaW5pdChDaGFyYWN0ZXJOYW1lKTtcclxufVxyXG5cclxuQ2hhcmFjdGVyLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJjdG9yOiBDaGFyYWN0ZXIsXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKENoYXJhY3Rlck5hbWUpe1xyXG5cdFx0dGhpcy5sb2FkQ2hhcmFjdGVyKENoYXJhY3Rlck5hbWUpO1xyXG5cdFx0dGhpcy5zdGFydFRpbWVyKCk7XHJcblx0fSxcclxuXHJcblx0c3RhcnRUaW1lcjogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBfdGhpcyA9IHRoaXM7XHJcblx0XHR0aGlzLmludGVydmFsSGFuZGxlciA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcblxyXG5cdFx0XHRpZihfdGhpcy5pc1dhbGtpbmcgPT09IGZhbHNlKXtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBuZXh0TW92ZSA9IF90aGlzLl9nZXROZXh0TW92ZSgpO1xyXG5cdFx0XHRfdGhpcy5fc2V0Q3NzRGV2aWF0aW9uKG5leHRNb3ZlKTtcclxuXHRcdFx0X3RoaXMuY3VycmVudE1vdmUgPSBuZXh0TW92ZTtcclxuXHRcdH0sIHdhbGtUaW1lKTtcclxuXHR9LFxyXG5cclxuXHQvLyDliqDovb3kurrnianlm77niYfvvIzliJ3lp4vljJblp7/lir9cclxuXHRsb2FkQ2hhcmFjdGVyOiBmdW5jdGlvbihuYW1lKXtcclxuXHJcblx0XHR2YXIgY2hhcmFjdGVyRGF0YSA9IHRoaXMuY2hhcmFjdGVyRGF0YSA9IGNoYXJhY3RlcnNbbmFtZV07XHJcblx0XHR2YXIgY2hhcmFjdGVyU2l6ZSA9IGNoYXJhY3RlckRhdGEuc2l6ZTtcclxuXHRcdHZhciBpbWdQYXRoID0gXCJpbWFnZXMvXCIgKyBjaGFyYWN0ZXJEYXRhLmltZ05hbWU7XHJcblxyXG5cdFx0dmFyICRjaGFyYWN0ZXJEb20gPSAkKCc8ZGl2IGNsYXNzPVwiY3VycmVudENoYXJhY3RlclwiPjwvZGl2PicpO1xyXG5cdFx0JGNoYXJhY3RlckRvbS5hcHBlbmRUbygkKFwiLm1haW5cIikpO1xyXG5cclxuXHRcdCRjaGFyYWN0ZXJEb20uY3NzKHtcclxuXHRcdFx0XCJ3aWR0aFwiOiBjaGFyYWN0ZXJTaXplICsgXCJweFwiLFxyXG5cdFx0XHRcImhlaWdodFwiOiBjaGFyYWN0ZXJTaXplICsgXCJweFwiLFxyXG5cdFx0XHRcImJhY2tncm91bmQtaW1hZ2VcIjogXCJ1cmwoJ1wiICsgaW1nUGF0aCArIFwiJylcIlxyXG5cdFx0fSlcclxuXHJcblx0XHR0aGlzLl9zZXRDc3NEZXZpYXRpb24odGhpcy5jdXJyZW50TW92ZSk7XHJcblx0fSxcclxuXHJcblx0Ly8g5Y+W5b6X5LiL5LiA5qyh56e75Yqo55qE5L2N572uIFxyXG5cdC8vIFwiMDNcIiwgXCIzM1wiIC4uLlxyXG5cdF9nZXROZXh0TW92ZTogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjdXJyZW50TW92ZSA9IHRoaXMuY3VycmVudE1vdmU7XHJcblx0XHR2YXIgY3VycmVudERpcmVjdGlvbiA9IHRoaXMuY3VycmVudERpcmVjdGlvbjtcclxuXHRcdHZhciByZXR1cm5Nb3ZlID0gbnVsbDtcclxuXHJcblx0XHR2YXIgbW92ZUludCA9IHBhcnNlSW50KGN1cnJlbnRNb3ZlWzBdLCAxMCk7XHJcblx0XHRtb3ZlSW50Kys7XHJcblx0XHRpZihtb3ZlSW50ID4gMyl7XHJcblx0XHRcdG1vdmVJbnQgPSAwO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuTW92ZSA9IG1vdmVJbnQgKyBjdXJyZW50TW92ZVsxXTtcclxuXHRcdHJldHVybiByZXR1cm5Nb3ZlO1xyXG5cdFx0XHJcblx0fSxcclxuXHJcblx0Ly8g5byA5aeL6LWw6LevXHJcblx0d2FsazogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuaXNXYWxraW5nID0gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHQvLyDlgZzmraLotbDot69cclxuXHRzdG9wOiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5pc1dhbGtpbmcgPSBmYWxzZTtcclxuXHRcdHZhciBzdG9wTW92ZSA9IFwiMFwiICsgdGhpcy5jdXJyZW50TW92ZVsxXTtcclxuXHRcdHRoaXMuX3NldENzc0RldmlhdGlvbihzdG9wTW92ZSk7XHJcblx0fSxcclxuXHJcblx0Ly8g6K6+5a6a56e75Yqo5pa55ZCRXHJcblx0Ly8g6ZyA6KaB5Zyod2Fsa+aWueazleiwg+eUqOWJjeiwg+eUqFxyXG5cdC8vIOS5n+WPr+S7peWNleeLrOiwg+eUqO+8jOeUqOS6ju+8jOaSnuWime+8jOaSnuS6uuaXtuWAmeeahOi9rOWQkVxyXG5cdHNldERpcmVjdGlvbjogZnVuY3Rpb24oZGlyZWN0aW9uKXtcclxuXHJcblx0XHRpZihkaXJlY3Rpb24gIT0gdGhpcy5jdXJyZW50RGlyZWN0aW9uKXtcclxuXHRcdFx0Ly8g6Z2i5ZCR5b2T5YmN5pa55ZCRXHJcblx0XHRcdHN3aXRjaChkaXJlY3Rpb24pe1xyXG5cdFx0XHRcdGNhc2UgXCJsZWZ0XCI6XHJcblx0XHRcdFx0XHR0aGlzLmN1cnJlbnRNb3ZlID0gXCIwM1wiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcInJpZ2h0XCI6XHJcblx0XHRcdFx0XHR0aGlzLmN1cnJlbnRNb3ZlID0gXCIwMVwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcInVwXCI6XHJcblx0XHRcdFx0XHR0aGlzLmN1cnJlbnRNb3ZlID0gXCIwMlwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcImRvd25cIjpcclxuXHRcdFx0XHRcdHRoaXMuY3VycmVudE1vdmUgPSBcIjAwXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmN1cnJlbnREaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcblx0XHR0aGlzLl9zZXRDc3NEZXZpYXRpb24odGhpcy5jdXJyZW50TW92ZSk7XHJcblxyXG5cdH0sXHJcblxyXG5cdC8vIOiuvuWumuS6uueJqeWbvueJh+eahOWBj+enu+mHj1xyXG5cdC8vIG5leHRNb3ZlIDogXCIwMVwiLCBcIjMzXCIgLi4uXHJcblx0X3NldENzc0RldmlhdGlvbjogZnVuY3Rpb24obmV4dE1vdmUpIHtcclxuXHRcdHZhciBuZXh0UG9zaXRpb25zID0gdGhpcy5fZ2V0UG9zaXRpb25YWSh0aGlzLmNoYXJhY3RlckRhdGEuc2l6ZSwgbmV4dE1vdmUpO1xyXG5cdFx0dmFyICRjaGFyYWN0ZXJEb20gPSAkKFwiLmN1cnJlbnRDaGFyYWN0ZXJcIik7XHJcblx0XHQkY2hhcmFjdGVyRG9tLmNzcyh7XHJcblx0XHRcdFwicG9zaXRpb25cIjpcImFic29sdXRlXCIsXHJcblx0XHRcdFwiYmFja2dyb3VuZC1wb3NpdGlvbi14XCI6IG5leHRQb3NpdGlvbnMueCArIFwicHhcIixcclxuXHRcdFx0XCJiYWNrZ3JvdW5kLXBvc2l0aW9uLXlcIjogbmV4dFBvc2l0aW9ucy55ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHR9LFxyXG5cclxuXHQvLyDorqHnrpfkurrniannmoRjc3PlgY/np7vph49cclxuXHRfZ2V0UG9zaXRpb25YWTogZnVuY3Rpb24oc2l6ZSwgbW92ZVBvc2l0aW9uKSB7XHJcblx0XHR2YXIgeCA9IHNpemUgKiBwYXJzZUludChtb3ZlUG9zaXRpb25bMF0sIDEwKSAqIC0xO1xyXG5cdFx0dmFyIHkgPSBzaXplICogcGFyc2VJbnQobW92ZVBvc2l0aW9uWzFdLCAxMCkgKiAtMTtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHg6IHgsXHJcblx0XHRcdHk6IHlcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRnZXREaXJlY3Rpb246IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuZGlyZWN0aW9uO1xyXG5cdH1cclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhcmFjdGVyOyIsInZhciBtYXBzID0gcmVxdWlyZShcIi4vbWFwc1wiKTtcclxudmFyIENoYXJhY3RlciA9IHJlcXVpcmUoXCIuL0NoYXJhY3Rlci5qc1wiKTtcclxuXHJcbnZhciBtb3ZlVGltZSA9IDYwMDtcclxuXHJcbmZ1bmN0aW9uIENoYXJhY3RlckVuZ2luKGNvbmZpZykge1xyXG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdHRoaXMuZW5naW4gPSBudWxsO1xyXG5cdHRoaXMuZGF0YVNvdXJjZSA9IG51bGw7XHJcblxyXG5cdC8vIOS6uueJqeenu+WKqOaWueWQke+8jCBudWxs5Luj6KGo5YGc5q2iXHJcblx0dGhpcy5uZXh0RGlyZWN0aW9uID0gbnVsbDtcclxuXHJcblx0dGhpcy5jdXJyZW50Q2hhcmFjdGVyID0gbnVsbDtcclxuXHJcblx0Ly8g5Lq654mp5Zyo5Zyw5Zu+5Lit55qE5L2N572uXHJcblx0dGhpcy54ID0gMDtcclxuXHR0aGlzLnkgPSAwO1xyXG5cclxuXHR0aGlzLmlzV2Fsa2luZyA9IGZhbHNlO1xyXG59XHJcblxyXG5DaGFyYWN0ZXJFbmdpbi5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IENoYXJhY3RlckVuZ2luLFxyXG5cclxuXHRpbml0OiBmdW5jdGlvbihlbmdpbikge1xyXG5cdFx0dGhpcy5lbmdpbiA9IGVuZ2luO1xyXG5cdFx0dGhpcy5kYXRhU291cmNlID0gZW5naW4uZ2V0RGF0YVNvdXJjZSgpO1xyXG5cclxuXHRcdC8vIOe7keWumumUruebmOS6i+S7tlxyXG5cdFx0dGhpcy5iaW5kRXZlbnQoKTtcclxuXHJcblx0XHQvLyDliJ3lp4vljJbkurrnialcclxuXHRcdHZhciBjdXJyZW50Q2hhcmFjdGVyID0gdGhpcy5jdXJyZW50Q2hhcmFjdGVyID0gbmV3IENoYXJhY3RlcihlbmdpbiwgXCJnaXJsXCIpO1xyXG5cdFx0Ly8g5Lq654mp5pS+5Yiw5Zyw5Zu+56m65L2N572u5LiKXHJcblx0XHR2YXIgeCA9IHRoaXMueCA9IDMgKiB0aGlzLmNvbmZpZy5jZWxsU2l6ZTtcclxuXHRcdHZhciB5ID0gdGhpcy55ID0gMyAqIHRoaXMuY29uZmlnLmNlbGxTaXplO1xyXG5cdFx0JChcIi5jdXJyZW50Q2hhcmFjdGVyXCIpLmNzcyh7XHJcblx0XHRcdGxlZnQ6IHggKyBcInB4XCIsXHJcblx0XHRcdHRvcDogeSArIFwicHhcIlxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5zdGFydFRpbWVyKCk7XHJcblx0fSxcclxuXHJcblx0Ly8g5Lq654mp6LWw5Yqo55qE6ZSu55uY5LqL5Lu2XHJcblx0YmluZEV2ZW50OiBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBfdGhpcyA9IHRoaXM7XHJcblx0XHQkKGRvY3VtZW50LmJvZHkpLm9uKFwia2V5ZG93bi5jaGFyYWN0ZXIud2Fsa1wiLCBmdW5jdGlvbihlKXtcclxuXHJcblx0XHRcdGlmKF90aGlzLmlzV2Fsa2luZyA9PT0gdHJ1ZSl7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRzd2l0Y2goZS5rZXlDb2RlKXtcclxuXHRcdFx0XHRjYXNlIDM3OlxyXG5cdFx0XHRcdFx0X3RoaXMubmV4dERpcmVjdGlvbiA9IFwibGVmdFwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzODpcclxuXHRcdFx0XHRcdF90aGlzLm5leHREaXJlY3Rpb24gPSBcInVwXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDM5OlxyXG5cdFx0XHRcdFx0X3RoaXMubmV4dERpcmVjdGlvbiA9IFwicmlnaHRcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgNDA6XHJcblx0XHRcdFx0XHRfdGhpcy5uZXh0RGlyZWN0aW9uID0gXCJkb3duXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdF90aGlzLmN1cnJlbnRDaGFyYWN0ZXIuc2V0RGlyZWN0aW9uKF90aGlzLm5leHREaXJlY3Rpb24pO1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0Ly8g5a6a5pe25qOA5rWL5Lq654mp6LWw5YqoXHJcblx0c3RhcnRUaW1lcjogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0dmFyIF90aGlzID0gdGhpcztcclxuXHRcdHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZihfdGhpcy5pc1dhbGtpbmcgPT09IHRydWUpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKF90aGlzLm5leHREaXJlY3Rpb24gPT0gbnVsbCkge1xyXG5cdFx0XHRcdF90aGlzLmN1cnJlbnRDaGFyYWN0ZXIuc3RvcCgpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0X3RoaXMud2FsaygpO1xyXG5cdFx0fSwgMTApO1xyXG5cdH0sXHJcblxyXG5cdC8vIOS6uueJqeenu+WKqFxyXG5cdHdhbGs6IGZ1bmN0aW9uKCl7XHJcblxyXG5cdFx0dmFyIF90aGlzID0gdGhpcztcclxuXHRcdHZhciAkY2hhcmFjdGVyRG9tID0gJChcIi5jdXJyZW50Q2hhcmFjdGVyXCIpO1xyXG5cdFx0aWYoJGNoYXJhY3RlckRvbS5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG5leHRNYXBYeSA9IHRoaXMuX2dldE5leHRNYXBYeSh0aGlzLm5leHREaXJlY3Rpb24pO1xyXG5cdFx0dmFyIGNhbldhbGtGbGcgPSB0aGlzLl9jYW5XYWxrKG5leHRNYXBYeSk7XHJcblxyXG5cdFx0aWYoY2FuV2Fsa0ZsZyA9PT0gdHJ1ZSl7XHJcblx0XHRcdHRoaXMuaXNXYWxraW5nID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5jdXJyZW50Q2hhcmFjdGVyLndhbGsoKTtcclxuXHRcdFx0dGhpcy5fbW92ZUNoYXJhY3RlcihuZXh0TWFwWHkueCwgbmV4dE1hcFh5LnksIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0X3RoaXMuaXNXYWxraW5nID0gZmFsc2U7XHJcblx0XHRcdFx0X3RoaXMubmV4dERpcmVjdGlvbiA9IG51bGw7XHJcblx0XHRcdFx0X3RoaXMueCA9IG5leHRNYXBYeS54O1xyXG5cdFx0XHRcdF90aGlzLnkgPSBuZXh0TWFwWHkueTtcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfbW92ZUNoYXJhY3RlcjogZnVuY3Rpb24oeCwgeSwgY2FsbGJhY2tGbil7XHJcblx0XHR2YXIgJGNoYXJhY3RlckRvbSA9ICQoXCIuY3VycmVudENoYXJhY3RlclwiKTtcclxuXHRcdCRjaGFyYWN0ZXJEb20uYW5pbWF0ZSh7XHJcblx0XHRcdFwibGVmdFwiOiB4ICsgXCJweFwiLFxyXG5cdFx0XHRcInRvcFwiOiB5ICsgXCJweFwiXHJcblx0XHR9LCBtb3ZlVGltZSwgXCJsaW5lYXJcIiwgY2FsbGJhY2tGbik7XHJcblx0fSxcclxuXHJcblx0Ly8g5Zyw5Zu+5Lit77yM5LiL5LiA5Liq54K55piv5ZCm5Li65Y+v5Lul56e75Yqo54K5XHJcblx0X2NhbldhbGs6IGZ1bmN0aW9uKG5leHRNYXBYeSl7XHJcblxyXG5cdFx0aWYodGhpcy5uZXh0RGlyZWN0aW9uID09IG51bGwpe1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8g6LaF5Ye65Zyw5Zu+XHJcblx0XHRpZihuZXh0TWFwWHkueCA8IDAgfHwgbmV4dE1hcFh5LnkgPCAwKXtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIOS4jeiDveihjOi1sOeahOWcsOWbvlxyXG5cdFx0dmFyIG1hcENlbGxOYW1lID0gdGhpcy5kYXRhU291cmNlLmdldChuZXh0TWFwWHkueCwgbmV4dE1hcFh5LnkpLmJnO1xyXG5cdFx0aWYobWFwc1tcIm1hcE1hcHBpbmdcIl1bbWFwQ2VsbE5hbWVdW1wiY2FuV2Fsa1wiXSA9PT0gZmFsc2Upe1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0Ly8g5qC55o2u6KGM6LWw5pa55ZCR5Y+W5b6X77yM5LiL5LiA5Liq5Zyw5Zu+55qEeO+8jHnlnZDmoIdcclxuXHRfZ2V0TmV4dE1hcFh5OiBmdW5jdGlvbihkaXJlY3Rpb24pe1xyXG5cdFx0dmFyIGNlbGxTaXplID0gdGhpcy5jb25maWcuY2VsbFNpemU7XHJcblx0XHR2YXIgeCA9IDA7XHJcblx0XHR2YXIgeSA9IDA7XHJcblx0XHRzd2l0Y2goZGlyZWN0aW9uKXtcclxuXHRcdFx0Y2FzZSBcImxlZnRcIjpcclxuXHRcdFx0XHR4ID0gdGhpcy54IC0gY2VsbFNpemU7XHJcblx0XHRcdFx0eSA9IHRoaXMueTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcInJpZ2h0XCI6XHJcblx0XHRcdFx0eCA9IHRoaXMueCArIGNlbGxTaXplO1xyXG5cdFx0XHRcdHkgPSB0aGlzLnk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJ1cFwiOlxyXG5cdFx0XHRcdHggPSB0aGlzLng7XHJcblx0XHRcdFx0eSA9IHRoaXMueSAtIGNlbGxTaXplO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiZG93blwiOlxyXG5cdFx0XHRcdHggPSB0aGlzLng7XHJcblx0XHRcdFx0eSA9IHRoaXMueSArIGNlbGxTaXplO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDp4LFxyXG5cdFx0XHR5OnlcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhcmFjdGVyRW5naW4iLCJ2YXIgQ29vck1hcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5tYXAgPSBuZXcgTWFwKCk7XHJcbn1cclxuQ29vck1hcC5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IENvb3JNYXAsXHJcblx0Z2V0OiBmdW5jdGlvbih4LCB5KXtcclxuXHRcdHZhciBrID0gbnVsbDtcclxuXHRcdGZvcihrZXkgb2YgdGhpcy5tYXAua2V5cygpKXtcclxuXHRcdFx0aWYoa2V5LnggPT0geCAmJiBrZXkueSA9PSB5KXtcclxuXHRcdFx0XHRrID0ga2V5O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMubWFwLmdldChrKTtcclxuXHR9LFxyXG5cdHNldDogZnVuY3Rpb24oeCx5LCB2YWx1ZSl7XHJcblx0XHR2YXIgayA9IG51bGw7XHJcblx0XHRmb3Ioa2V5IG9mIHRoaXMubWFwLmtleXMoKSl7XHJcblx0XHRcdGlmKGtleS54ID09IHggJiYga2V5LnkgPT0geSl7XHJcblx0XHRcdFx0ayA9IGtleTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYoaykge1xyXG5cdFx0XHR0aGlzLm1hcC5zZXQoaywgdmFsdWUpO1xyXG5cdFx0fWVsc2Uge1xyXG5cdFx0XHR0aGlzLm1hcC5zZXQoe1wieFwiOnggLCBcInlcIjp5fSwgdmFsdWUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0Z2V0TWFwOiBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB0aGlzLm1hcDtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29vck1hcDsiLCJ2YXIgTWFwRW5naW4gPSByZXF1aXJlKFwiLi9NYXBFbmdpblwiKTtcclxudmFyIENoYXJhY3RlckVuZ2luID0gcmVxdWlyZShcIi4vQ2hhcmFjdGVyRW5naW4uanNcIik7XHJcblxyXG5mdW5jdGlvbiBFbmdpbihjb25maWcpIHtcclxuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuXHR0aGlzLmRhdGFTb3VyY2UgPSBudWxsO1xyXG5cdHRoaXMubWFwRW5naW4gPSBuZXcgTWFwRW5naW4oY29uZmlnKTtcclxuXHR0aGlzLmNoYXJhY3RlckVuZ2luID0gbmV3IENoYXJhY3RlckVuZ2luKGNvbmZpZyk7XHJcbn1cclxuXHJcbkVuZ2luLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogRW5naW4sXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5tYXBFbmdpbi5pbml0KHRoaXMpO1xyXG5cdFx0dGhpcy5jaGFyYWN0ZXJFbmdpbi5pbml0KHRoaXMpO1xyXG5cdH0sXHJcblxyXG5cdHN0YXJ0OiBmdW5jdGlvbigpIHtcclxuXHJcblx0fSxcclxuXHJcblx0c2V0RGF0YVNvdXJjZTogZnVuY3Rpb24oZGF0YVNvdXJjZSkge1xyXG5cdFx0dGhpcy5kYXRhU291cmNlID0gZGF0YVNvdXJjZTtcclxuXHR9LFxyXG5cclxuXHRnZXREYXRhU291cmNlOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHRoaXMuZGF0YVNvdXJjZTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzPUVuZ2luO1xyXG4iLCJ2YXIgQ29vck1hcCA9IHJlcXVpcmUoXCIuL0Nvb3JNYXAuanNcIik7XHJcblxyXG5mdW5jdGlvbiBNYXBFbmdpbihjb25maWcpe1xyXG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdHRoaXMuZW5naW4gPSBudWxsO1xyXG5cdHRoaXMubWFwcyA9IHJlcXVpcmUoXCIuL21hcHMuanNcIik7XHJcblx0dGhpcy5tYXBNYXBwaW5nID0gdGhpcy5tYXBzLm1hcE1hcHBpbmc7XHJcbn1cclxuXHJcbk1hcEVuZ2luLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogTWFwRW5naW4sXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKGVuZ2luKXtcclxuXHJcblx0XHR0aGlzLmVuZ2luID0gZW5naW47XHJcblxyXG5cdFx0Ly8gcHJlLWxvYWQgYWxsIGltYWdlc1xyXG5cdFx0dmFyIG1hcE1hcHBpbmcgPSB0aGlzLm1hcHMubWFwTWFwcGluZztcclxuXHRcdHZhciAkbG9hZERpdiA9ICQoXCI8ZGl2IGNsYXNzPSdkaXNwbGF5X25vbmUnPjwvZGl2PlwiKTtcclxuXHRcdCRsb2FkRGl2LmFwcGVuZFRvKCQoZG9jdW1lbnQuYm9keSkpO1xyXG5cdFx0Zm9yKHZhciBrZXkgaW4gbWFwTWFwcGluZyl7XHJcblx0XHRcdHZhciBpbWFnZVBhdGggPSBcImltYWdlcy9cIiArIG1hcE1hcHBpbmdba2V5XS5uYW1lO1xyXG5cdFx0XHQkKCc8aW1nLz4nKS5hdHRyKFwic3JjXCIsIGltYWdlUGF0aCkuYXBwZW5kVG8oJGxvYWREaXYpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMubG9hZE1hcChcIjAxXCIpO1xyXG5cdH0sXHJcblxyXG5cdGxvYWRNYXA6IGZ1bmN0aW9uKG1hcEtleSkge1xyXG5cdFx0JChcIi5tYWluIC5tYXBMYXllclwiKS5yZW1vdmUoKTtcclxuXHRcdHZhciAkbWFwTGF5ZXIgPSAkKFwiPGRpdiBjbGFzcz0nbWFwTGF5ZXInPjwvZGl2PlwiKTtcclxuXHRcdCRtYXBMYXllci5hcHBlbmRUbygkKFwiLm1haW5cIikpO1xyXG5cclxuXHRcdC8vIHNldCBtYXAgdG90YWwgaGVpZ2h0IGFuZCB3aWR0aFxyXG5cdFx0dmFyIG1hcERhdGEgPSB0aGlzLm1hcHNbbWFwS2V5XTtcclxuXHRcdHZhciBjZWxsU2l6ZSA9IHRoaXMuY29uZmlnLmNlbGxTaXplO1xyXG5cdFx0dmFyIGhMZW4gPSBtYXBEYXRhLmxlbmd0aDtcclxuXHRcdHZhciB3TGVuID0gbWFwRGF0YVswXS5sZW5ndGg7XHJcblx0XHR2YXIgd2lkdGggPSB3TGVuICogY2VsbFNpemU7XHJcblx0XHR2YXIgaGVpZ2h0ID0gaExlbiAqIGNlbGxTaXplO1xyXG5cdFx0JG1hcExheWVyLmNzcyh7XHJcblx0XHRcdHdpZHRoOiB3aWR0aCArIFwicHhcIixcclxuXHRcdFx0aGVpZ2h0OiBoZWlnaHQgKyBcInB4XCJcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIOagueaNruWcsOWbvuWBmuaVsOaNruaIkGRhdGFTb3VyY2XvvIzlubborr7lrprliLBlbmdpbuWvueixoeS4rVxyXG5cdFx0Ly8g5qC55o2u5Zyw5Zu+5pWw5o2u55S75Ye65Zyw5Zu+XHJcblx0XHR2YXIgdmFsdWUgPSBudWxsO1xyXG5cdFx0dmFyIHJvdyA9IG51bGw7XHJcblx0XHR2YXIgeCx5O1xyXG5cdFx0dmFyIGRhdGFTb3VyY2UgPSBuZXcgQ29vck1hcCgpO1xyXG5cdFx0Zm9yKHZhciBqPTA7ajxtYXBEYXRhLmxlbmd0aDtqKyspe1xyXG5cdFx0XHRyb3cgPSBtYXBEYXRhW2pdO1xyXG5cdFx0XHRmb3IodmFyIGk9MDtpPHJvdy5sZW5ndGg7aSsrKXtcclxuXHRcdFx0XHR2YWx1ZSA9IHRoaXMubWFwTWFwcGluZ1tyb3dbaV1dLm5hbWU7XHJcblx0XHRcdFx0eCA9IGkgKiBjZWxsU2l6ZTtcclxuXHRcdFx0XHR5ID0gaiAqIGNlbGxTaXplO1xyXG5cclxuXHRcdFx0XHQvLyBkYXRhc291cmNlXHJcblx0XHRcdFx0ZGF0YVNvdXJjZS5zZXQoeCx5LCB7Ymc6IHJvd1tpXX0pO1xyXG5cclxuXHRcdFx0XHQvLyBpbWFnZXNcclxuXHRcdFx0XHQvLyB2YXIgJGltZyA9ICQoJzxpbWcgYWx0PVwiXCIgLz4nKS5hdHRyKFwic3JjXCIsIFwiaW1hZ2VzL1wiICsgdmFsdWUpO1xyXG5cdFx0XHRcdHZhciAkaW1nID0gJCgnPGRpdj48L2Rpdj4nKS50ZXh0KHZhbHVlLnN1YnN0cmluZygwLDIpKTtcclxuXHRcdFx0XHQkaW1nLmNzcyh7XHJcblx0XHRcdFx0XHR3aWR0aDogY2VsbFNpemUgKyBcInB4XCIsXHJcblx0XHRcdFx0XHRoZWlnaHQ6IGNlbGxTaXplICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuXHRcdFx0XHRcdGxlZnQ6IHggKyBcInB4XCIsXHJcblx0XHRcdFx0XHR0b3A6IHkgKyBcInB4XCJcclxuXHRcdFx0XHR9KS5hcHBlbmRUbygkbWFwTGF5ZXIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR0aGlzLmVuZ2luLnNldERhdGFTb3VyY2UoZGF0YVNvdXJjZSk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEVuZ2luO1xyXG4iLCJ2YXIgY2hhcmFjdGVycyA9IHt9XHJcblxyXG5jaGFyYWN0ZXJzW1wiZ2lybFwiXSA9IHtcclxuXHRpbWdOYW1lOiBcImNfZ2lybC5wbmdcIixcclxuXHRzaXplOiA0NVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjaGFyYWN0ZXJzOyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGNlbGxTaXplOiA0NVxyXG59IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoXCIuL2NvbmZpZy5qc1wiKTtcclxudmFyIEVuZ2luID0gcmVxdWlyZShcIi4vRW5naW4uanNcIik7XHJcblxyXG52YXIgZW5naW4gPSBuZXcgRW5naW4oY29uZmlnKTtcclxuXHJcblxyXG4kKGZ1bmN0aW9uKCl7XHJcblx0ZW5naW4uaW5pdCgpO1xyXG59KSIsInZhciBtYXBzID0ge31cclxuXHJcbm1hcHNbXCJtYXBNYXBwaW5nXCJdID0ge1xyXG5cdFwidHJcIjoge1xyXG5cdFx0bmFtZTogXCJ0cmVlLnBuZ1wiLFxyXG5cdFx0Y2FuV2FsazogZmFsc2VcclxuXHR9LFxyXG5cdFwic2VcIjoge1xyXG5cdFx0bmFtZTogXCJzZWEucG5nXCIsXHJcblx0XHRjYW5XYWxrOiBmYWxzZVxyXG5cdH0sXHJcblx0XCJiZVwiOiB7XHJcblx0XHRuYW1lOiBcImJlYWNoLnBuZ1wiLFxyXG5cdFx0Y2FuV2FsazogdHJ1ZVxyXG5cdH0sXHJcblx0XCJsYVwiOiB7XHJcblx0XHRuYW1lOiBcImxhbmQucG5nXCIsXHJcblx0XHRjYW5XYWxrOiB0cnVlXHJcblx0fSxcclxuXHRcImJyXCI6IHtcclxuXHRcdG5hbWU6IFwiYnJpZGdlLnBuZ1wiLFxyXG5cdFx0Y2FuV2FsazogdHJ1ZVxyXG5cdH1cclxufVxyXG5cclxubWFwc1tcIjAxXCJdID1cclxuXCJ0cix0cix0cixiZSxzZSxicixzZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLGJlLGJyLGJlLGJlLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixsYSxsYSxsYSxsYSxsYSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cImxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhX1wiICtcclxuXCJ0cix0cix0cixsYSxsYSxsYSxsYSxsYSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLGJlLGJyLGJlLGJlLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixiZSxzZSxicixzZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJcIjtcclxuXHJcblxyXG4vLyDlnLDlm77mlbDmja7kuLLovazkuoznu7TmlbDnu4RcclxuZnVuY3Rpb24gdG9BcnJheShzdHIpe1xyXG5cdHZhciByZXR1cm5BcnJheSA9IFtdO1xyXG5cdHZhciBsaW5lQXJyID0gc3RyLnNwbGl0KFwiX1wiKTtcclxuXHRsaW5lQXJyLmZvckVhY2goZnVuY3Rpb24obGluZSl7XHJcblx0XHRyZXR1cm5BcnJheS5wdXNoKGxpbmUuc3BsaXQoXCIsXCIpKTtcclxuXHR9KTtcclxuXHRyZXR1cm4gcmV0dXJuQXJyYXk7XHJcbn1cclxuXHJcblxyXG5mb3IodmFyIGtleSBpbiBtYXBzKXtcclxuXHRpZigvXFxkXFxkLy50ZXN0KGtleSkpe1xyXG5cdFx0bWFwc1trZXldID0gdG9BcnJheShtYXBzW2tleV0pO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBtYXBzIl19
