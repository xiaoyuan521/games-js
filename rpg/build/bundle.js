(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var characters = require("./characters.js");
var maps = require("./maps");

function CharacterEngin(config) {
	this.config = config;
	this.engin = null;
	this.dataSource = null;
	this.characterData = null;

	this.currentDirection = "right";
	this.nextDirection = null;

	// 人物动作的css偏移用 x = 0; y = 1
	this.currentMove = "01"; 

	// 计步器，2个状态 0，1
	this.walkFlg = 0;

	// 人物在地图中的位置
	this.x = 0;
	this.y = 0;


}

CharacterEngin.prototype = {
	constructor: CharacterEngin,

	init: function(engin){
		this.engin = engin;
		this.dataSource = engin.getDataSource();

		this.bindEvent();

		var x = 3 * this.config.cellSize;
		var y = 3 * this.config.cellSize;
		this.loadCharacter("girl", x, y);

		this.startTimer();

	},

	// 定时检测人物走动
	startTimer: function(){
		var _this = this;
		setInterval(function(){
			_this.walk();
		}, 200);
	},

	// 人物走动的键盘事件
	bindEvent: function(){
		var _this = this;
		$(document.body).on("keydown.character.walk", function(e){
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
					break
			}
		});
	},

	// 加载人物图片，初始化姿势
	loadCharacter: function(name, x, y){

		this.x = x;
		this.y = y;

		var characterData = this.characterData = characters[name];
		var characterSize = characterData.size;
		var imgPath = "images/" + characterData.imgName;

		var $characterDom = $('<div class="currentCharacter"></div>');
		$characterDom.appendTo($(".main"));

		var positions = this._getPositionXY(characterSize, this.currentMove);
		$characterDom.css({
			"width": characterSize + "px",
			"height": characterSize + "px",
			"background-image": "url('" + imgPath + "')",
			"background-position-x": positions.x + "px",
			"background-position-y": positions.y + "px",
			"transition": "top .4s linear,left .4s linear" // 移动的动画效果
		});

		// 将人物放到地图中
		$characterDom.css({
			"position": "absolute",
			"left": x + "px",
			"top": y + "px"
		});

	},

	// 人物移动
	walk: function(){

		var $characterDom = $(".currentCharacter");
		if($characterDom.length == 0) {
			return;
		}
		if(this.nextDirection == null){
			return;
		}

		var canWalkFlg = true;
		var nextMapXy = null;
		if(this.walkFlg == 0){
			// 走第一步，判断下一个位置是否能走
			nextMapXy = this._getNextMapXy(this.nextDirection);
			canWalkFlg = this._canWalk(nextMapXy);
			if(canWalkFlg === true) {
				this.x = nextMapXy.x;
				this.y = nextMapXy.y;
				this._moveCharacter(this.x, this.y);
			}
		} else if(this.walkFlg == 1){
			// 走第二步
			canWalkFlg = true;
		}

		if(canWalkFlg === true){
			this._walk();
		}

		// 每走2步，计步器归0
		if(this.walkFlg == 2){
			this.walkFlg = 0;
		}

		// 走完后，将nextDirection设定为null，停止行走
		if(this.walkFlg == 0){
			this.nextDirection = null;
		}
	},

	// 人物移动
	_walk: function() {

		this.walkFlg++;

		var nextMove = this._getNextMove();
		var nextPositions = this._getPositionXY(this.characterData.size, nextMove);

		var $characterDom = $(".currentCharacter");
		$characterDom.css({
			"background-position-x": nextPositions.x + "px",
			"background-position-y": nextPositions.y + "px"
		});
		
		this.currentMove = nextMove;
		this.currentDirection = this.nextDirection;

	},

	_moveCharacter: function(x, y){
		var $characterDom = $(".currentCharacter");
		$characterDom.css({
			"left": x + "px",
			"top": y + "px"
		});
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
	},

	// 计算人物的css偏移量
	_getPositionXY: function(size, movePosition){
		var x = size * parseInt(movePosition[0], 10) * -1;
		var y = size * parseInt(movePosition[1], 10) * -1;
		return {
			x: x,
			y: y
		}
	},

	// 取得下一次移动的位置 
	// "03", "33" ...
	_getNextMove: function(){
		var currentMove = this.currentMove;
		var currentDirection = this.currentDirection;
		var nextDirection = this.nextDirection;
		var returnMove = null;

		if(currentDirection == nextDirection){
			// 向同一个方向行走

			var moveInt = parseInt(currentMove[0], 10);
			moveInt++;
			if(moveInt > 3){
				moveInt = 0;
			}
			returnMove = moveInt + currentMove[1];
		} else {
			// 改变行走方向

			this.walkFlg=0;
			switch(nextDirection){
				case "left":
					returnMove = "03";
					break;
				case "right":
					returnMove = "01";
					break;
				case "up":
					returnMove = "02";
					break;
				case "down":
					returnMove = "00";
					break;
			}
		}
		return returnMove;
		
	}
}

module.exports = CharacterEngin
},{"./characters.js":5,"./maps":8}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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

},{"./CharacterEngin.js":1,"./MapEngin":4}],4:[function(require,module,exports){
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

},{"./CoorMap.js":2,"./maps.js":8}],5:[function(require,module,exports){
var characters = {}

characters["girl"] = {
	imgName: "c_girl.png",
	size: 45

}

module.exports = characters;
},{}],6:[function(require,module,exports){
module.exports = {
	cellSize: 45
}
},{}],7:[function(require,module,exports){
var config = require("./config.js");
var Engin = require("./Engin.js");

var engin = new Engin(config);


$(function(){
	engin.init();
})
},{"./Engin.js":3,"./config.js":6}],8:[function(require,module,exports){
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
},{}]},{},[1,2,3,4,5,6,7,8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL1VzZXJzL3poYW9faG9uZ3NoZW5nL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJycGcvZnJvbnRlbmQvQ2hhcmFjdGVyRW5naW4uanMiLCJycGcvZnJvbnRlbmQvQ29vck1hcC5qcyIsInJwZy9mcm9udGVuZC9Fbmdpbi5qcyIsInJwZy9mcm9udGVuZC9NYXBFbmdpbi5qcyIsInJwZy9mcm9udGVuZC9jaGFyYWN0ZXJzLmpzIiwicnBnL2Zyb250ZW5kL2NvbmZpZy5qcyIsInJwZy9mcm9udGVuZC9pbmRleC5qcyIsInJwZy9mcm9udGVuZC9tYXBzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY2hhcmFjdGVycyA9IHJlcXVpcmUoXCIuL2NoYXJhY3RlcnMuanNcIik7XHJcbnZhciBtYXBzID0gcmVxdWlyZShcIi4vbWFwc1wiKTtcclxuXHJcbmZ1bmN0aW9uIENoYXJhY3RlckVuZ2luKGNvbmZpZykge1xyXG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdHRoaXMuZW5naW4gPSBudWxsO1xyXG5cdHRoaXMuZGF0YVNvdXJjZSA9IG51bGw7XHJcblx0dGhpcy5jaGFyYWN0ZXJEYXRhID0gbnVsbDtcclxuXHJcblx0dGhpcy5jdXJyZW50RGlyZWN0aW9uID0gXCJyaWdodFwiO1xyXG5cdHRoaXMubmV4dERpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdC8vIOS6uueJqeWKqOS9nOeahGNzc+WBj+enu+eUqCB4ID0gMDsgeSA9IDFcclxuXHR0aGlzLmN1cnJlbnRNb3ZlID0gXCIwMVwiOyBcclxuXHJcblx0Ly8g6K6h5q2l5Zmo77yMMuS4queKtuaAgSAw77yMMVxyXG5cdHRoaXMud2Fsa0ZsZyA9IDA7XHJcblxyXG5cdC8vIOS6uueJqeWcqOWcsOWbvuS4reeahOS9jee9rlxyXG5cdHRoaXMueCA9IDA7XHJcblx0dGhpcy55ID0gMDtcclxuXHJcblxyXG59XHJcblxyXG5DaGFyYWN0ZXJFbmdpbi5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IENoYXJhY3RlckVuZ2luLFxyXG5cclxuXHRpbml0OiBmdW5jdGlvbihlbmdpbil7XHJcblx0XHR0aGlzLmVuZ2luID0gZW5naW47XHJcblx0XHR0aGlzLmRhdGFTb3VyY2UgPSBlbmdpbi5nZXREYXRhU291cmNlKCk7XHJcblxyXG5cdFx0dGhpcy5iaW5kRXZlbnQoKTtcclxuXHJcblx0XHR2YXIgeCA9IDMgKiB0aGlzLmNvbmZpZy5jZWxsU2l6ZTtcclxuXHRcdHZhciB5ID0gMyAqIHRoaXMuY29uZmlnLmNlbGxTaXplO1xyXG5cdFx0dGhpcy5sb2FkQ2hhcmFjdGVyKFwiZ2lybFwiLCB4LCB5KTtcclxuXHJcblx0XHR0aGlzLnN0YXJ0VGltZXIoKTtcclxuXHJcblx0fSxcclxuXHJcblx0Ly8g5a6a5pe25qOA5rWL5Lq654mp6LWw5YqoXHJcblx0c3RhcnRUaW1lcjogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBfdGhpcyA9IHRoaXM7XHJcblx0XHRzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xyXG5cdFx0XHRfdGhpcy53YWxrKCk7XHJcblx0XHR9LCAyMDApO1xyXG5cdH0sXHJcblxyXG5cdC8vIOS6uueJqei1sOWKqOeahOmUruebmOS6i+S7tlxyXG5cdGJpbmRFdmVudDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBfdGhpcyA9IHRoaXM7XHJcblx0XHQkKGRvY3VtZW50LmJvZHkpLm9uKFwia2V5ZG93bi5jaGFyYWN0ZXIud2Fsa1wiLCBmdW5jdGlvbihlKXtcclxuXHRcdFx0c3dpdGNoKGUua2V5Q29kZSl7XHJcblx0XHRcdFx0Y2FzZSAzNzpcclxuXHRcdFx0XHRcdF90aGlzLm5leHREaXJlY3Rpb24gPSBcImxlZnRcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMzg6XHJcblx0XHRcdFx0XHRfdGhpcy5uZXh0RGlyZWN0aW9uID0gXCJ1cFwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzOTpcclxuXHRcdFx0XHRcdF90aGlzLm5leHREaXJlY3Rpb24gPSBcInJpZ2h0XCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDQwOlxyXG5cdFx0XHRcdFx0X3RoaXMubmV4dERpcmVjdGlvbiA9IFwiZG93blwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdC8vIOWKoOi9veS6uueJqeWbvueJh++8jOWIneWni+WMluWnv+WKv1xyXG5cdGxvYWRDaGFyYWN0ZXI6IGZ1bmN0aW9uKG5hbWUsIHgsIHkpe1xyXG5cclxuXHRcdHRoaXMueCA9IHg7XHJcblx0XHR0aGlzLnkgPSB5O1xyXG5cclxuXHRcdHZhciBjaGFyYWN0ZXJEYXRhID0gdGhpcy5jaGFyYWN0ZXJEYXRhID0gY2hhcmFjdGVyc1tuYW1lXTtcclxuXHRcdHZhciBjaGFyYWN0ZXJTaXplID0gY2hhcmFjdGVyRGF0YS5zaXplO1xyXG5cdFx0dmFyIGltZ1BhdGggPSBcImltYWdlcy9cIiArIGNoYXJhY3RlckRhdGEuaW1nTmFtZTtcclxuXHJcblx0XHR2YXIgJGNoYXJhY3RlckRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjdXJyZW50Q2hhcmFjdGVyXCI+PC9kaXY+Jyk7XHJcblx0XHQkY2hhcmFjdGVyRG9tLmFwcGVuZFRvKCQoXCIubWFpblwiKSk7XHJcblxyXG5cdFx0dmFyIHBvc2l0aW9ucyA9IHRoaXMuX2dldFBvc2l0aW9uWFkoY2hhcmFjdGVyU2l6ZSwgdGhpcy5jdXJyZW50TW92ZSk7XHJcblx0XHQkY2hhcmFjdGVyRG9tLmNzcyh7XHJcblx0XHRcdFwid2lkdGhcIjogY2hhcmFjdGVyU2l6ZSArIFwicHhcIixcclxuXHRcdFx0XCJoZWlnaHRcIjogY2hhcmFjdGVyU2l6ZSArIFwicHhcIixcclxuXHRcdFx0XCJiYWNrZ3JvdW5kLWltYWdlXCI6IFwidXJsKCdcIiArIGltZ1BhdGggKyBcIicpXCIsXHJcblx0XHRcdFwiYmFja2dyb3VuZC1wb3NpdGlvbi14XCI6IHBvc2l0aW9ucy54ICsgXCJweFwiLFxyXG5cdFx0XHRcImJhY2tncm91bmQtcG9zaXRpb24teVwiOiBwb3NpdGlvbnMueSArIFwicHhcIixcclxuXHRcdFx0XCJ0cmFuc2l0aW9uXCI6IFwidG9wIC40cyBsaW5lYXIsbGVmdCAuNHMgbGluZWFyXCIgLy8g56e75Yqo55qE5Yqo55S75pWI5p6cXHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyDlsIbkurrnianmlL7liLDlnLDlm77kuK1cclxuXHRcdCRjaGFyYWN0ZXJEb20uY3NzKHtcclxuXHRcdFx0XCJwb3NpdGlvblwiOiBcImFic29sdXRlXCIsXHJcblx0XHRcdFwibGVmdFwiOiB4ICsgXCJweFwiLFxyXG5cdFx0XHRcInRvcFwiOiB5ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHJcblx0fSxcclxuXHJcblx0Ly8g5Lq654mp56e75YqoXHJcblx0d2FsazogZnVuY3Rpb24oKXtcclxuXHJcblx0XHR2YXIgJGNoYXJhY3RlckRvbSA9ICQoXCIuY3VycmVudENoYXJhY3RlclwiKTtcclxuXHRcdGlmKCRjaGFyYWN0ZXJEb20ubGVuZ3RoID09IDApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0aWYodGhpcy5uZXh0RGlyZWN0aW9uID09IG51bGwpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGNhbldhbGtGbGcgPSB0cnVlO1xyXG5cdFx0dmFyIG5leHRNYXBYeSA9IG51bGw7XHJcblx0XHRpZih0aGlzLndhbGtGbGcgPT0gMCl7XHJcblx0XHRcdC8vIOi1sOesrOS4gOatpe+8jOWIpOaWreS4i+S4gOS4quS9jee9ruaYr+WQpuiDvei1sFxyXG5cdFx0XHRuZXh0TWFwWHkgPSB0aGlzLl9nZXROZXh0TWFwWHkodGhpcy5uZXh0RGlyZWN0aW9uKTtcclxuXHRcdFx0Y2FuV2Fsa0ZsZyA9IHRoaXMuX2NhbldhbGsobmV4dE1hcFh5KTtcclxuXHRcdFx0aWYoY2FuV2Fsa0ZsZyA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRcdHRoaXMueCA9IG5leHRNYXBYeS54O1xyXG5cdFx0XHRcdHRoaXMueSA9IG5leHRNYXBYeS55O1xyXG5cdFx0XHRcdHRoaXMuX21vdmVDaGFyYWN0ZXIodGhpcy54LCB0aGlzLnkpO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2UgaWYodGhpcy53YWxrRmxnID09IDEpe1xyXG5cdFx0XHQvLyDotbDnrKzkuozmraVcclxuXHRcdFx0Y2FuV2Fsa0ZsZyA9IHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYoY2FuV2Fsa0ZsZyA9PT0gdHJ1ZSl7XHJcblx0XHRcdHRoaXMuX3dhbGsoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyDmr4/otbAy5q2l77yM6K6h5q2l5Zmo5b2SMFxyXG5cdFx0aWYodGhpcy53YWxrRmxnID09IDIpe1xyXG5cdFx0XHR0aGlzLndhbGtGbGcgPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIOi1sOWujOWQju+8jOWwhm5leHREaXJlY3Rpb27orr7lrprkuLpudWxs77yM5YGc5q2i6KGM6LWwXHJcblx0XHRpZih0aGlzLndhbGtGbGcgPT0gMCl7XHJcblx0XHRcdHRoaXMubmV4dERpcmVjdGlvbiA9IG51bGw7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Ly8g5Lq654mp56e75YqoXHJcblx0X3dhbGs6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdHRoaXMud2Fsa0ZsZysrO1xyXG5cclxuXHRcdHZhciBuZXh0TW92ZSA9IHRoaXMuX2dldE5leHRNb3ZlKCk7XHJcblx0XHR2YXIgbmV4dFBvc2l0aW9ucyA9IHRoaXMuX2dldFBvc2l0aW9uWFkodGhpcy5jaGFyYWN0ZXJEYXRhLnNpemUsIG5leHRNb3ZlKTtcclxuXHJcblx0XHR2YXIgJGNoYXJhY3RlckRvbSA9ICQoXCIuY3VycmVudENoYXJhY3RlclwiKTtcclxuXHRcdCRjaGFyYWN0ZXJEb20uY3NzKHtcclxuXHRcdFx0XCJiYWNrZ3JvdW5kLXBvc2l0aW9uLXhcIjogbmV4dFBvc2l0aW9ucy54ICsgXCJweFwiLFxyXG5cdFx0XHRcImJhY2tncm91bmQtcG9zaXRpb24teVwiOiBuZXh0UG9zaXRpb25zLnkgKyBcInB4XCJcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHR0aGlzLmN1cnJlbnRNb3ZlID0gbmV4dE1vdmU7XHJcblx0XHR0aGlzLmN1cnJlbnREaXJlY3Rpb24gPSB0aGlzLm5leHREaXJlY3Rpb247XHJcblxyXG5cdH0sXHJcblxyXG5cdF9tb3ZlQ2hhcmFjdGVyOiBmdW5jdGlvbih4LCB5KXtcclxuXHRcdHZhciAkY2hhcmFjdGVyRG9tID0gJChcIi5jdXJyZW50Q2hhcmFjdGVyXCIpO1xyXG5cdFx0JGNoYXJhY3RlckRvbS5jc3Moe1xyXG5cdFx0XHRcImxlZnRcIjogeCArIFwicHhcIixcclxuXHRcdFx0XCJ0b3BcIjogeSArIFwicHhcIlxyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0Ly8g5Zyw5Zu+5Lit77yM5LiL5LiA5Liq54K55piv5ZCm5Li65Y+v5Lul56e75Yqo54K5XHJcblx0X2NhbldhbGs6IGZ1bmN0aW9uKG5leHRNYXBYeSl7XHJcblxyXG5cdFx0aWYodGhpcy5uZXh0RGlyZWN0aW9uID09IG51bGwpe1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8g6LaF5Ye65Zyw5Zu+XHJcblx0XHRpZihuZXh0TWFwWHkueCA8IDAgfHwgbmV4dE1hcFh5LnkgPCAwKXtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIOS4jeiDveihjOi1sOeahOWcsOWbvlxyXG5cdFx0dmFyIG1hcENlbGxOYW1lID0gdGhpcy5kYXRhU291cmNlLmdldChuZXh0TWFwWHkueCwgbmV4dE1hcFh5LnkpLmJnO1xyXG5cdFx0aWYobWFwc1tcIm1hcE1hcHBpbmdcIl1bbWFwQ2VsbE5hbWVdW1wiY2FuV2Fsa1wiXSA9PT0gZmFsc2Upe1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSxcclxuXHJcblx0Ly8g5qC55o2u6KGM6LWw5pa55ZCR5Y+W5b6X77yM5LiL5LiA5Liq5Zyw5Zu+55qEeO+8jHnlnZDmoIdcclxuXHRfZ2V0TmV4dE1hcFh5OiBmdW5jdGlvbihkaXJlY3Rpb24pe1xyXG5cdFx0dmFyIGNlbGxTaXplID0gdGhpcy5jb25maWcuY2VsbFNpemU7XHJcblx0XHR2YXIgeCA9IDA7XHJcblx0XHR2YXIgeSA9IDA7XHJcblx0XHRzd2l0Y2goZGlyZWN0aW9uKXtcclxuXHRcdFx0Y2FzZSBcImxlZnRcIjpcclxuXHRcdFx0XHR4ID0gdGhpcy54IC0gY2VsbFNpemU7XHJcblx0XHRcdFx0eSA9IHRoaXMueTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcInJpZ2h0XCI6XHJcblx0XHRcdFx0eCA9IHRoaXMueCArIGNlbGxTaXplO1xyXG5cdFx0XHRcdHkgPSB0aGlzLnk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJ1cFwiOlxyXG5cdFx0XHRcdHggPSB0aGlzLng7XHJcblx0XHRcdFx0eSA9IHRoaXMueSAtIGNlbGxTaXplO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiZG93blwiOlxyXG5cdFx0XHRcdHggPSB0aGlzLng7XHJcblx0XHRcdFx0eSA9IHRoaXMueSArIGNlbGxTaXplO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDp4LFxyXG5cdFx0XHR5OnlcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvLyDorqHnrpfkurrniannmoRjc3PlgY/np7vph49cclxuXHRfZ2V0UG9zaXRpb25YWTogZnVuY3Rpb24oc2l6ZSwgbW92ZVBvc2l0aW9uKXtcclxuXHRcdHZhciB4ID0gc2l6ZSAqIHBhcnNlSW50KG1vdmVQb3NpdGlvblswXSwgMTApICogLTE7XHJcblx0XHR2YXIgeSA9IHNpemUgKiBwYXJzZUludChtb3ZlUG9zaXRpb25bMV0sIDEwKSAqIC0xO1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDogeCxcclxuXHRcdFx0eTogeVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdC8vIOWPluW+l+S4i+S4gOasoeenu+WKqOeahOS9jee9riBcclxuXHQvLyBcIjAzXCIsIFwiMzNcIiAuLi5cclxuXHRfZ2V0TmV4dE1vdmU6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY3VycmVudE1vdmUgPSB0aGlzLmN1cnJlbnRNb3ZlO1xyXG5cdFx0dmFyIGN1cnJlbnREaXJlY3Rpb24gPSB0aGlzLmN1cnJlbnREaXJlY3Rpb247XHJcblx0XHR2YXIgbmV4dERpcmVjdGlvbiA9IHRoaXMubmV4dERpcmVjdGlvbjtcclxuXHRcdHZhciByZXR1cm5Nb3ZlID0gbnVsbDtcclxuXHJcblx0XHRpZihjdXJyZW50RGlyZWN0aW9uID09IG5leHREaXJlY3Rpb24pe1xyXG5cdFx0XHQvLyDlkJHlkIzkuIDkuKrmlrnlkJHooYzotbBcclxuXHJcblx0XHRcdHZhciBtb3ZlSW50ID0gcGFyc2VJbnQoY3VycmVudE1vdmVbMF0sIDEwKTtcclxuXHRcdFx0bW92ZUludCsrO1xyXG5cdFx0XHRpZihtb3ZlSW50ID4gMyl7XHJcblx0XHRcdFx0bW92ZUludCA9IDA7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuTW92ZSA9IG1vdmVJbnQgKyBjdXJyZW50TW92ZVsxXTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIOaUueWPmOihjOi1sOaWueWQkVxyXG5cclxuXHRcdFx0dGhpcy53YWxrRmxnPTA7XHJcblx0XHRcdHN3aXRjaChuZXh0RGlyZWN0aW9uKXtcclxuXHRcdFx0XHRjYXNlIFwibGVmdFwiOlxyXG5cdFx0XHRcdFx0cmV0dXJuTW92ZSA9IFwiMDNcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgXCJyaWdodFwiOlxyXG5cdFx0XHRcdFx0cmV0dXJuTW92ZSA9IFwiMDFcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgXCJ1cFwiOlxyXG5cdFx0XHRcdFx0cmV0dXJuTW92ZSA9IFwiMDJcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgXCJkb3duXCI6XHJcblx0XHRcdFx0XHRyZXR1cm5Nb3ZlID0gXCIwMFwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiByZXR1cm5Nb3ZlO1xyXG5cdFx0XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJhY3RlckVuZ2luIiwidmFyIENvb3JNYXAgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMubWFwID0gbmV3IE1hcCgpO1xyXG59XHJcbkNvb3JNYXAucHJvdG90eXBlID0ge1xyXG5cdGNvbnN0cnVjdG9yOiBDb29yTWFwLFxyXG5cdGdldDogZnVuY3Rpb24oeCwgeSl7XHJcblx0XHR2YXIgayA9IG51bGw7XHJcblx0XHRmb3Ioa2V5IG9mIHRoaXMubWFwLmtleXMoKSl7XHJcblx0XHRcdGlmKGtleS54ID09IHggJiYga2V5LnkgPT0geSl7XHJcblx0XHRcdFx0ayA9IGtleTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLm1hcC5nZXQoayk7XHJcblx0fSxcclxuXHRzZXQ6IGZ1bmN0aW9uKHgseSwgdmFsdWUpe1xyXG5cdFx0dmFyIGsgPSBudWxsO1xyXG5cdFx0Zm9yKGtleSBvZiB0aGlzLm1hcC5rZXlzKCkpe1xyXG5cdFx0XHRpZihrZXkueCA9PSB4ICYmIGtleS55ID09IHkpe1xyXG5cdFx0XHRcdGsgPSBrZXk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmKGspIHtcclxuXHRcdFx0dGhpcy5tYXAuc2V0KGssIHZhbHVlKTtcclxuXHRcdH1lbHNlIHtcclxuXHRcdFx0dGhpcy5tYXAuc2V0KHtcInhcIjp4ICwgXCJ5XCI6eX0sIHZhbHVlKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdGdldE1hcDogZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5tYXA7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvb3JNYXA7IiwidmFyIE1hcEVuZ2luID0gcmVxdWlyZShcIi4vTWFwRW5naW5cIik7XHJcbnZhciBDaGFyYWN0ZXJFbmdpbiA9IHJlcXVpcmUoXCIuL0NoYXJhY3RlckVuZ2luLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gRW5naW4oY29uZmlnKSB7XHJcblx0dGhpcy5jb25maWcgPSBjb25maWc7XHJcblx0dGhpcy5kYXRhU291cmNlID0gbnVsbDtcclxuXHR0aGlzLm1hcEVuZ2luID0gbmV3IE1hcEVuZ2luKGNvbmZpZyk7XHJcblx0dGhpcy5jaGFyYWN0ZXJFbmdpbiA9IG5ldyBDaGFyYWN0ZXJFbmdpbihjb25maWcpO1xyXG59XHJcblxyXG5Fbmdpbi5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IEVuZ2luLFxyXG5cclxuXHRpbml0OiBmdW5jdGlvbigpIHtcclxuXHRcdHRoaXMubWFwRW5naW4uaW5pdCh0aGlzKTtcclxuXHRcdHRoaXMuY2hhcmFjdGVyRW5naW4uaW5pdCh0aGlzKTtcclxuXHR9LFxyXG5cclxuXHRzdGFydDogZnVuY3Rpb24oKSB7XHJcblxyXG5cdH0sXHJcblxyXG5cdHNldERhdGFTb3VyY2U6IGZ1bmN0aW9uKGRhdGFTb3VyY2UpIHtcclxuXHRcdHRoaXMuZGF0YVNvdXJjZSA9IGRhdGFTb3VyY2U7XHJcblx0fSxcclxuXHJcblx0Z2V0RGF0YVNvdXJjZTogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiB0aGlzLmRhdGFTb3VyY2U7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cz1FbmdpbjtcclxuIiwidmFyIENvb3JNYXAgPSByZXF1aXJlKFwiLi9Db29yTWFwLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gTWFwRW5naW4oY29uZmlnKXtcclxuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuXHR0aGlzLmVuZ2luID0gbnVsbDtcclxuXHR0aGlzLm1hcHMgPSByZXF1aXJlKFwiLi9tYXBzLmpzXCIpO1xyXG5cdHRoaXMubWFwTWFwcGluZyA9IHRoaXMubWFwcy5tYXBNYXBwaW5nO1xyXG59XHJcblxyXG5NYXBFbmdpbi5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IE1hcEVuZ2luLFxyXG5cclxuXHRpbml0OiBmdW5jdGlvbihlbmdpbil7XHJcblxyXG5cdFx0dGhpcy5lbmdpbiA9IGVuZ2luO1xyXG5cclxuXHRcdC8vIHByZS1sb2FkIGFsbCBpbWFnZXNcclxuXHRcdHZhciBtYXBNYXBwaW5nID0gdGhpcy5tYXBzLm1hcE1hcHBpbmc7XHJcblx0XHR2YXIgJGxvYWREaXYgPSAkKFwiPGRpdiBjbGFzcz0nZGlzcGxheV9ub25lJz48L2Rpdj5cIik7XHJcblx0XHQkbG9hZERpdi5hcHBlbmRUbygkKGRvY3VtZW50LmJvZHkpKTtcclxuXHRcdGZvcih2YXIga2V5IGluIG1hcE1hcHBpbmcpe1xyXG5cdFx0XHR2YXIgaW1hZ2VQYXRoID0gXCJpbWFnZXMvXCIgKyBtYXBNYXBwaW5nW2tleV0ubmFtZTtcclxuXHRcdFx0JCgnPGltZy8+JykuYXR0cihcInNyY1wiLCBpbWFnZVBhdGgpLmFwcGVuZFRvKCRsb2FkRGl2KTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmxvYWRNYXAoXCIwMVwiKTtcclxuXHR9LFxyXG5cclxuXHRsb2FkTWFwOiBmdW5jdGlvbihtYXBLZXkpIHtcclxuXHRcdCQoXCIubWFpbiAubWFwTGF5ZXJcIikucmVtb3ZlKCk7XHJcblx0XHR2YXIgJG1hcExheWVyID0gJChcIjxkaXYgY2xhc3M9J21hcExheWVyJz48L2Rpdj5cIik7XHJcblx0XHQkbWFwTGF5ZXIuYXBwZW5kVG8oJChcIi5tYWluXCIpKTtcclxuXHJcblx0XHQvLyBzZXQgbWFwIHRvdGFsIGhlaWdodCBhbmQgd2lkdGhcclxuXHRcdHZhciBtYXBEYXRhID0gdGhpcy5tYXBzW21hcEtleV07XHJcblx0XHR2YXIgY2VsbFNpemUgPSB0aGlzLmNvbmZpZy5jZWxsU2l6ZTtcclxuXHRcdHZhciBoTGVuID0gbWFwRGF0YS5sZW5ndGg7XHJcblx0XHR2YXIgd0xlbiA9IG1hcERhdGFbMF0ubGVuZ3RoO1xyXG5cdFx0dmFyIHdpZHRoID0gd0xlbiAqIGNlbGxTaXplO1xyXG5cdFx0dmFyIGhlaWdodCA9IGhMZW4gKiBjZWxsU2l6ZTtcclxuXHRcdCRtYXBMYXllci5jc3Moe1xyXG5cdFx0XHR3aWR0aDogd2lkdGggKyBcInB4XCIsXHJcblx0XHRcdGhlaWdodDogaGVpZ2h0ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyDmoLnmja7lnLDlm77lgZrmlbDmja7miJBkYXRhU291cmNl77yM5bm26K6+5a6a5YiwZW5naW7lr7nosaHkuK1cclxuXHRcdC8vIOagueaNruWcsOWbvuaVsOaNrueUu+WHuuWcsOWbvlxyXG5cdFx0dmFyIHZhbHVlID0gbnVsbDtcclxuXHRcdHZhciByb3cgPSBudWxsO1xyXG5cdFx0dmFyIHgseTtcclxuXHRcdHZhciBkYXRhU291cmNlID0gbmV3IENvb3JNYXAoKTtcclxuXHRcdGZvcih2YXIgaj0wO2o8bWFwRGF0YS5sZW5ndGg7aisrKXtcclxuXHRcdFx0cm93ID0gbWFwRGF0YVtqXTtcclxuXHRcdFx0Zm9yKHZhciBpPTA7aTxyb3cubGVuZ3RoO2krKyl7XHJcblx0XHRcdFx0dmFsdWUgPSB0aGlzLm1hcE1hcHBpbmdbcm93W2ldXS5uYW1lO1xyXG5cdFx0XHRcdHggPSBpICogY2VsbFNpemU7XHJcblx0XHRcdFx0eSA9IGogKiBjZWxsU2l6ZTtcclxuXHJcblx0XHRcdFx0Ly8gZGF0YXNvdXJjZVxyXG5cdFx0XHRcdGRhdGFTb3VyY2Uuc2V0KHgseSwge2JnOiByb3dbaV19KTtcclxuXHJcblx0XHRcdFx0Ly8gaW1hZ2VzXHJcblx0XHRcdFx0Ly8gdmFyICRpbWcgPSAkKCc8aW1nIGFsdD1cIlwiIC8+JykuYXR0cihcInNyY1wiLCBcImltYWdlcy9cIiArIHZhbHVlKTtcclxuXHRcdFx0XHR2YXIgJGltZyA9ICQoJzxkaXY+PC9kaXY+JykudGV4dCh2YWx1ZS5zdWJzdHJpbmcoMCwyKSk7XHJcblx0XHRcdFx0JGltZy5jc3Moe1xyXG5cdFx0XHRcdFx0d2lkdGg6IGNlbGxTaXplICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0aGVpZ2h0OiBjZWxsU2l6ZSArIFwicHhcIixcclxuXHRcdFx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcblx0XHRcdFx0XHRsZWZ0OiB4ICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0dG9wOiB5ICsgXCJweFwiXHJcblx0XHRcdFx0fSkuYXBwZW5kVG8oJG1hcExheWVyKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dGhpcy5lbmdpbi5zZXREYXRhU291cmNlKGRhdGFTb3VyY2UpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNYXBFbmdpbjtcclxuIiwidmFyIGNoYXJhY3RlcnMgPSB7fVxyXG5cclxuY2hhcmFjdGVyc1tcImdpcmxcIl0gPSB7XHJcblx0aW1nTmFtZTogXCJjX2dpcmwucG5nXCIsXHJcblx0c2l6ZTogNDVcclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2hhcmFjdGVyczsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRjZWxsU2l6ZTogNDVcclxufSIsInZhciBjb25maWcgPSByZXF1aXJlKFwiLi9jb25maWcuanNcIik7XHJcbnZhciBFbmdpbiA9IHJlcXVpcmUoXCIuL0VuZ2luLmpzXCIpO1xyXG5cclxudmFyIGVuZ2luID0gbmV3IEVuZ2luKGNvbmZpZyk7XHJcblxyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cdGVuZ2luLmluaXQoKTtcclxufSkiLCJ2YXIgbWFwcyA9IHt9XHJcblxyXG5tYXBzW1wibWFwTWFwcGluZ1wiXSA9IHtcclxuXHRcInRyXCI6IHtcclxuXHRcdG5hbWU6IFwidHJlZS5wbmdcIixcclxuXHRcdGNhbldhbGs6IGZhbHNlXHJcblx0fSxcclxuXHRcInNlXCI6IHtcclxuXHRcdG5hbWU6IFwic2VhLnBuZ1wiLFxyXG5cdFx0Y2FuV2FsazogZmFsc2VcclxuXHR9LFxyXG5cdFwiYmVcIjoge1xyXG5cdFx0bmFtZTogXCJiZWFjaC5wbmdcIixcclxuXHRcdGNhbldhbGs6IHRydWVcclxuXHR9LFxyXG5cdFwibGFcIjoge1xyXG5cdFx0bmFtZTogXCJsYW5kLnBuZ1wiLFxyXG5cdFx0Y2FuV2FsazogdHJ1ZVxyXG5cdH0sXHJcblx0XCJiclwiOiB7XHJcblx0XHRuYW1lOiBcImJyaWRnZS5wbmdcIixcclxuXHRcdGNhbldhbGs6IHRydWVcclxuXHR9XHJcbn1cclxuXHJcbm1hcHNbXCIwMVwiXSA9XHJcblwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLHNlLGJyLHNlLGJlLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixiZSxiZSxicixiZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGxhLGxhLGxhLGxhLGxhLHRyLHRyLHRyX1wiICtcclxuXCJsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYV9cIiArXHJcblwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGxhLGxhLGxhLGxhLGxhLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixiZSxiZSxicixiZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLHNlLGJyLHNlLGJlLHRyLHRyLHRyXCI7XHJcblxyXG5cclxuLy8g5Zyw5Zu+5pWw5o2u5Liy6L2s5LqM57u05pWw57uEXHJcbmZ1bmN0aW9uIHRvQXJyYXkoc3RyKXtcclxuXHR2YXIgcmV0dXJuQXJyYXkgPSBbXTtcclxuXHR2YXIgbGluZUFyciA9IHN0ci5zcGxpdChcIl9cIik7XHJcblx0bGluZUFyci5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpe1xyXG5cdFx0cmV0dXJuQXJyYXkucHVzaChsaW5lLnNwbGl0KFwiLFwiKSk7XHJcblx0fSk7XHJcblx0cmV0dXJuIHJldHVybkFycmF5O1xyXG59XHJcblxyXG5cclxuZm9yKHZhciBrZXkgaW4gbWFwcyl7XHJcblx0aWYoL1xcZFxcZC8udGVzdChrZXkpKXtcclxuXHRcdG1hcHNba2V5XSA9IHRvQXJyYXkobWFwc1trZXldKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbWFwcyJdfQ==
