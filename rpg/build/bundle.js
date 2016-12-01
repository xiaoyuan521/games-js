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
		$characterDom.appendTo($(".character-layer"));

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

var moveTime = 400;

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
		var mapInfo = maps["01"];
		var position = mapInfo.initPosition;
		var faceTo = mapInfo.initFaceTo;
		var posArr = position.split("_");
		this.setCharacterPosition(posArr[0], posArr[1], faceTo);

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

				// 每次移动完成后，校验是否加载新地图 或者 触发剧情
				_this.engin.checkEvent(_this.x, _this.y);
			})
		}
	},

	// 可以用于地图加载后人物的初始化
	//
	// 设定人物在地图中的位置
	// 设定人物的面部朝向
	// x,y 可以是字符串 "1","1"
	// x,y 也可以是number型的 45, 90
	setCharacterPosition: function(x, y, direction){
		var cellSize = this.config.cellSize;
		if(typeof x === "string"){
			x = cellSize * parseInt(x, 10);
		}
		if(typeof y === "string"){
			y = cellSize * parseInt(y, 10);
		}
		$(".currentCharacter").css({
			left: x + "px",
			top: y + "px"
		});
		this.x = x;
		this.y = y;

		if(direction){
			this.currentCharacter.setDirection(direction);
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
		var mapCell = this.dataSource.get(nextMapXy.x, nextMapXy.y);
		if(!mapCell){
			// 超出地图
			return false;
		}
		var mapCellName = mapCell.bg;
		if(maps["mapMapping"][mapCellName]["canWalk"] === false){
			// 不能走的地图， 树，或者海洋之类的
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

		this._initOverlay();
	},

	// 检测地图切换
	// 检测剧情发生
	checkEvent: function(x, y){
		if(this.mapEngin.checkChangeMap(x,y) == true){
			return;
		}
	},

	_initOverlay: function(){
		$(".overlay").on("keydown", function(e){
			e.stopPropagation();
			e.preventDefault();
		})
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

	this.currentMapKey = null;
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
		this.currentMapKey = mapKey;

		var $mapLayer = $(".main .map-layer")
		$mapLayer.empty();

		// set map total height and width
		var mapData = this.maps[mapKey].data;
		var cellSize = this.config.cellSize;
		var hLen = mapData.length;
		var wLen = mapData[0].length;
		var width = wLen * cellSize;
		var height = hLen * cellSize;
		$(".layer").css({
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
	},

	checkChangeMap: function(x,y){
		var position = this._getPosition(x,y);
		var exits = this.maps[this.currentMapKey].exits;
		var exitsInfo = exits[position];
		if(exitsInfo){
			// 到达出口,加载下一张地图
			this._changeMap(exitsInfo);
		}
	},

	_changeMap: function(exitsInfo){
		var mapName = exitsInfo.map;
		var initPosition = exitsInfo.initPosition;
		var faceTo = exitsInfo.faceTo;

		var posArr = initPosition.split("_");
		var x = posArr[0];
		var y = posArr[1];

		this.engin.characterEngin.currentCharacter.stop();
		$(".character-overlay").show();
		this.loadMap(mapName);
		this.engin.characterEngin.setCharacterPosition(x, y, faceTo);
		$(".character-overlay").hide();
	},

	// param: 450, 45
	// return "10_1"
	_getPosition: function(x, y){
		var cellSize = this.config.cellSize;
		return "" + x / cellSize + "_" +  y / cellSize;
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

maps["01"] = {
	initPosition: "9_5",
	initFaceTo: "right",
	data: 
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
		"tr,tr,tr,be,se,br,se,be,tr,tr,tr",
	exits: {
		"10_5": {
			map: "02",
			initPosition: "0_5",
			faceTo: "rigth"
		},
		"5_10": {
			map: "03",
			initPosition: "1_0",
			faceTo: "down"
		}
	}
};

maps["02"] = {
	data: 
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"la,la,la,la,la,la,la,la,la,la,la_" +
		"la,la,la,la,la,la,la,la,la,la,la_" +
		"la,la,la,la,la,la,la,la,la,la,la_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr",
	exits: {
		"0_5": {
			map: "01",
			initPosition: "10_5",
			faceTo: "left"
		}
	}
};

maps["03"] = {
	data: 
		"tr,la,la,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,la,la,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,la,la,tr,tr,la,la,la,tr_" +
		"tr,tr,tr,tr,la,la,tr,la,tr,la,tr_" +
		"tr,tr,tr,tr,tr,la,tr,la,tr,la,tr_" +
		"tr,tr,tr,tr,tr,la,tr,la,tr,la,tr_" +
		"tr,tr,tr,tr,tr,la,tr,la,tr,la,tr_" +
		"tr,tr,tr,tr,tr,la,tr,la,tr,la,tr_" +
		"tr,tr,tr,tr,tr,la,la,la,la,la,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,la,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,la,la,la,tr",
	exits: {
		"1_0": {
			map: "01",
			initPosition: "5_10",
			faceTo: "up"
		}
	}
};


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
		maps[key].data = toArray(maps[key].data);
	}
}

module.exports = maps
},{}]},{},[1,2,3,4,5,6,7,8,9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL1VzZXJzL3poYW9faG9uZ3NoZW5nL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJycGcvZnJvbnRlbmQvQ2hhcmFjdGVyLmpzIiwicnBnL2Zyb250ZW5kL0NoYXJhY3RlckVuZ2luLmpzIiwicnBnL2Zyb250ZW5kL0Nvb3JNYXAuanMiLCJycGcvZnJvbnRlbmQvRW5naW4uanMiLCJycGcvZnJvbnRlbmQvTWFwRW5naW4uanMiLCJycGcvZnJvbnRlbmQvY2hhcmFjdGVycy5qcyIsInJwZy9mcm9udGVuZC9jb25maWcuanMiLCJycGcvZnJvbnRlbmQvaW5kZXguanMiLCJycGcvZnJvbnRlbmQvbWFwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGNoYXJhY3RlcnMgPSByZXF1aXJlKFwiLi9jaGFyYWN0ZXJzLmpzXCIpO1xyXG5cclxuLy8g6LWw5LiA5q2l55qE5pe26Ze0XHJcbnZhciB3YWxrVGltZSA9IDEwMDtcclxuXHJcblxyXG5mdW5jdGlvbiBDaGFyYWN0ZXIoZW5naW4sIENoYXJhY3Rlck5hbWUpe1xyXG5cdHRoaXMuZW5naW4gPSBlbmdpbjtcclxuXHR0aGlzLmNoYXJhY3RlckRhdGEgPSBudWxsO1xyXG5cdHRoaXMuaW50ZXJ2YWxIYW5kbGVyID0gbnVsbDtcclxuXHR0aGlzLmlzV2Fsa2luZyA9IGZhbHNlO1xyXG5cclxuXHQvLyDkurrnianliqjkvZznmoRjc3PlgY/np7vnlKggeCA9IDA7IHkgPSAxXHJcblx0dGhpcy5jdXJyZW50TW92ZSA9IFwiMDFcIjsgXHJcblx0Ly8g5Lq654mp6Z2i5ZCR55qE5pa55ZCRXHJcblx0dGhpcy5kaXJlY3Rpb24gPSBcInJpZ2h0XCI7XHJcblxyXG5cdHRoaXMuaW5pdChDaGFyYWN0ZXJOYW1lKTtcclxufVxyXG5cclxuQ2hhcmFjdGVyLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJjdG9yOiBDaGFyYWN0ZXIsXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKENoYXJhY3Rlck5hbWUpe1xyXG5cdFx0dGhpcy5sb2FkQ2hhcmFjdGVyKENoYXJhY3Rlck5hbWUpO1xyXG5cdFx0dGhpcy5zdGFydFRpbWVyKCk7XHJcblx0fSxcclxuXHJcblx0c3RhcnRUaW1lcjogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBfdGhpcyA9IHRoaXM7XHJcblx0XHR0aGlzLmludGVydmFsSGFuZGxlciA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcblxyXG5cdFx0XHRpZihfdGhpcy5pc1dhbGtpbmcgPT09IGZhbHNlKXtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBuZXh0TW92ZSA9IF90aGlzLl9nZXROZXh0TW92ZSgpO1xyXG5cdFx0XHRfdGhpcy5fc2V0Q3NzRGV2aWF0aW9uKG5leHRNb3ZlKTtcclxuXHRcdFx0X3RoaXMuY3VycmVudE1vdmUgPSBuZXh0TW92ZTtcclxuXHRcdH0sIHdhbGtUaW1lKTtcclxuXHR9LFxyXG5cclxuXHQvLyDliqDovb3kurrnianlm77niYfvvIzliJ3lp4vljJblp7/lir9cclxuXHRsb2FkQ2hhcmFjdGVyOiBmdW5jdGlvbihuYW1lKXtcclxuXHJcblx0XHR2YXIgY2hhcmFjdGVyRGF0YSA9IHRoaXMuY2hhcmFjdGVyRGF0YSA9IGNoYXJhY3RlcnNbbmFtZV07XHJcblx0XHR2YXIgY2hhcmFjdGVyU2l6ZSA9IGNoYXJhY3RlckRhdGEuc2l6ZTtcclxuXHRcdHZhciBpbWdQYXRoID0gXCJpbWFnZXMvXCIgKyBjaGFyYWN0ZXJEYXRhLmltZ05hbWU7XHJcblxyXG5cdFx0dmFyICRjaGFyYWN0ZXJEb20gPSAkKCc8ZGl2IGNsYXNzPVwiY3VycmVudENoYXJhY3RlclwiPjwvZGl2PicpO1xyXG5cdFx0JGNoYXJhY3RlckRvbS5hcHBlbmRUbygkKFwiLmNoYXJhY3Rlci1sYXllclwiKSk7XHJcblxyXG5cdFx0JGNoYXJhY3RlckRvbS5jc3Moe1xyXG5cdFx0XHRcIndpZHRoXCI6IGNoYXJhY3RlclNpemUgKyBcInB4XCIsXHJcblx0XHRcdFwiaGVpZ2h0XCI6IGNoYXJhY3RlclNpemUgKyBcInB4XCIsXHJcblx0XHRcdFwiYmFja2dyb3VuZC1pbWFnZVwiOiBcInVybCgnXCIgKyBpbWdQYXRoICsgXCInKVwiXHJcblx0XHR9KVxyXG5cclxuXHRcdHRoaXMuX3NldENzc0RldmlhdGlvbih0aGlzLmN1cnJlbnRNb3ZlKTtcclxuXHR9LFxyXG5cclxuXHQvLyDlj5blvpfkuIvkuIDmrKHnp7vliqjnmoTkvY3nva4gXHJcblx0Ly8gXCIwM1wiLCBcIjMzXCIgLi4uXHJcblx0X2dldE5leHRNb3ZlOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIGN1cnJlbnRNb3ZlID0gdGhpcy5jdXJyZW50TW92ZTtcclxuXHRcdHZhciBjdXJyZW50RGlyZWN0aW9uID0gdGhpcy5jdXJyZW50RGlyZWN0aW9uO1xyXG5cdFx0dmFyIHJldHVybk1vdmUgPSBudWxsO1xyXG5cclxuXHRcdHZhciBtb3ZlSW50ID0gcGFyc2VJbnQoY3VycmVudE1vdmVbMF0sIDEwKTtcclxuXHRcdG1vdmVJbnQrKztcclxuXHRcdGlmKG1vdmVJbnQgPiAzKXtcclxuXHRcdFx0bW92ZUludCA9IDA7XHJcblx0XHR9XHJcblx0XHRyZXR1cm5Nb3ZlID0gbW92ZUludCArIGN1cnJlbnRNb3ZlWzFdO1xyXG5cdFx0cmV0dXJuIHJldHVybk1vdmU7XHJcblx0XHRcclxuXHR9LFxyXG5cclxuXHQvLyDlvIDlp4votbDot69cclxuXHR3YWxrOiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5pc1dhbGtpbmcgPSB0cnVlO1xyXG5cdH0sXHJcblxyXG5cdC8vIOWBnOatoui1sOi3r1xyXG5cdHN0b3A6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLmlzV2Fsa2luZyA9IGZhbHNlO1xyXG5cdFx0dmFyIHN0b3BNb3ZlID0gXCIwXCIgKyB0aGlzLmN1cnJlbnRNb3ZlWzFdO1xyXG5cdFx0dGhpcy5fc2V0Q3NzRGV2aWF0aW9uKHN0b3BNb3ZlKTtcclxuXHR9LFxyXG5cclxuXHQvLyDorr7lrprnp7vliqjmlrnlkJFcclxuXHQvLyDpnIDopoHlnKh3YWxr5pa55rOV6LCD55So5YmN6LCD55SoXHJcblx0Ly8g5Lmf5Y+v5Lul5Y2V54us6LCD55So77yM55So5LqO77yM5pKe5aKZ77yM5pKe5Lq65pe25YCZ55qE6L2s5ZCRXHJcblx0c2V0RGlyZWN0aW9uOiBmdW5jdGlvbihkaXJlY3Rpb24pe1xyXG5cclxuXHRcdGlmKGRpcmVjdGlvbiAhPSB0aGlzLmN1cnJlbnREaXJlY3Rpb24pe1xyXG5cdFx0XHQvLyDpnaLlkJHlvZPliY3mlrnlkJFcclxuXHRcdFx0c3dpdGNoKGRpcmVjdGlvbil7XHJcblx0XHRcdFx0Y2FzZSBcImxlZnRcIjpcclxuXHRcdFx0XHRcdHRoaXMuY3VycmVudE1vdmUgPSBcIjAzXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwicmlnaHRcIjpcclxuXHRcdFx0XHRcdHRoaXMuY3VycmVudE1vdmUgPSBcIjAxXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwidXBcIjpcclxuXHRcdFx0XHRcdHRoaXMuY3VycmVudE1vdmUgPSBcIjAyXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwiZG93blwiOlxyXG5cdFx0XHRcdFx0dGhpcy5jdXJyZW50TW92ZSA9IFwiMDBcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuY3VycmVudERpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuXHRcdHRoaXMuX3NldENzc0RldmlhdGlvbih0aGlzLmN1cnJlbnRNb3ZlKTtcclxuXHJcblx0fSxcclxuXHJcblx0Ly8g6K6+5a6a5Lq654mp5Zu+54mH55qE5YGP56e76YePXHJcblx0Ly8gbmV4dE1vdmUgOiBcIjAxXCIsIFwiMzNcIiAuLi5cclxuXHRfc2V0Q3NzRGV2aWF0aW9uOiBmdW5jdGlvbihuZXh0TW92ZSkge1xyXG5cdFx0dmFyIG5leHRQb3NpdGlvbnMgPSB0aGlzLl9nZXRQb3NpdGlvblhZKHRoaXMuY2hhcmFjdGVyRGF0YS5zaXplLCBuZXh0TW92ZSk7XHJcblx0XHR2YXIgJGNoYXJhY3RlckRvbSA9ICQoXCIuY3VycmVudENoYXJhY3RlclwiKTtcclxuXHRcdCRjaGFyYWN0ZXJEb20uY3NzKHtcclxuXHRcdFx0XCJwb3NpdGlvblwiOlwiYWJzb2x1dGVcIixcclxuXHRcdFx0XCJiYWNrZ3JvdW5kLXBvc2l0aW9uLXhcIjogbmV4dFBvc2l0aW9ucy54ICsgXCJweFwiLFxyXG5cdFx0XHRcImJhY2tncm91bmQtcG9zaXRpb24teVwiOiBuZXh0UG9zaXRpb25zLnkgKyBcInB4XCJcclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdC8vIOiuoeeul+S6uueJqeeahGNzc+WBj+enu+mHj1xyXG5cdF9nZXRQb3NpdGlvblhZOiBmdW5jdGlvbihzaXplLCBtb3ZlUG9zaXRpb24pIHtcclxuXHRcdHZhciB4ID0gc2l6ZSAqIHBhcnNlSW50KG1vdmVQb3NpdGlvblswXSwgMTApICogLTE7XHJcblx0XHR2YXIgeSA9IHNpemUgKiBwYXJzZUludChtb3ZlUG9zaXRpb25bMV0sIDEwKSAqIC0xO1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDogeCxcclxuXHRcdFx0eTogeVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGdldERpcmVjdGlvbjogZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5kaXJlY3Rpb247XHJcblx0fVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGFyYWN0ZXI7IiwidmFyIG1hcHMgPSByZXF1aXJlKFwiLi9tYXBzXCIpO1xyXG52YXIgQ2hhcmFjdGVyID0gcmVxdWlyZShcIi4vQ2hhcmFjdGVyLmpzXCIpO1xyXG5cclxudmFyIG1vdmVUaW1lID0gNDAwO1xyXG5cclxuZnVuY3Rpb24gQ2hhcmFjdGVyRW5naW4oY29uZmlnKSB7XHJcblx0dGhpcy5jb25maWcgPSBjb25maWc7XHJcblx0dGhpcy5lbmdpbiA9IG51bGw7XHJcblx0dGhpcy5kYXRhU291cmNlID0gbnVsbDtcclxuXHJcblx0Ly8g5Lq654mp56e75Yqo5pa55ZCR77yMIG51bGzku6PooajlgZzmraJcclxuXHR0aGlzLm5leHREaXJlY3Rpb24gPSBudWxsO1xyXG5cclxuXHR0aGlzLmN1cnJlbnRDaGFyYWN0ZXIgPSBudWxsO1xyXG5cclxuXHQvLyDkurrnianlnKjlnLDlm77kuK3nmoTkvY3nva5cclxuXHR0aGlzLnggPSAwO1xyXG5cdHRoaXMueSA9IDA7XHJcblxyXG5cdHRoaXMuaXNXYWxraW5nID0gZmFsc2U7XHJcbn1cclxuXHJcbkNoYXJhY3RlckVuZ2luLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogQ2hhcmFjdGVyRW5naW4sXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKGVuZ2luKSB7XHJcblx0XHR0aGlzLmVuZ2luID0gZW5naW47XHJcblx0XHR0aGlzLmRhdGFTb3VyY2UgPSBlbmdpbi5nZXREYXRhU291cmNlKCk7XHJcblxyXG5cdFx0Ly8g57uR5a6a6ZSu55uY5LqL5Lu2XHJcblx0XHR0aGlzLmJpbmRFdmVudCgpO1xyXG5cclxuXHRcdC8vIOWIneWni+WMluS6uueJqVxyXG5cdFx0dmFyIGN1cnJlbnRDaGFyYWN0ZXIgPSB0aGlzLmN1cnJlbnRDaGFyYWN0ZXIgPSBuZXcgQ2hhcmFjdGVyKGVuZ2luLCBcImdpcmxcIik7XHJcblx0XHQvLyDkurrnianmlL7liLDlnLDlm77nqbrkvY3nva7kuIpcclxuXHRcdHZhciBtYXBJbmZvID0gbWFwc1tcIjAxXCJdO1xyXG5cdFx0dmFyIHBvc2l0aW9uID0gbWFwSW5mby5pbml0UG9zaXRpb247XHJcblx0XHR2YXIgZmFjZVRvID0gbWFwSW5mby5pbml0RmFjZVRvO1xyXG5cdFx0dmFyIHBvc0FyciA9IHBvc2l0aW9uLnNwbGl0KFwiX1wiKTtcclxuXHRcdHRoaXMuc2V0Q2hhcmFjdGVyUG9zaXRpb24ocG9zQXJyWzBdLCBwb3NBcnJbMV0sIGZhY2VUbyk7XHJcblxyXG5cdFx0dGhpcy5zdGFydFRpbWVyKCk7XHJcblx0fSxcclxuXHJcblx0Ly8g5Lq654mp6LWw5Yqo55qE6ZSu55uY5LqL5Lu2XHJcblx0YmluZEV2ZW50OiBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBfdGhpcyA9IHRoaXM7XHJcblx0XHQkKGRvY3VtZW50LmJvZHkpLm9uKFwia2V5ZG93bi5jaGFyYWN0ZXIud2Fsa1wiLCBmdW5jdGlvbihlKXtcclxuXHJcblx0XHRcdGlmKF90aGlzLmlzV2Fsa2luZyA9PT0gdHJ1ZSl7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRzd2l0Y2goZS5rZXlDb2RlKXtcclxuXHRcdFx0XHRjYXNlIDM3OlxyXG5cdFx0XHRcdFx0X3RoaXMubmV4dERpcmVjdGlvbiA9IFwibGVmdFwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzODpcclxuXHRcdFx0XHRcdF90aGlzLm5leHREaXJlY3Rpb24gPSBcInVwXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDM5OlxyXG5cdFx0XHRcdFx0X3RoaXMubmV4dERpcmVjdGlvbiA9IFwicmlnaHRcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgNDA6XHJcblx0XHRcdFx0XHRfdGhpcy5uZXh0RGlyZWN0aW9uID0gXCJkb3duXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdF90aGlzLmN1cnJlbnRDaGFyYWN0ZXIuc2V0RGlyZWN0aW9uKF90aGlzLm5leHREaXJlY3Rpb24pO1xyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0Ly8g5a6a5pe25qOA5rWL5Lq654mp6LWw5YqoXHJcblx0c3RhcnRUaW1lcjogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0dmFyIF90aGlzID0gdGhpcztcclxuXHRcdHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZihfdGhpcy5pc1dhbGtpbmcgPT09IHRydWUpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKF90aGlzLm5leHREaXJlY3Rpb24gPT0gbnVsbCkge1xyXG5cdFx0XHRcdF90aGlzLmN1cnJlbnRDaGFyYWN0ZXIuc3RvcCgpO1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0X3RoaXMud2FsaygpO1xyXG5cdFx0fSwgMTApO1xyXG5cdH0sXHJcblxyXG5cdC8vIOS6uueJqeenu+WKqFxyXG5cdHdhbGs6IGZ1bmN0aW9uKCl7XHJcblxyXG5cdFx0dmFyIF90aGlzID0gdGhpcztcclxuXHRcdHZhciAkY2hhcmFjdGVyRG9tID0gJChcIi5jdXJyZW50Q2hhcmFjdGVyXCIpO1xyXG5cdFx0aWYoJGNoYXJhY3RlckRvbS5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG5leHRNYXBYeSA9IHRoaXMuX2dldE5leHRNYXBYeSh0aGlzLm5leHREaXJlY3Rpb24pO1xyXG5cdFx0dmFyIGNhbldhbGtGbGcgPSB0aGlzLl9jYW5XYWxrKG5leHRNYXBYeSk7XHJcblxyXG5cdFx0aWYoY2FuV2Fsa0ZsZyA9PT0gdHJ1ZSl7XHJcblx0XHRcdHRoaXMuaXNXYWxraW5nID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5jdXJyZW50Q2hhcmFjdGVyLndhbGsoKTtcclxuXHRcdFx0dGhpcy5fbW92ZUNoYXJhY3RlcihuZXh0TWFwWHkueCwgbmV4dE1hcFh5LnksIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0X3RoaXMuaXNXYWxraW5nID0gZmFsc2U7XHJcblx0XHRcdFx0X3RoaXMubmV4dERpcmVjdGlvbiA9IG51bGw7XHJcblx0XHRcdFx0X3RoaXMueCA9IG5leHRNYXBYeS54O1xyXG5cdFx0XHRcdF90aGlzLnkgPSBuZXh0TWFwWHkueTtcclxuXHJcblx0XHRcdFx0Ly8g5q+P5qyh56e75Yqo5a6M5oiQ5ZCO77yM5qCh6aqM5piv5ZCm5Yqg6L295paw5Zyw5Zu+IOaIluiAhSDop6blj5Hliafmg4VcclxuXHRcdFx0XHRfdGhpcy5lbmdpbi5jaGVja0V2ZW50KF90aGlzLngsIF90aGlzLnkpO1xyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdC8vIOWPr+S7peeUqOS6juWcsOWbvuWKoOi9veWQjuS6uueJqeeahOWIneWni+WMllxyXG5cdC8vXHJcblx0Ly8g6K6+5a6a5Lq654mp5Zyo5Zyw5Zu+5Lit55qE5L2N572uXHJcblx0Ly8g6K6+5a6a5Lq654mp55qE6Z2i6YOo5pyd5ZCRXHJcblx0Ly8geCx5IOWPr+S7peaYr+Wtl+espuS4siBcIjFcIixcIjFcIlxyXG5cdC8vIHgseSDkuZ/lj6/ku6XmmK9udW1iZXLlnovnmoQgNDUsIDkwXHJcblx0c2V0Q2hhcmFjdGVyUG9zaXRpb246IGZ1bmN0aW9uKHgsIHksIGRpcmVjdGlvbil7XHJcblx0XHR2YXIgY2VsbFNpemUgPSB0aGlzLmNvbmZpZy5jZWxsU2l6ZTtcclxuXHRcdGlmKHR5cGVvZiB4ID09PSBcInN0cmluZ1wiKXtcclxuXHRcdFx0eCA9IGNlbGxTaXplICogcGFyc2VJbnQoeCwgMTApO1xyXG5cdFx0fVxyXG5cdFx0aWYodHlwZW9mIHkgPT09IFwic3RyaW5nXCIpe1xyXG5cdFx0XHR5ID0gY2VsbFNpemUgKiBwYXJzZUludCh5LCAxMCk7XHJcblx0XHR9XHJcblx0XHQkKFwiLmN1cnJlbnRDaGFyYWN0ZXJcIikuY3NzKHtcclxuXHRcdFx0bGVmdDogeCArIFwicHhcIixcclxuXHRcdFx0dG9wOiB5ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHRcdHRoaXMueCA9IHg7XHJcblx0XHR0aGlzLnkgPSB5O1xyXG5cclxuXHRcdGlmKGRpcmVjdGlvbil7XHJcblx0XHRcdHRoaXMuY3VycmVudENoYXJhY3Rlci5zZXREaXJlY3Rpb24oZGlyZWN0aW9uKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfbW92ZUNoYXJhY3RlcjogZnVuY3Rpb24oeCwgeSwgY2FsbGJhY2tGbil7XHJcblx0XHR2YXIgJGNoYXJhY3RlckRvbSA9ICQoXCIuY3VycmVudENoYXJhY3RlclwiKTtcclxuXHRcdCRjaGFyYWN0ZXJEb20uYW5pbWF0ZSh7XHJcblx0XHRcdFwibGVmdFwiOiB4ICsgXCJweFwiLFxyXG5cdFx0XHRcInRvcFwiOiB5ICsgXCJweFwiXHJcblx0XHR9LCBtb3ZlVGltZSwgXCJsaW5lYXJcIiwgY2FsbGJhY2tGbik7XHJcblx0fSxcclxuXHJcblx0Ly8g5Zyw5Zu+5Lit77yM5LiL5LiA5Liq54K55piv5ZCm5Li65Y+v5Lul56e75Yqo54K5XHJcblx0X2NhbldhbGs6IGZ1bmN0aW9uKG5leHRNYXBYeSl7XHJcblxyXG5cdFx0aWYodGhpcy5uZXh0RGlyZWN0aW9uID09IG51bGwpe1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8g6LaF5Ye65Zyw5Zu+XHJcblx0XHRpZihuZXh0TWFwWHkueCA8IDAgfHwgbmV4dE1hcFh5LnkgPCAwKXtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIOS4jeiDveihjOi1sOeahOWcsOWbvlxyXG5cdFx0dmFyIG1hcENlbGwgPSB0aGlzLmRhdGFTb3VyY2UuZ2V0KG5leHRNYXBYeS54LCBuZXh0TWFwWHkueSk7XHJcblx0XHRpZighbWFwQ2VsbCl7XHJcblx0XHRcdC8vIOi2heWHuuWcsOWbvlxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHR2YXIgbWFwQ2VsbE5hbWUgPSBtYXBDZWxsLmJnO1xyXG5cdFx0aWYobWFwc1tcIm1hcE1hcHBpbmdcIl1bbWFwQ2VsbE5hbWVdW1wiY2FuV2Fsa1wiXSA9PT0gZmFsc2Upe1xyXG5cdFx0XHQvLyDkuI3og73otbDnmoTlnLDlm77vvIwg5qCR77yM5oiW6ICF5rW35rSL5LmL57G755qEXHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHQvLyDmoLnmja7ooYzotbDmlrnlkJHlj5blvpfvvIzkuIvkuIDkuKrlnLDlm77nmoR477yMeeWdkOagh1xyXG5cdF9nZXROZXh0TWFwWHk6IGZ1bmN0aW9uKGRpcmVjdGlvbil7XHJcblx0XHR2YXIgY2VsbFNpemUgPSB0aGlzLmNvbmZpZy5jZWxsU2l6ZTtcclxuXHRcdHZhciB4ID0gMDtcclxuXHRcdHZhciB5ID0gMDtcclxuXHRcdHN3aXRjaChkaXJlY3Rpb24pe1xyXG5cdFx0XHRjYXNlIFwibGVmdFwiOlxyXG5cdFx0XHRcdHggPSB0aGlzLnggLSBjZWxsU2l6ZTtcclxuXHRcdFx0XHR5ID0gdGhpcy55O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwicmlnaHRcIjpcclxuXHRcdFx0XHR4ID0gdGhpcy54ICsgY2VsbFNpemU7XHJcblx0XHRcdFx0eSA9IHRoaXMueTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcInVwXCI6XHJcblx0XHRcdFx0eCA9IHRoaXMueDtcclxuXHRcdFx0XHR5ID0gdGhpcy55IC0gY2VsbFNpemU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJkb3duXCI6XHJcblx0XHRcdFx0eCA9IHRoaXMueDtcclxuXHRcdFx0XHR5ID0gdGhpcy55ICsgY2VsbFNpemU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR4OngsXHJcblx0XHRcdHk6eVxyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGFyYWN0ZXJFbmdpbiIsInZhciBDb29yTWFwID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLm1hcCA9IG5ldyBNYXAoKTtcclxufVxyXG5Db29yTWFwLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogQ29vck1hcCxcclxuXHRnZXQ6IGZ1bmN0aW9uKHgsIHkpe1xyXG5cdFx0dmFyIGsgPSBudWxsO1xyXG5cdFx0Zm9yKGtleSBvZiB0aGlzLm1hcC5rZXlzKCkpe1xyXG5cdFx0XHRpZihrZXkueCA9PSB4ICYmIGtleS55ID09IHkpe1xyXG5cdFx0XHRcdGsgPSBrZXk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5tYXAuZ2V0KGspO1xyXG5cdH0sXHJcblx0c2V0OiBmdW5jdGlvbih4LHksIHZhbHVlKXtcclxuXHRcdHZhciBrID0gbnVsbDtcclxuXHRcdGZvcihrZXkgb2YgdGhpcy5tYXAua2V5cygpKXtcclxuXHRcdFx0aWYoa2V5LnggPT0geCAmJiBrZXkueSA9PSB5KXtcclxuXHRcdFx0XHRrID0ga2V5O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZihrKSB7XHJcblx0XHRcdHRoaXMubWFwLnNldChrLCB2YWx1ZSk7XHJcblx0XHR9ZWxzZSB7XHJcblx0XHRcdHRoaXMubWFwLnNldCh7XCJ4XCI6eCAsIFwieVwiOnl9LCB2YWx1ZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHRnZXRNYXA6IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMubWFwO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb29yTWFwOyIsInZhciBNYXBFbmdpbiA9IHJlcXVpcmUoXCIuL01hcEVuZ2luXCIpO1xyXG52YXIgQ2hhcmFjdGVyRW5naW4gPSByZXF1aXJlKFwiLi9DaGFyYWN0ZXJFbmdpbi5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEVuZ2luKGNvbmZpZykge1xyXG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdHRoaXMuZGF0YVNvdXJjZSA9IG51bGw7XHJcblx0dGhpcy5tYXBFbmdpbiA9IG5ldyBNYXBFbmdpbihjb25maWcpO1xyXG5cdHRoaXMuY2hhcmFjdGVyRW5naW4gPSBuZXcgQ2hhcmFjdGVyRW5naW4oY29uZmlnKTtcclxufVxyXG5cclxuRW5naW4ucHJvdG90eXBlID0ge1xyXG5cdGNvbnN0cnVjdG9yOiBFbmdpbixcclxuXHJcblx0aW5pdDogZnVuY3Rpb24oKSB7XHJcblx0XHR0aGlzLm1hcEVuZ2luLmluaXQodGhpcyk7XHJcblx0XHR0aGlzLmNoYXJhY3RlckVuZ2luLmluaXQodGhpcyk7XHJcblxyXG5cdFx0dGhpcy5faW5pdE92ZXJsYXkoKTtcclxuXHR9LFxyXG5cclxuXHQvLyDmo4DmtYvlnLDlm77liIfmjaJcclxuXHQvLyDmo4DmtYvliafmg4Xlj5HnlJ9cclxuXHRjaGVja0V2ZW50OiBmdW5jdGlvbih4LCB5KXtcclxuXHRcdGlmKHRoaXMubWFwRW5naW4uY2hlY2tDaGFuZ2VNYXAoeCx5KSA9PSB0cnVlKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9pbml0T3ZlcmxheTogZnVuY3Rpb24oKXtcclxuXHRcdCQoXCIub3ZlcmxheVwiKS5vbihcImtleWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHRcdH0pXHJcblx0fSxcclxuXHJcblx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHR9LFxyXG5cclxuXHRzZXREYXRhU291cmNlOiBmdW5jdGlvbihkYXRhU291cmNlKSB7XHJcblx0XHR0aGlzLmRhdGFTb3VyY2UgPSBkYXRhU291cmNlO1xyXG5cdH0sXHJcblxyXG5cdGdldERhdGFTb3VyY2U6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5kYXRhU291cmNlO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHM9RW5naW47XHJcbiIsInZhciBDb29yTWFwID0gcmVxdWlyZShcIi4vQ29vck1hcC5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIE1hcEVuZ2luKGNvbmZpZyl7XHJcblx0dGhpcy5jb25maWcgPSBjb25maWc7XHJcblx0dGhpcy5lbmdpbiA9IG51bGw7XHJcblx0dGhpcy5tYXBzID0gcmVxdWlyZShcIi4vbWFwcy5qc1wiKTtcclxuXHR0aGlzLm1hcE1hcHBpbmcgPSB0aGlzLm1hcHMubWFwTWFwcGluZztcclxuXHJcblx0dGhpcy5jdXJyZW50TWFwS2V5ID0gbnVsbDtcclxufVxyXG5cclxuTWFwRW5naW4ucHJvdG90eXBlID0ge1xyXG5cdGNvbnN0cnVjdG9yOiBNYXBFbmdpbixcclxuXHJcblx0aW5pdDogZnVuY3Rpb24oZW5naW4pe1xyXG5cclxuXHRcdHRoaXMuZW5naW4gPSBlbmdpbjtcclxuXHJcblx0XHQvLyBwcmUtbG9hZCBhbGwgaW1hZ2VzXHJcblx0XHR2YXIgbWFwTWFwcGluZyA9IHRoaXMubWFwcy5tYXBNYXBwaW5nO1xyXG5cdFx0dmFyICRsb2FkRGl2ID0gJChcIjxkaXYgY2xhc3M9J2Rpc3BsYXlfbm9uZSc+PC9kaXY+XCIpO1xyXG5cdFx0JGxvYWREaXYuYXBwZW5kVG8oJChkb2N1bWVudC5ib2R5KSk7XHJcblx0XHRmb3IodmFyIGtleSBpbiBtYXBNYXBwaW5nKXtcclxuXHRcdFx0dmFyIGltYWdlUGF0aCA9IFwiaW1hZ2VzL1wiICsgbWFwTWFwcGluZ1trZXldLm5hbWU7XHJcblx0XHRcdCQoJzxpbWcvPicpLmF0dHIoXCJzcmNcIiwgaW1hZ2VQYXRoKS5hcHBlbmRUbygkbG9hZERpdik7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5sb2FkTWFwKFwiMDFcIik7XHJcblx0fSxcclxuXHJcblx0bG9hZE1hcDogZnVuY3Rpb24obWFwS2V5KSB7XHJcblx0XHR0aGlzLmN1cnJlbnRNYXBLZXkgPSBtYXBLZXk7XHJcblxyXG5cdFx0dmFyICRtYXBMYXllciA9ICQoXCIubWFpbiAubWFwLWxheWVyXCIpXHJcblx0XHQkbWFwTGF5ZXIuZW1wdHkoKTtcclxuXHJcblx0XHQvLyBzZXQgbWFwIHRvdGFsIGhlaWdodCBhbmQgd2lkdGhcclxuXHRcdHZhciBtYXBEYXRhID0gdGhpcy5tYXBzW21hcEtleV0uZGF0YTtcclxuXHRcdHZhciBjZWxsU2l6ZSA9IHRoaXMuY29uZmlnLmNlbGxTaXplO1xyXG5cdFx0dmFyIGhMZW4gPSBtYXBEYXRhLmxlbmd0aDtcclxuXHRcdHZhciB3TGVuID0gbWFwRGF0YVswXS5sZW5ndGg7XHJcblx0XHR2YXIgd2lkdGggPSB3TGVuICogY2VsbFNpemU7XHJcblx0XHR2YXIgaGVpZ2h0ID0gaExlbiAqIGNlbGxTaXplO1xyXG5cdFx0JChcIi5sYXllclwiKS5jc3Moe1xyXG5cdFx0XHR3aWR0aDogd2lkdGggKyBcInB4XCIsXHJcblx0XHRcdGhlaWdodDogaGVpZ2h0ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyDmoLnmja7lnLDlm77lgZrmlbDmja7miJBkYXRhU291cmNl77yM5bm26K6+5a6a5YiwZW5naW7lr7nosaHkuK1cclxuXHRcdC8vIOagueaNruWcsOWbvuaVsOaNrueUu+WHuuWcsOWbvlxyXG5cdFx0dmFyIHZhbHVlID0gbnVsbDtcclxuXHRcdHZhciByb3cgPSBudWxsO1xyXG5cdFx0dmFyIHgseTtcclxuXHRcdHZhciBkYXRhU291cmNlID0gbmV3IENvb3JNYXAoKTtcclxuXHRcdGZvcih2YXIgaj0wO2o8bWFwRGF0YS5sZW5ndGg7aisrKXtcclxuXHRcdFx0cm93ID0gbWFwRGF0YVtqXTtcclxuXHRcdFx0Zm9yKHZhciBpPTA7aTxyb3cubGVuZ3RoO2krKyl7XHJcblx0XHRcdFx0dmFsdWUgPSB0aGlzLm1hcE1hcHBpbmdbcm93W2ldXS5uYW1lO1xyXG5cdFx0XHRcdHggPSBpICogY2VsbFNpemU7XHJcblx0XHRcdFx0eSA9IGogKiBjZWxsU2l6ZTtcclxuXHJcblx0XHRcdFx0Ly8gZGF0YXNvdXJjZVxyXG5cdFx0XHRcdGRhdGFTb3VyY2Uuc2V0KHgseSwge2JnOiByb3dbaV19KTtcclxuXHJcblx0XHRcdFx0Ly8gaW1hZ2VzXHJcblx0XHRcdFx0Ly8gdmFyICRpbWcgPSAkKCc8aW1nIGFsdD1cIlwiIC8+JykuYXR0cihcInNyY1wiLCBcImltYWdlcy9cIiArIHZhbHVlKTtcclxuXHRcdFx0XHR2YXIgJGltZyA9ICQoJzxkaXY+PC9kaXY+JykudGV4dCh2YWx1ZS5zdWJzdHJpbmcoMCwyKSk7XHJcblx0XHRcdFx0JGltZy5jc3Moe1xyXG5cdFx0XHRcdFx0d2lkdGg6IGNlbGxTaXplICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0aGVpZ2h0OiBjZWxsU2l6ZSArIFwicHhcIixcclxuXHRcdFx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcblx0XHRcdFx0XHRsZWZ0OiB4ICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0dG9wOiB5ICsgXCJweFwiXHJcblx0XHRcdFx0fSkuYXBwZW5kVG8oJG1hcExheWVyKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dGhpcy5lbmdpbi5zZXREYXRhU291cmNlKGRhdGFTb3VyY2UpO1xyXG5cdH0sXHJcblxyXG5cdGNoZWNrQ2hhbmdlTWFwOiBmdW5jdGlvbih4LHkpe1xyXG5cdFx0dmFyIHBvc2l0aW9uID0gdGhpcy5fZ2V0UG9zaXRpb24oeCx5KTtcclxuXHRcdHZhciBleGl0cyA9IHRoaXMubWFwc1t0aGlzLmN1cnJlbnRNYXBLZXldLmV4aXRzO1xyXG5cdFx0dmFyIGV4aXRzSW5mbyA9IGV4aXRzW3Bvc2l0aW9uXTtcclxuXHRcdGlmKGV4aXRzSW5mbyl7XHJcblx0XHRcdC8vIOWIsOi+vuWHuuWPoyzliqDovb3kuIvkuIDlvKDlnLDlm75cclxuXHRcdFx0dGhpcy5fY2hhbmdlTWFwKGV4aXRzSW5mbyk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0X2NoYW5nZU1hcDogZnVuY3Rpb24oZXhpdHNJbmZvKXtcclxuXHRcdHZhciBtYXBOYW1lID0gZXhpdHNJbmZvLm1hcDtcclxuXHRcdHZhciBpbml0UG9zaXRpb24gPSBleGl0c0luZm8uaW5pdFBvc2l0aW9uO1xyXG5cdFx0dmFyIGZhY2VUbyA9IGV4aXRzSW5mby5mYWNlVG87XHJcblxyXG5cdFx0dmFyIHBvc0FyciA9IGluaXRQb3NpdGlvbi5zcGxpdChcIl9cIik7XHJcblx0XHR2YXIgeCA9IHBvc0FyclswXTtcclxuXHRcdHZhciB5ID0gcG9zQXJyWzFdO1xyXG5cclxuXHRcdHRoaXMuZW5naW4uY2hhcmFjdGVyRW5naW4uY3VycmVudENoYXJhY3Rlci5zdG9wKCk7XHJcblx0XHQkKFwiLmNoYXJhY3Rlci1vdmVybGF5XCIpLnNob3coKTtcclxuXHRcdHRoaXMubG9hZE1hcChtYXBOYW1lKTtcclxuXHRcdHRoaXMuZW5naW4uY2hhcmFjdGVyRW5naW4uc2V0Q2hhcmFjdGVyUG9zaXRpb24oeCwgeSwgZmFjZVRvKTtcclxuXHRcdCQoXCIuY2hhcmFjdGVyLW92ZXJsYXlcIikuaGlkZSgpO1xyXG5cdH0sXHJcblxyXG5cdC8vIHBhcmFtOiA0NTAsIDQ1XHJcblx0Ly8gcmV0dXJuIFwiMTBfMVwiXHJcblx0X2dldFBvc2l0aW9uOiBmdW5jdGlvbih4LCB5KXtcclxuXHRcdHZhciBjZWxsU2l6ZSA9IHRoaXMuY29uZmlnLmNlbGxTaXplO1xyXG5cdFx0cmV0dXJuIFwiXCIgKyB4IC8gY2VsbFNpemUgKyBcIl9cIiArICB5IC8gY2VsbFNpemU7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEVuZ2luO1xyXG4iLCJ2YXIgY2hhcmFjdGVycyA9IHt9XHJcblxyXG5jaGFyYWN0ZXJzW1wiZ2lybFwiXSA9IHtcclxuXHRpbWdOYW1lOiBcImNfZ2lybC5wbmdcIixcclxuXHRzaXplOiA0NVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjaGFyYWN0ZXJzOyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGNlbGxTaXplOiA0NVxyXG59IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoXCIuL2NvbmZpZy5qc1wiKTtcclxudmFyIEVuZ2luID0gcmVxdWlyZShcIi4vRW5naW4uanNcIik7XHJcblxyXG52YXIgZW5naW4gPSBuZXcgRW5naW4oY29uZmlnKTtcclxuXHJcblxyXG4kKGZ1bmN0aW9uKCl7XHJcblx0ZW5naW4uaW5pdCgpO1xyXG59KSIsInZhciBtYXBzID0ge31cclxuXHJcbm1hcHNbXCJtYXBNYXBwaW5nXCJdID0ge1xyXG5cdFwidHJcIjoge1xyXG5cdFx0bmFtZTogXCJ0cmVlLnBuZ1wiLFxyXG5cdFx0Y2FuV2FsazogZmFsc2VcclxuXHR9LFxyXG5cdFwic2VcIjoge1xyXG5cdFx0bmFtZTogXCJzZWEucG5nXCIsXHJcblx0XHRjYW5XYWxrOiBmYWxzZVxyXG5cdH0sXHJcblx0XCJiZVwiOiB7XHJcblx0XHRuYW1lOiBcImJlYWNoLnBuZ1wiLFxyXG5cdFx0Y2FuV2FsazogdHJ1ZVxyXG5cdH0sXHJcblx0XCJsYVwiOiB7XHJcblx0XHRuYW1lOiBcImxhbmQucG5nXCIsXHJcblx0XHRjYW5XYWxrOiB0cnVlXHJcblx0fSxcclxuXHRcImJyXCI6IHtcclxuXHRcdG5hbWU6IFwiYnJpZGdlLnBuZ1wiLFxyXG5cdFx0Y2FuV2FsazogdHJ1ZVxyXG5cdH1cclxufVxyXG5cclxubWFwc1tcIjAxXCJdID0ge1xyXG5cdGluaXRQb3NpdGlvbjogXCI5XzVcIixcclxuXHRpbml0RmFjZVRvOiBcInJpZ2h0XCIsXHJcblx0ZGF0YTogXHJcblx0XHRcInRyLHRyLHRyLGJlLHNlLGJyLHNlLGJlLHRyLHRyLHRyX1wiICtcclxuXHRcdFwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJfXCIgK1xyXG5cdFx0XCJ0cix0cix0cixiZSxiZSxicixiZSxiZSx0cix0cix0cl9cIiArXHJcblx0XHRcInRyLHRyLHRyLGxhLGxhLGxhLGxhLGxhLHRyLHRyLHRyX1wiICtcclxuXHRcdFwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cdFx0XCJsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYV9cIiArXHJcblx0XHRcInRyLHRyLHRyLGxhLGxhLGxhLGxhLGxhLHRyLHRyLHRyX1wiICtcclxuXHRcdFwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cdFx0XCJ0cix0cix0cixiZSxiZSxicixiZSxiZSx0cix0cix0cl9cIiArXHJcblx0XHRcInRyLHRyLHRyLGJlLHNlLGJyLHNlLGJlLHRyLHRyLHRyX1wiICtcclxuXHRcdFwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJcIixcclxuXHRleGl0czoge1xyXG5cdFx0XCIxMF81XCI6IHtcclxuXHRcdFx0bWFwOiBcIjAyXCIsXHJcblx0XHRcdGluaXRQb3NpdGlvbjogXCIwXzVcIixcclxuXHRcdFx0ZmFjZVRvOiBcInJpZ3RoXCJcclxuXHRcdH0sXHJcblx0XHRcIjVfMTBcIjoge1xyXG5cdFx0XHRtYXA6IFwiMDNcIixcclxuXHRcdFx0aW5pdFBvc2l0aW9uOiBcIjFfMFwiLFxyXG5cdFx0XHRmYWNlVG86IFwiZG93blwiXHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxubWFwc1tcIjAyXCJdID0ge1xyXG5cdGRhdGE6IFxyXG5cdFx0XCJ0cix0cix0cix0cix0cix0cix0cix0cix0cix0cix0cl9cIiArXHJcblx0XHRcInRyLHRyLHRyLHRyLHRyLHRyLHRyLHRyLHRyLHRyLHRyX1wiICtcclxuXHRcdFwidHIsdHIsdHIsdHIsdHIsdHIsdHIsdHIsdHIsdHIsdHJfXCIgK1xyXG5cdFx0XCJ0cix0cix0cix0cix0cix0cix0cix0cix0cix0cix0cl9cIiArXHJcblx0XHRcImxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhX1wiICtcclxuXHRcdFwibGEsbGEsbGEsbGEsbGEsbGEsbGEsbGEsbGEsbGEsbGFfXCIgK1xyXG5cdFx0XCJsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYV9cIiArXHJcblx0XHRcInRyLHRyLHRyLHRyLHRyLHRyLHRyLHRyLHRyLHRyLHRyX1wiICtcclxuXHRcdFwidHIsdHIsdHIsdHIsdHIsdHIsdHIsdHIsdHIsdHIsdHJfXCIgK1xyXG5cdFx0XCJ0cix0cix0cix0cix0cix0cix0cix0cix0cix0cix0cl9cIiArXHJcblx0XHRcInRyLHRyLHRyLHRyLHRyLHRyLHRyLHRyLHRyLHRyLHRyXCIsXHJcblx0ZXhpdHM6IHtcclxuXHRcdFwiMF81XCI6IHtcclxuXHRcdFx0bWFwOiBcIjAxXCIsXHJcblx0XHRcdGluaXRQb3NpdGlvbjogXCIxMF81XCIsXHJcblx0XHRcdGZhY2VUbzogXCJsZWZ0XCJcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5tYXBzW1wiMDNcIl0gPSB7XHJcblx0ZGF0YTogXHJcblx0XHRcInRyLGxhLGxhLHRyLHRyLHRyLHRyLHRyLHRyLHRyLHRyX1wiICtcclxuXHRcdFwidHIsdHIsbGEsbGEsdHIsdHIsdHIsdHIsdHIsdHIsdHJfXCIgK1xyXG5cdFx0XCJ0cix0cix0cixsYSxsYSx0cix0cixsYSxsYSxsYSx0cl9cIiArXHJcblx0XHRcInRyLHRyLHRyLHRyLGxhLGxhLHRyLGxhLHRyLGxhLHRyX1wiICtcclxuXHRcdFwidHIsdHIsdHIsdHIsdHIsbGEsdHIsbGEsdHIsbGEsdHJfXCIgK1xyXG5cdFx0XCJ0cix0cix0cix0cix0cixsYSx0cixsYSx0cixsYSx0cl9cIiArXHJcblx0XHRcInRyLHRyLHRyLHRyLHRyLGxhLHRyLGxhLHRyLGxhLHRyX1wiICtcclxuXHRcdFwidHIsdHIsdHIsdHIsdHIsbGEsdHIsbGEsdHIsbGEsdHJfXCIgK1xyXG5cdFx0XCJ0cix0cix0cix0cix0cixsYSxsYSxsYSxsYSxsYSx0cl9cIiArXHJcblx0XHRcInRyLHRyLHRyLHRyLHRyLHRyLHRyLGxhLHRyLHRyLHRyX1wiICtcclxuXHRcdFwidHIsdHIsdHIsdHIsdHIsdHIsdHIsbGEsbGEsbGEsdHJcIixcclxuXHRleGl0czoge1xyXG5cdFx0XCIxXzBcIjoge1xyXG5cdFx0XHRtYXA6IFwiMDFcIixcclxuXHRcdFx0aW5pdFBvc2l0aW9uOiBcIjVfMTBcIixcclxuXHRcdFx0ZmFjZVRvOiBcInVwXCJcclxuXHRcdH1cclxuXHR9XHJcbn07XHJcblxyXG5cclxuLy8g5Zyw5Zu+5pWw5o2u5Liy6L2s5LqM57u05pWw57uEXHJcbmZ1bmN0aW9uIHRvQXJyYXkoc3RyKXtcclxuXHR2YXIgcmV0dXJuQXJyYXkgPSBbXTtcclxuXHR2YXIgbGluZUFyciA9IHN0ci5zcGxpdChcIl9cIik7XHJcblx0bGluZUFyci5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpe1xyXG5cdFx0cmV0dXJuQXJyYXkucHVzaChsaW5lLnNwbGl0KFwiLFwiKSk7XHJcblx0fSk7XHJcblx0cmV0dXJuIHJldHVybkFycmF5O1xyXG59XHJcblxyXG5cclxuZm9yKHZhciBrZXkgaW4gbWFwcyl7XHJcblx0aWYoL1xcZFxcZC8udGVzdChrZXkpKXtcclxuXHRcdG1hcHNba2V5XS5kYXRhID0gdG9BcnJheShtYXBzW2tleV0uZGF0YSk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1hcHMiXX0=
