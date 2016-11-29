(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var characters = require("./characters.js");

// 走一步的时间
var walkTime = 300;


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
		}, this.walkTime);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL1VzZXJzL3poYW9faG9uZ3NoZW5nL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJycGcvZnJvbnRlbmQvQ2hhcmFjdGVyLmpzIiwicnBnL2Zyb250ZW5kL0NoYXJhY3RlckVuZ2luLmpzIiwicnBnL2Zyb250ZW5kL0Nvb3JNYXAuanMiLCJycGcvZnJvbnRlbmQvRW5naW4uanMiLCJycGcvZnJvbnRlbmQvTWFwRW5naW4uanMiLCJycGcvZnJvbnRlbmQvY2hhcmFjdGVycy5qcyIsInJwZy9mcm9udGVuZC9jb25maWcuanMiLCJycGcvZnJvbnRlbmQvaW5kZXguanMiLCJycGcvZnJvbnRlbmQvbWFwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGNoYXJhY3RlcnMgPSByZXF1aXJlKFwiLi9jaGFyYWN0ZXJzLmpzXCIpO1xyXG5cclxuLy8g6LWw5LiA5q2l55qE5pe26Ze0XHJcbnZhciB3YWxrVGltZSA9IDMwMDtcclxuXHJcblxyXG5mdW5jdGlvbiBDaGFyYWN0ZXIoZW5naW4sIENoYXJhY3Rlck5hbWUpe1xyXG5cdHRoaXMuZW5naW4gPSBlbmdpbjtcclxuXHR0aGlzLmNoYXJhY3RlckRhdGEgPSBudWxsO1xyXG5cdHRoaXMuaW50ZXJ2YWxIYW5kbGVyID0gbnVsbDtcclxuXHR0aGlzLmlzV2Fsa2luZyA9IGZhbHNlO1xyXG5cclxuXHQvLyDkurrnianliqjkvZznmoRjc3PlgY/np7vnlKggeCA9IDA7IHkgPSAxXHJcblx0dGhpcy5jdXJyZW50TW92ZSA9IFwiMDFcIjsgXHJcblx0Ly8g5Lq654mp6Z2i5ZCR55qE5pa55ZCRXHJcblx0dGhpcy5kaXJlY3Rpb24gPSBcInJpZ2h0XCI7XHJcblxyXG5cdHRoaXMuaW5pdChDaGFyYWN0ZXJOYW1lKTtcclxufVxyXG5cclxuQ2hhcmFjdGVyLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJjdG9yOiBDaGFyYWN0ZXIsXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKENoYXJhY3Rlck5hbWUpe1xyXG5cdFx0dGhpcy5sb2FkQ2hhcmFjdGVyKENoYXJhY3Rlck5hbWUpO1xyXG5cdFx0dGhpcy5zdGFydFRpbWVyKCk7XHJcblx0fSxcclxuXHJcblx0c3RhcnRUaW1lcjogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBfdGhpcyA9IHRoaXM7XHJcblx0XHR0aGlzLmludGVydmFsSGFuZGxlciA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcblxyXG5cdFx0XHRpZihfdGhpcy5pc1dhbGtpbmcgPT09IGZhbHNlKXtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBuZXh0TW92ZSA9IF90aGlzLl9nZXROZXh0TW92ZSgpO1xyXG5cdFx0XHRfdGhpcy5fc2V0Q3NzRGV2aWF0aW9uKG5leHRNb3ZlKTtcclxuXHRcdFx0X3RoaXMuY3VycmVudE1vdmUgPSBuZXh0TW92ZTtcclxuXHRcdH0sIHRoaXMud2Fsa1RpbWUpO1xyXG5cdH0sXHJcblxyXG5cdC8vIOWKoOi9veS6uueJqeWbvueJh++8jOWIneWni+WMluWnv+WKv1xyXG5cdGxvYWRDaGFyYWN0ZXI6IGZ1bmN0aW9uKG5hbWUpe1xyXG5cclxuXHRcdHZhciBjaGFyYWN0ZXJEYXRhID0gdGhpcy5jaGFyYWN0ZXJEYXRhID0gY2hhcmFjdGVyc1tuYW1lXTtcclxuXHRcdHZhciBjaGFyYWN0ZXJTaXplID0gY2hhcmFjdGVyRGF0YS5zaXplO1xyXG5cdFx0dmFyIGltZ1BhdGggPSBcImltYWdlcy9cIiArIGNoYXJhY3RlckRhdGEuaW1nTmFtZTtcclxuXHJcblx0XHR2YXIgJGNoYXJhY3RlckRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjdXJyZW50Q2hhcmFjdGVyXCI+PC9kaXY+Jyk7XHJcblx0XHQkY2hhcmFjdGVyRG9tLmFwcGVuZFRvKCQoXCIubWFpblwiKSk7XHJcblxyXG5cdFx0JGNoYXJhY3RlckRvbS5jc3Moe1xyXG5cdFx0XHRcIndpZHRoXCI6IGNoYXJhY3RlclNpemUgKyBcInB4XCIsXHJcblx0XHRcdFwiaGVpZ2h0XCI6IGNoYXJhY3RlclNpemUgKyBcInB4XCIsXHJcblx0XHRcdFwiYmFja2dyb3VuZC1pbWFnZVwiOiBcInVybCgnXCIgKyBpbWdQYXRoICsgXCInKVwiXHJcblx0XHR9KVxyXG5cclxuXHRcdHRoaXMuX3NldENzc0RldmlhdGlvbih0aGlzLmN1cnJlbnRNb3ZlKTtcclxuXHR9LFxyXG5cclxuXHQvLyDlj5blvpfkuIvkuIDmrKHnp7vliqjnmoTkvY3nva4gXHJcblx0Ly8gXCIwM1wiLCBcIjMzXCIgLi4uXHJcblx0X2dldE5leHRNb3ZlOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIGN1cnJlbnRNb3ZlID0gdGhpcy5jdXJyZW50TW92ZTtcclxuXHRcdHZhciBjdXJyZW50RGlyZWN0aW9uID0gdGhpcy5jdXJyZW50RGlyZWN0aW9uO1xyXG5cdFx0dmFyIHJldHVybk1vdmUgPSBudWxsO1xyXG5cclxuXHRcdHZhciBtb3ZlSW50ID0gcGFyc2VJbnQoY3VycmVudE1vdmVbMF0sIDEwKTtcclxuXHRcdG1vdmVJbnQrKztcclxuXHRcdGlmKG1vdmVJbnQgPiAzKXtcclxuXHRcdFx0bW92ZUludCA9IDA7XHJcblx0XHR9XHJcblx0XHRyZXR1cm5Nb3ZlID0gbW92ZUludCArIGN1cnJlbnRNb3ZlWzFdO1xyXG5cdFx0cmV0dXJuIHJldHVybk1vdmU7XHJcblx0XHRcclxuXHR9LFxyXG5cclxuXHQvLyDlvIDlp4votbDot69cclxuXHR3YWxrOiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5pc1dhbGtpbmcgPSB0cnVlO1xyXG5cdH0sXHJcblxyXG5cdC8vIOWBnOatoui1sOi3r1xyXG5cdHN0b3A6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLmlzV2Fsa2luZyA9IGZhbHNlO1xyXG5cdFx0dmFyIHN0b3BNb3ZlID0gXCIwXCIgKyB0aGlzLmN1cnJlbnRNb3ZlWzFdO1xyXG5cdFx0dGhpcy5fc2V0Q3NzRGV2aWF0aW9uKHN0b3BNb3ZlKTtcclxuXHR9LFxyXG5cclxuXHQvLyDorr7lrprnp7vliqjmlrnlkJFcclxuXHQvLyDpnIDopoHlnKh3YWxr5pa55rOV6LCD55So5YmN6LCD55SoXHJcblx0Ly8g5Lmf5Y+v5Lul5Y2V54us6LCD55So77yM55So5LqO77yM5pKe5aKZ77yM5pKe5Lq65pe25YCZ55qE6L2s5ZCRXHJcblx0c2V0RGlyZWN0aW9uOiBmdW5jdGlvbihkaXJlY3Rpb24pe1xyXG5cclxuXHRcdGlmKGRpcmVjdGlvbiAhPSB0aGlzLmN1cnJlbnREaXJlY3Rpb24pe1xyXG5cdFx0XHQvLyDpnaLlkJHlvZPliY3mlrnlkJFcclxuXHRcdFx0c3dpdGNoKGRpcmVjdGlvbil7XHJcblx0XHRcdFx0Y2FzZSBcImxlZnRcIjpcclxuXHRcdFx0XHRcdHRoaXMuY3VycmVudE1vdmUgPSBcIjAzXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwicmlnaHRcIjpcclxuXHRcdFx0XHRcdHRoaXMuY3VycmVudE1vdmUgPSBcIjAxXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwidXBcIjpcclxuXHRcdFx0XHRcdHRoaXMuY3VycmVudE1vdmUgPSBcIjAyXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwiZG93blwiOlxyXG5cdFx0XHRcdFx0dGhpcy5jdXJyZW50TW92ZSA9IFwiMDBcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuY3VycmVudERpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuXHRcdHRoaXMuX3NldENzc0RldmlhdGlvbih0aGlzLmN1cnJlbnRNb3ZlKTtcclxuXHJcblx0fSxcclxuXHJcblx0Ly8g6K6+5a6a5Lq654mp5Zu+54mH55qE5YGP56e76YePXHJcblx0Ly8gbmV4dE1vdmUgOiBcIjAxXCIsIFwiMzNcIiAuLi5cclxuXHRfc2V0Q3NzRGV2aWF0aW9uOiBmdW5jdGlvbihuZXh0TW92ZSkge1xyXG5cdFx0dmFyIG5leHRQb3NpdGlvbnMgPSB0aGlzLl9nZXRQb3NpdGlvblhZKHRoaXMuY2hhcmFjdGVyRGF0YS5zaXplLCBuZXh0TW92ZSk7XHJcblx0XHR2YXIgJGNoYXJhY3RlckRvbSA9ICQoXCIuY3VycmVudENoYXJhY3RlclwiKTtcclxuXHRcdCRjaGFyYWN0ZXJEb20uY3NzKHtcclxuXHRcdFx0XCJwb3NpdGlvblwiOlwiYWJzb2x1dGVcIixcclxuXHRcdFx0XCJiYWNrZ3JvdW5kLXBvc2l0aW9uLXhcIjogbmV4dFBvc2l0aW9ucy54ICsgXCJweFwiLFxyXG5cdFx0XHRcImJhY2tncm91bmQtcG9zaXRpb24teVwiOiBuZXh0UG9zaXRpb25zLnkgKyBcInB4XCJcclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdC8vIOiuoeeul+S6uueJqeeahGNzc+WBj+enu+mHj1xyXG5cdF9nZXRQb3NpdGlvblhZOiBmdW5jdGlvbihzaXplLCBtb3ZlUG9zaXRpb24pIHtcclxuXHRcdHZhciB4ID0gc2l6ZSAqIHBhcnNlSW50KG1vdmVQb3NpdGlvblswXSwgMTApICogLTE7XHJcblx0XHR2YXIgeSA9IHNpemUgKiBwYXJzZUludChtb3ZlUG9zaXRpb25bMV0sIDEwKSAqIC0xO1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDogeCxcclxuXHRcdFx0eTogeVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGdldERpcmVjdGlvbjogZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5kaXJlY3Rpb247XHJcblx0fVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGFyYWN0ZXI7IiwidmFyIG1hcHMgPSByZXF1aXJlKFwiLi9tYXBzXCIpO1xyXG52YXIgQ2hhcmFjdGVyID0gcmVxdWlyZShcIi4vQ2hhcmFjdGVyLmpzXCIpO1xyXG5cclxudmFyIG1vdmVUaW1lID0gNjAwO1xyXG5cclxuZnVuY3Rpb24gQ2hhcmFjdGVyRW5naW4oY29uZmlnKSB7XHJcblx0dGhpcy5jb25maWcgPSBjb25maWc7XHJcblx0dGhpcy5lbmdpbiA9IG51bGw7XHJcblx0dGhpcy5kYXRhU291cmNlID0gbnVsbDtcclxuXHJcblx0Ly8g5Lq654mp56e75Yqo5pa55ZCR77yMIG51bGzku6PooajlgZzmraJcclxuXHR0aGlzLm5leHREaXJlY3Rpb24gPSBudWxsO1xyXG5cclxuXHR0aGlzLmN1cnJlbnRDaGFyYWN0ZXIgPSBudWxsO1xyXG5cclxuXHQvLyDkurrnianlnKjlnLDlm77kuK3nmoTkvY3nva5cclxuXHR0aGlzLnggPSAwO1xyXG5cdHRoaXMueSA9IDA7XHJcblxyXG5cdHRoaXMuaXNXYWxraW5nID0gZmFsc2U7XHJcbn1cclxuXHJcbkNoYXJhY3RlckVuZ2luLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogQ2hhcmFjdGVyRW5naW4sXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKGVuZ2luKSB7XHJcblx0XHR0aGlzLmVuZ2luID0gZW5naW47XHJcblx0XHR0aGlzLmRhdGFTb3VyY2UgPSBlbmdpbi5nZXREYXRhU291cmNlKCk7XHJcblxyXG5cdFx0Ly8g57uR5a6a6ZSu55uY5LqL5Lu2XHJcblx0XHR0aGlzLmJpbmRFdmVudCgpO1xyXG5cclxuXHRcdC8vIOWIneWni+WMluS6uueJqVxyXG5cdFx0dmFyIGN1cnJlbnRDaGFyYWN0ZXIgPSB0aGlzLmN1cnJlbnRDaGFyYWN0ZXIgPSBuZXcgQ2hhcmFjdGVyKGVuZ2luLCBcImdpcmxcIik7XHJcblx0XHQvLyDkurrnianmlL7liLDlnLDlm77nqbrkvY3nva7kuIpcclxuXHRcdHZhciB4ID0gdGhpcy54ID0gMyAqIHRoaXMuY29uZmlnLmNlbGxTaXplO1xyXG5cdFx0dmFyIHkgPSB0aGlzLnkgPSAzICogdGhpcy5jb25maWcuY2VsbFNpemU7XHJcblx0XHQkKFwiLmN1cnJlbnRDaGFyYWN0ZXJcIikuY3NzKHtcclxuXHRcdFx0bGVmdDogeCArIFwicHhcIixcclxuXHRcdFx0dG9wOiB5ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLnN0YXJ0VGltZXIoKTtcclxuXHR9LFxyXG5cclxuXHQvLyDkurrnianotbDliqjnmoTplK7nm5jkuovku7ZcclxuXHRiaW5kRXZlbnQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIF90aGlzID0gdGhpcztcclxuXHRcdCQoZG9jdW1lbnQuYm9keSkub24oXCJrZXlkb3duLmNoYXJhY3Rlci53YWxrXCIsIGZ1bmN0aW9uKGUpe1xyXG5cclxuXHRcdFx0aWYoX3RoaXMuaXNXYWxraW5nID09PSB0cnVlKXtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHN3aXRjaChlLmtleUNvZGUpe1xyXG5cdFx0XHRcdGNhc2UgMzc6XHJcblx0XHRcdFx0XHRfdGhpcy5uZXh0RGlyZWN0aW9uID0gXCJsZWZ0XCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDM4OlxyXG5cdFx0XHRcdFx0X3RoaXMubmV4dERpcmVjdGlvbiA9IFwidXBcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMzk6XHJcblx0XHRcdFx0XHRfdGhpcy5uZXh0RGlyZWN0aW9uID0gXCJyaWdodFwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSA0MDpcclxuXHRcdFx0XHRcdF90aGlzLm5leHREaXJlY3Rpb24gPSBcImRvd25cIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0X3RoaXMuY3VycmVudENoYXJhY3Rlci5zZXREaXJlY3Rpb24oX3RoaXMubmV4dERpcmVjdGlvbik7XHJcblx0XHR9KTtcclxuXHR9LFxyXG5cclxuXHQvLyDlrprml7bmo4DmtYvkurrnianotbDliqhcclxuXHRzdGFydFRpbWVyOiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xyXG5cdFx0c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmKF90aGlzLmlzV2Fsa2luZyA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYoX3RoaXMubmV4dERpcmVjdGlvbiA9PSBudWxsKSB7XHJcblx0XHRcdFx0X3RoaXMuY3VycmVudENoYXJhY3Rlci5zdG9wKCk7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRfdGhpcy53YWxrKCk7XHJcblx0XHR9LCAxMCk7XHJcblx0fSxcclxuXHJcblx0Ly8g5Lq654mp56e75YqoXHJcblx0d2FsazogZnVuY3Rpb24oKXtcclxuXHJcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xyXG5cdFx0dmFyICRjaGFyYWN0ZXJEb20gPSAkKFwiLmN1cnJlbnRDaGFyYWN0ZXJcIik7XHJcblx0XHRpZigkY2hhcmFjdGVyRG9tLmxlbmd0aCA9PSAwKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgbmV4dE1hcFh5ID0gdGhpcy5fZ2V0TmV4dE1hcFh5KHRoaXMubmV4dERpcmVjdGlvbik7XHJcblx0XHR2YXIgY2FuV2Fsa0ZsZyA9IHRoaXMuX2NhbldhbGsobmV4dE1hcFh5KTtcclxuXHJcblx0XHRpZihjYW5XYWxrRmxnID09PSB0cnVlKXtcclxuXHRcdFx0dGhpcy5pc1dhbGtpbmcgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLmN1cnJlbnRDaGFyYWN0ZXIud2FsaygpO1xyXG5cdFx0XHR0aGlzLl9tb3ZlQ2hhcmFjdGVyKG5leHRNYXBYeS54LCBuZXh0TWFwWHkueSwgZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRfdGhpcy5pc1dhbGtpbmcgPSBmYWxzZTtcclxuXHRcdFx0XHRfdGhpcy5uZXh0RGlyZWN0aW9uID0gbnVsbDtcclxuXHRcdFx0XHRfdGhpcy54ID0gbmV4dE1hcFh5Lng7XHJcblx0XHRcdFx0X3RoaXMueSA9IG5leHRNYXBYeS55O1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9tb3ZlQ2hhcmFjdGVyOiBmdW5jdGlvbih4LCB5LCBjYWxsYmFja0ZuKXtcclxuXHRcdHZhciAkY2hhcmFjdGVyRG9tID0gJChcIi5jdXJyZW50Q2hhcmFjdGVyXCIpO1xyXG5cdFx0JGNoYXJhY3RlckRvbS5hbmltYXRlKHtcclxuXHRcdFx0XCJsZWZ0XCI6IHggKyBcInB4XCIsXHJcblx0XHRcdFwidG9wXCI6IHkgKyBcInB4XCJcclxuXHRcdH0sIG1vdmVUaW1lLCBcImxpbmVhclwiLCBjYWxsYmFja0ZuKTtcclxuXHR9LFxyXG5cclxuXHQvLyDlnLDlm77kuK3vvIzkuIvkuIDkuKrngrnmmK/lkKbkuLrlj6/ku6Xnp7vliqjngrlcclxuXHRfY2FuV2FsazogZnVuY3Rpb24obmV4dE1hcFh5KXtcclxuXHJcblx0XHRpZih0aGlzLm5leHREaXJlY3Rpb24gPT0gbnVsbCl7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyDotoXlh7rlnLDlm75cclxuXHRcdGlmKG5leHRNYXBYeS54IDwgMCB8fCBuZXh0TWFwWHkueSA8IDApe1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8g5LiN6IO96KGM6LWw55qE5Zyw5Zu+XHJcblx0XHR2YXIgbWFwQ2VsbE5hbWUgPSB0aGlzLmRhdGFTb3VyY2UuZ2V0KG5leHRNYXBYeS54LCBuZXh0TWFwWHkueSkuYmc7XHJcblx0XHRpZihtYXBzW1wibWFwTWFwcGluZ1wiXVttYXBDZWxsTmFtZV1bXCJjYW5XYWxrXCJdID09PSBmYWxzZSl7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHQvLyDmoLnmja7ooYzotbDmlrnlkJHlj5blvpfvvIzkuIvkuIDkuKrlnLDlm77nmoR477yMeeWdkOagh1xyXG5cdF9nZXROZXh0TWFwWHk6IGZ1bmN0aW9uKGRpcmVjdGlvbil7XHJcblx0XHR2YXIgY2VsbFNpemUgPSB0aGlzLmNvbmZpZy5jZWxsU2l6ZTtcclxuXHRcdHZhciB4ID0gMDtcclxuXHRcdHZhciB5ID0gMDtcclxuXHRcdHN3aXRjaChkaXJlY3Rpb24pe1xyXG5cdFx0XHRjYXNlIFwibGVmdFwiOlxyXG5cdFx0XHRcdHggPSB0aGlzLnggLSBjZWxsU2l6ZTtcclxuXHRcdFx0XHR5ID0gdGhpcy55O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwicmlnaHRcIjpcclxuXHRcdFx0XHR4ID0gdGhpcy54ICsgY2VsbFNpemU7XHJcblx0XHRcdFx0eSA9IHRoaXMueTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcInVwXCI6XHJcblx0XHRcdFx0eCA9IHRoaXMueDtcclxuXHRcdFx0XHR5ID0gdGhpcy55IC0gY2VsbFNpemU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJkb3duXCI6XHJcblx0XHRcdFx0eCA9IHRoaXMueDtcclxuXHRcdFx0XHR5ID0gdGhpcy55ICsgY2VsbFNpemU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR4OngsXHJcblx0XHRcdHk6eVxyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGFyYWN0ZXJFbmdpbiIsInZhciBDb29yTWFwID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLm1hcCA9IG5ldyBNYXAoKTtcclxufVxyXG5Db29yTWFwLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogQ29vck1hcCxcclxuXHRnZXQ6IGZ1bmN0aW9uKHgsIHkpe1xyXG5cdFx0dmFyIGsgPSBudWxsO1xyXG5cdFx0Zm9yKGtleSBvZiB0aGlzLm1hcC5rZXlzKCkpe1xyXG5cdFx0XHRpZihrZXkueCA9PSB4ICYmIGtleS55ID09IHkpe1xyXG5cdFx0XHRcdGsgPSBrZXk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5tYXAuZ2V0KGspO1xyXG5cdH0sXHJcblx0c2V0OiBmdW5jdGlvbih4LHksIHZhbHVlKXtcclxuXHRcdHZhciBrID0gbnVsbDtcclxuXHRcdGZvcihrZXkgb2YgdGhpcy5tYXAua2V5cygpKXtcclxuXHRcdFx0aWYoa2V5LnggPT0geCAmJiBrZXkueSA9PSB5KXtcclxuXHRcdFx0XHRrID0ga2V5O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZihrKSB7XHJcblx0XHRcdHRoaXMubWFwLnNldChrLCB2YWx1ZSk7XHJcblx0XHR9ZWxzZSB7XHJcblx0XHRcdHRoaXMubWFwLnNldCh7XCJ4XCI6eCAsIFwieVwiOnl9LCB2YWx1ZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHRnZXRNYXA6IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMubWFwO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb29yTWFwOyIsInZhciBNYXBFbmdpbiA9IHJlcXVpcmUoXCIuL01hcEVuZ2luXCIpO1xyXG52YXIgQ2hhcmFjdGVyRW5naW4gPSByZXF1aXJlKFwiLi9DaGFyYWN0ZXJFbmdpbi5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEVuZ2luKGNvbmZpZykge1xyXG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdHRoaXMuZGF0YVNvdXJjZSA9IG51bGw7XHJcblx0dGhpcy5tYXBFbmdpbiA9IG5ldyBNYXBFbmdpbihjb25maWcpO1xyXG5cdHRoaXMuY2hhcmFjdGVyRW5naW4gPSBuZXcgQ2hhcmFjdGVyRW5naW4oY29uZmlnKTtcclxufVxyXG5cclxuRW5naW4ucHJvdG90eXBlID0ge1xyXG5cdGNvbnN0cnVjdG9yOiBFbmdpbixcclxuXHJcblx0aW5pdDogZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLm1hcEVuZ2luLmluaXQodGhpcyk7XHJcblx0XHR0aGlzLmNoYXJhY3RlckVuZ2luLmluaXQodGhpcyk7XHJcblx0fSxcclxuXHJcblx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHR9LFxyXG5cclxuXHRzZXREYXRhU291cmNlOiBmdW5jdGlvbihkYXRhU291cmNlKSB7XHJcblx0XHR0aGlzLmRhdGFTb3VyY2UgPSBkYXRhU291cmNlO1xyXG5cdH0sXHJcblxyXG5cdGdldERhdGFTb3VyY2U6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5kYXRhU291cmNlO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHM9RW5naW47XHJcbiIsInZhciBDb29yTWFwID0gcmVxdWlyZShcIi4vQ29vck1hcC5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIE1hcEVuZ2luKGNvbmZpZyl7XHJcblx0dGhpcy5jb25maWcgPSBjb25maWc7XHJcblx0dGhpcy5lbmdpbiA9IG51bGw7XHJcblx0dGhpcy5tYXBzID0gcmVxdWlyZShcIi4vbWFwcy5qc1wiKTtcclxuXHR0aGlzLm1hcE1hcHBpbmcgPSB0aGlzLm1hcHMubWFwTWFwcGluZztcclxufVxyXG5cclxuTWFwRW5naW4ucHJvdG90eXBlID0ge1xyXG5cdGNvbnN0cnVjdG9yOiBNYXBFbmdpbixcclxuXHJcblx0aW5pdDogZnVuY3Rpb24oZW5naW4pe1xyXG5cclxuXHRcdHRoaXMuZW5naW4gPSBlbmdpbjtcclxuXHJcblx0XHQvLyBwcmUtbG9hZCBhbGwgaW1hZ2VzXHJcblx0XHR2YXIgbWFwTWFwcGluZyA9IHRoaXMubWFwcy5tYXBNYXBwaW5nO1xyXG5cdFx0dmFyICRsb2FkRGl2ID0gJChcIjxkaXYgY2xhc3M9J2Rpc3BsYXlfbm9uZSc+PC9kaXY+XCIpO1xyXG5cdFx0JGxvYWREaXYuYXBwZW5kVG8oJChkb2N1bWVudC5ib2R5KSk7XHJcblx0XHRmb3IodmFyIGtleSBpbiBtYXBNYXBwaW5nKXtcclxuXHRcdFx0dmFyIGltYWdlUGF0aCA9IFwiaW1hZ2VzL1wiICsgbWFwTWFwcGluZ1trZXldLm5hbWU7XHJcblx0XHRcdCQoJzxpbWcvPicpLmF0dHIoXCJzcmNcIiwgaW1hZ2VQYXRoKS5hcHBlbmRUbygkbG9hZERpdik7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5sb2FkTWFwKFwiMDFcIik7XHJcblx0fSxcclxuXHJcblx0bG9hZE1hcDogZnVuY3Rpb24obWFwS2V5KSB7XHJcblx0XHQkKFwiLm1haW4gLm1hcExheWVyXCIpLnJlbW92ZSgpO1xyXG5cdFx0dmFyICRtYXBMYXllciA9ICQoXCI8ZGl2IGNsYXNzPSdtYXBMYXllcic+PC9kaXY+XCIpO1xyXG5cdFx0JG1hcExheWVyLmFwcGVuZFRvKCQoXCIubWFpblwiKSk7XHJcblxyXG5cdFx0Ly8gc2V0IG1hcCB0b3RhbCBoZWlnaHQgYW5kIHdpZHRoXHJcblx0XHR2YXIgbWFwRGF0YSA9IHRoaXMubWFwc1ttYXBLZXldO1xyXG5cdFx0dmFyIGNlbGxTaXplID0gdGhpcy5jb25maWcuY2VsbFNpemU7XHJcblx0XHR2YXIgaExlbiA9IG1hcERhdGEubGVuZ3RoO1xyXG5cdFx0dmFyIHdMZW4gPSBtYXBEYXRhWzBdLmxlbmd0aDtcclxuXHRcdHZhciB3aWR0aCA9IHdMZW4gKiBjZWxsU2l6ZTtcclxuXHRcdHZhciBoZWlnaHQgPSBoTGVuICogY2VsbFNpemU7XHJcblx0XHQkbWFwTGF5ZXIuY3NzKHtcclxuXHRcdFx0d2lkdGg6IHdpZHRoICsgXCJweFwiLFxyXG5cdFx0XHRoZWlnaHQ6IGhlaWdodCArIFwicHhcIlxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8g5qC55o2u5Zyw5Zu+5YGa5pWw5o2u5oiQZGF0YVNvdXJjZe+8jOW5tuiuvuWumuWIsGVuZ2lu5a+56LGh5LitXHJcblx0XHQvLyDmoLnmja7lnLDlm77mlbDmja7nlLvlh7rlnLDlm75cclxuXHRcdHZhciB2YWx1ZSA9IG51bGw7XHJcblx0XHR2YXIgcm93ID0gbnVsbDtcclxuXHRcdHZhciB4LHk7XHJcblx0XHR2YXIgZGF0YVNvdXJjZSA9IG5ldyBDb29yTWFwKCk7XHJcblx0XHRmb3IodmFyIGo9MDtqPG1hcERhdGEubGVuZ3RoO2orKyl7XHJcblx0XHRcdHJvdyA9IG1hcERhdGFbal07XHJcblx0XHRcdGZvcih2YXIgaT0wO2k8cm93Lmxlbmd0aDtpKyspe1xyXG5cdFx0XHRcdHZhbHVlID0gdGhpcy5tYXBNYXBwaW5nW3Jvd1tpXV0ubmFtZTtcclxuXHRcdFx0XHR4ID0gaSAqIGNlbGxTaXplO1xyXG5cdFx0XHRcdHkgPSBqICogY2VsbFNpemU7XHJcblxyXG5cdFx0XHRcdC8vIGRhdGFzb3VyY2VcclxuXHRcdFx0XHRkYXRhU291cmNlLnNldCh4LHksIHtiZzogcm93W2ldfSk7XHJcblxyXG5cdFx0XHRcdC8vIGltYWdlc1xyXG5cdFx0XHRcdC8vIHZhciAkaW1nID0gJCgnPGltZyBhbHQ9XCJcIiAvPicpLmF0dHIoXCJzcmNcIiwgXCJpbWFnZXMvXCIgKyB2YWx1ZSk7XHJcblx0XHRcdFx0dmFyICRpbWcgPSAkKCc8ZGl2PjwvZGl2PicpLnRleHQodmFsdWUuc3Vic3RyaW5nKDAsMikpO1xyXG5cdFx0XHRcdCRpbWcuY3NzKHtcclxuXHRcdFx0XHRcdHdpZHRoOiBjZWxsU2l6ZSArIFwicHhcIixcclxuXHRcdFx0XHRcdGhlaWdodDogY2VsbFNpemUgKyBcInB4XCIsXHJcblx0XHRcdFx0XHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG5cdFx0XHRcdFx0bGVmdDogeCArIFwicHhcIixcclxuXHRcdFx0XHRcdHRvcDogeSArIFwicHhcIlxyXG5cdFx0XHRcdH0pLmFwcGVuZFRvKCRtYXBMYXllcik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHRoaXMuZW5naW4uc2V0RGF0YVNvdXJjZShkYXRhU291cmNlKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwRW5naW47XHJcbiIsInZhciBjaGFyYWN0ZXJzID0ge31cclxuXHJcbmNoYXJhY3RlcnNbXCJnaXJsXCJdID0ge1xyXG5cdGltZ05hbWU6IFwiY19naXJsLnBuZ1wiLFxyXG5cdHNpemU6IDQ1XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNoYXJhY3RlcnM7IiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0Y2VsbFNpemU6IDQ1XHJcbn0iLCJ2YXIgY29uZmlnID0gcmVxdWlyZShcIi4vY29uZmlnLmpzXCIpO1xyXG52YXIgRW5naW4gPSByZXF1aXJlKFwiLi9Fbmdpbi5qc1wiKTtcclxuXHJcbnZhciBlbmdpbiA9IG5ldyBFbmdpbihjb25maWcpO1xyXG5cclxuXHJcbiQoZnVuY3Rpb24oKXtcclxuXHRlbmdpbi5pbml0KCk7XHJcbn0pIiwidmFyIG1hcHMgPSB7fVxyXG5cclxubWFwc1tcIm1hcE1hcHBpbmdcIl0gPSB7XHJcblx0XCJ0clwiOiB7XHJcblx0XHRuYW1lOiBcInRyZWUucG5nXCIsXHJcblx0XHRjYW5XYWxrOiBmYWxzZVxyXG5cdH0sXHJcblx0XCJzZVwiOiB7XHJcblx0XHRuYW1lOiBcInNlYS5wbmdcIixcclxuXHRcdGNhbldhbGs6IGZhbHNlXHJcblx0fSxcclxuXHRcImJlXCI6IHtcclxuXHRcdG5hbWU6IFwiYmVhY2gucG5nXCIsXHJcblx0XHRjYW5XYWxrOiB0cnVlXHJcblx0fSxcclxuXHRcImxhXCI6IHtcclxuXHRcdG5hbWU6IFwibGFuZC5wbmdcIixcclxuXHRcdGNhbldhbGs6IHRydWVcclxuXHR9LFxyXG5cdFwiYnJcIjoge1xyXG5cdFx0bmFtZTogXCJicmlkZ2UucG5nXCIsXHJcblx0XHRjYW5XYWxrOiB0cnVlXHJcblx0fVxyXG59XHJcblxyXG5tYXBzW1wiMDFcIl0gPVxyXG5cInRyLHRyLHRyLGJlLHNlLGJyLHNlLGJlLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixiZSxzZSxicixzZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsYmUsYmUsYnIsYmUsYmUsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGxhLGxhLGxhLGxhLGxhLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixsYSxsYSxsYSxsYSxsYSx0cix0cix0cl9cIiArXHJcblwibGEsbGEsbGEsbGEsbGEsbGEsbGEsbGEsbGEsbGEsbGFfXCIgK1xyXG5cInRyLHRyLHRyLGxhLGxhLGxhLGxhLGxhLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixsYSxsYSxsYSxsYSxsYSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsYmUsYmUsYnIsYmUsYmUsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLHNlLGJyLHNlLGJlLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixiZSxzZSxicixzZSxiZSx0cix0cix0clwiO1xyXG5cclxuXHJcbi8vIOWcsOWbvuaVsOaNruS4sui9rOS6jOe7tOaVsOe7hFxyXG5mdW5jdGlvbiB0b0FycmF5KHN0cil7XHJcblx0dmFyIHJldHVybkFycmF5ID0gW107XHJcblx0dmFyIGxpbmVBcnIgPSBzdHIuc3BsaXQoXCJfXCIpO1xyXG5cdGxpbmVBcnIuZm9yRWFjaChmdW5jdGlvbihsaW5lKXtcclxuXHRcdHJldHVybkFycmF5LnB1c2gobGluZS5zcGxpdChcIixcIikpO1xyXG5cdH0pO1xyXG5cdHJldHVybiByZXR1cm5BcnJheTtcclxufVxyXG5cclxuXHJcbmZvcih2YXIga2V5IGluIG1hcHMpe1xyXG5cdGlmKC9cXGRcXGQvLnRlc3Qoa2V5KSl7XHJcblx0XHRtYXBzW2tleV0gPSB0b0FycmF5KG1hcHNba2V5XSk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1hcHMiXX0=
