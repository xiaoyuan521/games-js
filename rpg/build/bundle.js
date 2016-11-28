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
			"background-position-y": positions.y + "px"
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
		if(this.walkFlg == 1){
			// 已经走了一步，继续走
			canWalkFlg = true;
		} else if(this.walkFlg == 0){
			// 走完了一个格子（2步），判断下一个位置是否能走
			nextMapXy = this._getNextMapXy(this.nextDirection);
			canWalkFlg = this._canWalk(nextMapXy);
			if(canWalkFlg === true){
				this.x = nextMapXy.x;
				this.y = nextMapXy.y;
				this._moveCharacter(this.x, this.y);
			}
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
			"background-position-y": nextPositions.y + "px",
			"transition": "top .4s linear,left .4s linear"
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL1VzZXJzL3poYW9faG9uZ3NoZW5nL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJycGcvZnJvbnRlbmQvQ2hhcmFjdGVyRW5naW4uanMiLCJycGcvZnJvbnRlbmQvQ29vck1hcC5qcyIsInJwZy9mcm9udGVuZC9Fbmdpbi5qcyIsInJwZy9mcm9udGVuZC9NYXBFbmdpbi5qcyIsInJwZy9mcm9udGVuZC9jaGFyYWN0ZXJzLmpzIiwicnBnL2Zyb250ZW5kL2NvbmZpZy5qcyIsInJwZy9mcm9udGVuZC9pbmRleC5qcyIsInJwZy9mcm9udGVuZC9tYXBzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY2hhcmFjdGVycyA9IHJlcXVpcmUoXCIuL2NoYXJhY3RlcnMuanNcIik7XHJcbnZhciBtYXBzID0gcmVxdWlyZShcIi4vbWFwc1wiKTtcclxuXHJcbmZ1bmN0aW9uIENoYXJhY3RlckVuZ2luKGNvbmZpZykge1xyXG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdHRoaXMuZW5naW4gPSBudWxsO1xyXG5cdHRoaXMuZGF0YVNvdXJjZSA9IG51bGw7XHJcblx0dGhpcy5jaGFyYWN0ZXJEYXRhID0gbnVsbDtcclxuXHJcblx0dGhpcy5jdXJyZW50RGlyZWN0aW9uID0gXCJyaWdodFwiO1xyXG5cdHRoaXMubmV4dERpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdC8vIOS6uueJqeWKqOS9nOeahGNzc+WBj+enu+eUqCB4ID0gMDsgeSA9IDFcclxuXHR0aGlzLmN1cnJlbnRNb3ZlID0gXCIwMVwiOyBcclxuXHJcblx0Ly8g6K6h5q2l5Zmo77yMMuS4queKtuaAgSAw77yMMVxyXG5cdHRoaXMud2Fsa0ZsZyA9IDA7XHJcblxyXG5cdC8vIOS6uueJqeWcqOWcsOWbvuS4reeahOS9jee9rlxyXG5cdHRoaXMueCA9IDA7XHJcblx0dGhpcy55ID0gMDtcclxuXHJcblxyXG59XHJcblxyXG5DaGFyYWN0ZXJFbmdpbi5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IENoYXJhY3RlckVuZ2luLFxyXG5cclxuXHRpbml0OiBmdW5jdGlvbihlbmdpbil7XHJcblx0XHR0aGlzLmVuZ2luID0gZW5naW47XHJcblx0XHR0aGlzLmRhdGFTb3VyY2UgPSBlbmdpbi5nZXREYXRhU291cmNlKCk7XHJcblxyXG5cdFx0dGhpcy5iaW5kRXZlbnQoKTtcclxuXHJcblx0XHR2YXIgeCA9IDMgKiB0aGlzLmNvbmZpZy5jZWxsU2l6ZTtcclxuXHRcdHZhciB5ID0gMyAqIHRoaXMuY29uZmlnLmNlbGxTaXplO1xyXG5cdFx0dGhpcy5sb2FkQ2hhcmFjdGVyKFwiZ2lybFwiLCB4LCB5KTtcclxuXHJcblx0XHR0aGlzLnN0YXJ0VGltZXIoKTtcclxuXHJcblx0fSxcclxuXHJcblx0Ly8g5a6a5pe25qOA5rWL5Lq654mp6LWw5YqoXHJcblx0c3RhcnRUaW1lcjogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBfdGhpcyA9IHRoaXM7XHJcblx0XHRzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xyXG5cdFx0XHRfdGhpcy53YWxrKCk7XHJcblx0XHR9LCAyMDApO1xyXG5cdH0sXHJcblxyXG5cdC8vIOS6uueJqei1sOWKqOeahOmUruebmOS6i+S7tlxyXG5cdGJpbmRFdmVudDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBfdGhpcyA9IHRoaXM7XHJcblx0XHQkKGRvY3VtZW50LmJvZHkpLm9uKFwia2V5ZG93bi5jaGFyYWN0ZXIud2Fsa1wiLCBmdW5jdGlvbihlKXtcclxuXHRcdFx0c3dpdGNoKGUua2V5Q29kZSl7XHJcblx0XHRcdFx0Y2FzZSAzNzpcclxuXHRcdFx0XHRcdF90aGlzLm5leHREaXJlY3Rpb24gPSBcImxlZnRcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMzg6XHJcblx0XHRcdFx0XHRfdGhpcy5uZXh0RGlyZWN0aW9uID0gXCJ1cFwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzOTpcclxuXHRcdFx0XHRcdF90aGlzLm5leHREaXJlY3Rpb24gPSBcInJpZ2h0XCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDQwOlxyXG5cdFx0XHRcdFx0X3RoaXMubmV4dERpcmVjdGlvbiA9IFwiZG93blwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdC8vIOWKoOi9veS6uueJqeWbvueJh++8jOWIneWni+WMluWnv+WKv1xyXG5cdGxvYWRDaGFyYWN0ZXI6IGZ1bmN0aW9uKG5hbWUsIHgsIHkpe1xyXG5cclxuXHRcdHRoaXMueCA9IHg7XHJcblx0XHR0aGlzLnkgPSB5O1xyXG5cclxuXHRcdHZhciBjaGFyYWN0ZXJEYXRhID0gdGhpcy5jaGFyYWN0ZXJEYXRhID0gY2hhcmFjdGVyc1tuYW1lXTtcclxuXHRcdHZhciBjaGFyYWN0ZXJTaXplID0gY2hhcmFjdGVyRGF0YS5zaXplO1xyXG5cdFx0dmFyIGltZ1BhdGggPSBcImltYWdlcy9cIiArIGNoYXJhY3RlckRhdGEuaW1nTmFtZTtcclxuXHJcblx0XHR2YXIgJGNoYXJhY3RlckRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjdXJyZW50Q2hhcmFjdGVyXCI+PC9kaXY+Jyk7XHJcblx0XHQkY2hhcmFjdGVyRG9tLmFwcGVuZFRvKCQoXCIubWFpblwiKSk7XHJcblxyXG5cdFx0dmFyIHBvc2l0aW9ucyA9IHRoaXMuX2dldFBvc2l0aW9uWFkoY2hhcmFjdGVyU2l6ZSwgdGhpcy5jdXJyZW50TW92ZSk7XHJcblx0XHQkY2hhcmFjdGVyRG9tLmNzcyh7XHJcblx0XHRcdFwid2lkdGhcIjogY2hhcmFjdGVyU2l6ZSArIFwicHhcIixcclxuXHRcdFx0XCJoZWlnaHRcIjogY2hhcmFjdGVyU2l6ZSArIFwicHhcIixcclxuXHRcdFx0XCJiYWNrZ3JvdW5kLWltYWdlXCI6IFwidXJsKCdcIiArIGltZ1BhdGggKyBcIicpXCIsXHJcblx0XHRcdFwiYmFja2dyb3VuZC1wb3NpdGlvbi14XCI6IHBvc2l0aW9ucy54ICsgXCJweFwiLFxyXG5cdFx0XHRcImJhY2tncm91bmQtcG9zaXRpb24teVwiOiBwb3NpdGlvbnMueSArIFwicHhcIlxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8g5bCG5Lq654mp5pS+5Yiw5Zyw5Zu+5LitXHJcblx0XHQkY2hhcmFjdGVyRG9tLmNzcyh7XHJcblx0XHRcdFwicG9zaXRpb25cIjogXCJhYnNvbHV0ZVwiLFxyXG5cdFx0XHRcImxlZnRcIjogeCArIFwicHhcIixcclxuXHRcdFx0XCJ0b3BcIjogeSArIFwicHhcIlxyXG5cdFx0fSk7XHJcblxyXG5cdH0sXHJcblxyXG5cdC8vIOS6uueJqeenu+WKqFxyXG5cdHdhbGs6IGZ1bmN0aW9uKCl7XHJcblxyXG5cdFx0dmFyICRjaGFyYWN0ZXJEb20gPSAkKFwiLmN1cnJlbnRDaGFyYWN0ZXJcIik7XHJcblx0XHRpZigkY2hhcmFjdGVyRG9tLmxlbmd0aCA9PSAwKSB7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGlmKHRoaXMubmV4dERpcmVjdGlvbiA9PSBudWxsKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHZhciBjYW5XYWxrRmxnID0gdHJ1ZTtcclxuXHRcdHZhciBuZXh0TWFwWHkgPSBudWxsO1xyXG5cdFx0aWYodGhpcy53YWxrRmxnID09IDEpe1xyXG5cdFx0XHQvLyDlt7Lnu4/otbDkuobkuIDmraXvvIznu6fnu63otbBcclxuXHRcdFx0Y2FuV2Fsa0ZsZyA9IHRydWU7XHJcblx0XHR9IGVsc2UgaWYodGhpcy53YWxrRmxnID09IDApe1xyXG5cdFx0XHQvLyDotbDlrozkuobkuIDkuKrmoLzlrZDvvIgy5q2l77yJ77yM5Yik5pat5LiL5LiA5Liq5L2N572u5piv5ZCm6IO96LWwXHJcblx0XHRcdG5leHRNYXBYeSA9IHRoaXMuX2dldE5leHRNYXBYeSh0aGlzLm5leHREaXJlY3Rpb24pO1xyXG5cdFx0XHRjYW5XYWxrRmxnID0gdGhpcy5fY2FuV2FsayhuZXh0TWFwWHkpO1xyXG5cdFx0XHRpZihjYW5XYWxrRmxnID09PSB0cnVlKXtcclxuXHRcdFx0XHR0aGlzLnggPSBuZXh0TWFwWHkueDtcclxuXHRcdFx0XHR0aGlzLnkgPSBuZXh0TWFwWHkueTtcclxuXHRcdFx0XHR0aGlzLl9tb3ZlQ2hhcmFjdGVyKHRoaXMueCwgdGhpcy55KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGNhbldhbGtGbGcgPT09IHRydWUpe1xyXG5cdFx0XHR0aGlzLl93YWxrKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8g5q+P6LWwMuatpe+8jOiuoeatpeWZqOW9kjBcclxuXHRcdGlmKHRoaXMud2Fsa0ZsZyA9PSAyKXtcclxuXHRcdFx0dGhpcy53YWxrRmxnID0gMDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyDotbDlrozlkI7vvIzlsIZuZXh0RGlyZWN0aW9u6K6+5a6a5Li6bnVsbO+8jOWBnOatouihjOi1sFxyXG5cdFx0aWYodGhpcy53YWxrRmxnID09IDApe1xyXG5cdFx0XHR0aGlzLm5leHREaXJlY3Rpb24gPSBudWxsO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdC8vIOS6uueJqeenu+WKqFxyXG5cdF93YWxrOiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHR0aGlzLndhbGtGbGcrKztcclxuXHJcblx0XHR2YXIgbmV4dE1vdmUgPSB0aGlzLl9nZXROZXh0TW92ZSgpO1xyXG5cdFx0dmFyIG5leHRQb3NpdGlvbnMgPSB0aGlzLl9nZXRQb3NpdGlvblhZKHRoaXMuY2hhcmFjdGVyRGF0YS5zaXplLCBuZXh0TW92ZSk7XHJcblxyXG5cdFx0dmFyICRjaGFyYWN0ZXJEb20gPSAkKFwiLmN1cnJlbnRDaGFyYWN0ZXJcIik7XHJcblx0XHQkY2hhcmFjdGVyRG9tLmNzcyh7XHJcblx0XHRcdFwiYmFja2dyb3VuZC1wb3NpdGlvbi14XCI6IG5leHRQb3NpdGlvbnMueCArIFwicHhcIixcclxuXHRcdFx0XCJiYWNrZ3JvdW5kLXBvc2l0aW9uLXlcIjogbmV4dFBvc2l0aW9ucy55ICsgXCJweFwiLFxyXG5cdFx0XHRcInRyYW5zaXRpb25cIjogXCJ0b3AgLjRzIGxpbmVhcixsZWZ0IC40cyBsaW5lYXJcIlxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMuY3VycmVudE1vdmUgPSBuZXh0TW92ZTtcclxuXHRcdHRoaXMuY3VycmVudERpcmVjdGlvbiA9IHRoaXMubmV4dERpcmVjdGlvbjtcclxuXHJcblx0fSxcclxuXHJcblx0X21vdmVDaGFyYWN0ZXI6IGZ1bmN0aW9uKHgsIHkpe1xyXG5cdFx0dmFyICRjaGFyYWN0ZXJEb20gPSAkKFwiLmN1cnJlbnRDaGFyYWN0ZXJcIik7XHJcblx0XHQkY2hhcmFjdGVyRG9tLmNzcyh7XHJcblx0XHRcdFwibGVmdFwiOiB4ICsgXCJweFwiLFxyXG5cdFx0XHRcInRvcFwiOiB5ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHR9LFxyXG5cclxuXHQvLyDlnLDlm77kuK3vvIzkuIvkuIDkuKrngrnmmK/lkKbkuLrlj6/ku6Xnp7vliqjngrlcclxuXHRfY2FuV2FsazogZnVuY3Rpb24obmV4dE1hcFh5KXtcclxuXHJcblx0XHRpZih0aGlzLm5leHREaXJlY3Rpb24gPT0gbnVsbCl7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyDotoXlh7rlnLDlm75cclxuXHRcdGlmKG5leHRNYXBYeS54IDwgMCB8fCBuZXh0TWFwWHkueSA8IDApe1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8g5LiN6IO96KGM6LWw55qE5Zyw5Zu+XHJcblx0XHR2YXIgbWFwQ2VsbE5hbWUgPSB0aGlzLmRhdGFTb3VyY2UuZ2V0KG5leHRNYXBYeS54LCBuZXh0TWFwWHkueSkuYmc7XHJcblx0XHRpZihtYXBzW1wibWFwTWFwcGluZ1wiXVttYXBDZWxsTmFtZV1bXCJjYW5XYWxrXCJdID09PSBmYWxzZSl7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9LFxyXG5cclxuXHQvLyDmoLnmja7ooYzotbDmlrnlkJHlj5blvpfvvIzkuIvkuIDkuKrlnLDlm77nmoR477yMeeWdkOagh1xyXG5cdF9nZXROZXh0TWFwWHk6IGZ1bmN0aW9uKGRpcmVjdGlvbil7XHJcblx0XHR2YXIgY2VsbFNpemUgPSB0aGlzLmNvbmZpZy5jZWxsU2l6ZTtcclxuXHRcdHZhciB4ID0gMDtcclxuXHRcdHZhciB5ID0gMDtcclxuXHRcdHN3aXRjaChkaXJlY3Rpb24pe1xyXG5cdFx0XHRjYXNlIFwibGVmdFwiOlxyXG5cdFx0XHRcdHggPSB0aGlzLnggLSBjZWxsU2l6ZTtcclxuXHRcdFx0XHR5ID0gdGhpcy55O1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwicmlnaHRcIjpcclxuXHRcdFx0XHR4ID0gdGhpcy54ICsgY2VsbFNpemU7XHJcblx0XHRcdFx0eSA9IHRoaXMueTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcInVwXCI6XHJcblx0XHRcdFx0eCA9IHRoaXMueDtcclxuXHRcdFx0XHR5ID0gdGhpcy55IC0gY2VsbFNpemU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJkb3duXCI6XHJcblx0XHRcdFx0eCA9IHRoaXMueDtcclxuXHRcdFx0XHR5ID0gdGhpcy55ICsgY2VsbFNpemU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR4OngsXHJcblx0XHRcdHk6eVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdC8vIOiuoeeul+S6uueJqeeahGNzc+WBj+enu+mHj1xyXG5cdF9nZXRQb3NpdGlvblhZOiBmdW5jdGlvbihzaXplLCBtb3ZlUG9zaXRpb24pe1xyXG5cdFx0dmFyIHggPSBzaXplICogcGFyc2VJbnQobW92ZVBvc2l0aW9uWzBdLCAxMCkgKiAtMTtcclxuXHRcdHZhciB5ID0gc2l6ZSAqIHBhcnNlSW50KG1vdmVQb3NpdGlvblsxXSwgMTApICogLTE7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Ly8g5Y+W5b6X5LiL5LiA5qyh56e75Yqo55qE5L2N572uIFxyXG5cdC8vIFwiMDNcIiwgXCIzM1wiIC4uLlxyXG5cdF9nZXROZXh0TW92ZTogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjdXJyZW50TW92ZSA9IHRoaXMuY3VycmVudE1vdmU7XHJcblx0XHR2YXIgY3VycmVudERpcmVjdGlvbiA9IHRoaXMuY3VycmVudERpcmVjdGlvbjtcclxuXHRcdHZhciBuZXh0RGlyZWN0aW9uID0gdGhpcy5uZXh0RGlyZWN0aW9uO1xyXG5cdFx0dmFyIHJldHVybk1vdmUgPSBudWxsO1xyXG5cclxuXHRcdGlmKGN1cnJlbnREaXJlY3Rpb24gPT0gbmV4dERpcmVjdGlvbil7XHJcblx0XHRcdC8vIOWQkeWQjOS4gOS4quaWueWQkeihjOi1sFxyXG5cclxuXHRcdFx0dmFyIG1vdmVJbnQgPSBwYXJzZUludChjdXJyZW50TW92ZVswXSwgMTApO1xyXG5cdFx0XHRtb3ZlSW50Kys7XHJcblx0XHRcdGlmKG1vdmVJbnQgPiAzKXtcclxuXHRcdFx0XHRtb3ZlSW50ID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm5Nb3ZlID0gbW92ZUludCArIGN1cnJlbnRNb3ZlWzFdO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8g5pS55Y+Y6KGM6LWw5pa55ZCRXHJcblxyXG5cdFx0XHR0aGlzLndhbGtGbGc9MDtcclxuXHRcdFx0c3dpdGNoKG5leHREaXJlY3Rpb24pe1xyXG5cdFx0XHRcdGNhc2UgXCJsZWZ0XCI6XHJcblx0XHRcdFx0XHRyZXR1cm5Nb3ZlID0gXCIwM1wiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcInJpZ2h0XCI6XHJcblx0XHRcdFx0XHRyZXR1cm5Nb3ZlID0gXCIwMVwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcInVwXCI6XHJcblx0XHRcdFx0XHRyZXR1cm5Nb3ZlID0gXCIwMlwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcImRvd25cIjpcclxuXHRcdFx0XHRcdHJldHVybk1vdmUgPSBcIjAwXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJldHVybk1vdmU7XHJcblx0XHRcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhcmFjdGVyRW5naW4iLCJ2YXIgQ29vck1hcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5tYXAgPSBuZXcgTWFwKCk7XHJcbn1cclxuQ29vck1hcC5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IENvb3JNYXAsXHJcblx0Z2V0OiBmdW5jdGlvbih4LCB5KXtcclxuXHRcdHZhciBrID0gbnVsbDtcclxuXHRcdGZvcihrZXkgb2YgdGhpcy5tYXAua2V5cygpKXtcclxuXHRcdFx0aWYoa2V5LnggPT0geCAmJiBrZXkueSA9PSB5KXtcclxuXHRcdFx0XHRrID0ga2V5O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMubWFwLmdldChrKTtcclxuXHR9LFxyXG5cdHNldDogZnVuY3Rpb24oeCx5LCB2YWx1ZSl7XHJcblx0XHR2YXIgayA9IG51bGw7XHJcblx0XHRmb3Ioa2V5IG9mIHRoaXMubWFwLmtleXMoKSl7XHJcblx0XHRcdGlmKGtleS54ID09IHggJiYga2V5LnkgPT0geSl7XHJcblx0XHRcdFx0ayA9IGtleTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYoaykge1xyXG5cdFx0XHR0aGlzLm1hcC5zZXQoaywgdmFsdWUpO1xyXG5cdFx0fWVsc2Uge1xyXG5cdFx0XHR0aGlzLm1hcC5zZXQoe1wieFwiOnggLCBcInlcIjp5fSwgdmFsdWUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0Z2V0TWFwOiBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB0aGlzLm1hcDtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29vck1hcDsiLCJ2YXIgTWFwRW5naW4gPSByZXF1aXJlKFwiLi9NYXBFbmdpblwiKTtcclxudmFyIENoYXJhY3RlckVuZ2luID0gcmVxdWlyZShcIi4vQ2hhcmFjdGVyRW5naW4uanNcIik7XHJcblxyXG5mdW5jdGlvbiBFbmdpbihjb25maWcpIHtcclxuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuXHR0aGlzLmRhdGFTb3VyY2UgPSBudWxsO1xyXG5cdHRoaXMubWFwRW5naW4gPSBuZXcgTWFwRW5naW4oY29uZmlnKTtcclxuXHR0aGlzLmNoYXJhY3RlckVuZ2luID0gbmV3IENoYXJhY3RlckVuZ2luKGNvbmZpZyk7XHJcbn1cclxuXHJcbkVuZ2luLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogRW5naW4sXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5tYXBFbmdpbi5pbml0KHRoaXMpO1xyXG5cdFx0dGhpcy5jaGFyYWN0ZXJFbmdpbi5pbml0KHRoaXMpO1xyXG5cdH0sXHJcblxyXG5cdHN0YXJ0OiBmdW5jdGlvbigpIHtcclxuXHJcblx0fSxcclxuXHJcblx0c2V0RGF0YVNvdXJjZTogZnVuY3Rpb24oZGF0YVNvdXJjZSkge1xyXG5cdFx0dGhpcy5kYXRhU291cmNlID0gZGF0YVNvdXJjZTtcclxuXHR9LFxyXG5cclxuXHRnZXREYXRhU291cmNlOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHRoaXMuZGF0YVNvdXJjZTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzPUVuZ2luO1xyXG4iLCJ2YXIgQ29vck1hcCA9IHJlcXVpcmUoXCIuL0Nvb3JNYXAuanNcIik7XHJcblxyXG5mdW5jdGlvbiBNYXBFbmdpbihjb25maWcpe1xyXG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdHRoaXMuZW5naW4gPSBudWxsO1xyXG5cdHRoaXMubWFwcyA9IHJlcXVpcmUoXCIuL21hcHMuanNcIik7XHJcblx0dGhpcy5tYXBNYXBwaW5nID0gdGhpcy5tYXBzLm1hcE1hcHBpbmc7XHJcbn1cclxuXHJcbk1hcEVuZ2luLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogTWFwRW5naW4sXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKGVuZ2luKXtcclxuXHJcblx0XHR0aGlzLmVuZ2luID0gZW5naW47XHJcblxyXG5cdFx0Ly8gcHJlLWxvYWQgYWxsIGltYWdlc1xyXG5cdFx0dmFyIG1hcE1hcHBpbmcgPSB0aGlzLm1hcHMubWFwTWFwcGluZztcclxuXHRcdHZhciAkbG9hZERpdiA9ICQoXCI8ZGl2IGNsYXNzPSdkaXNwbGF5X25vbmUnPjwvZGl2PlwiKTtcclxuXHRcdCRsb2FkRGl2LmFwcGVuZFRvKCQoZG9jdW1lbnQuYm9keSkpO1xyXG5cdFx0Zm9yKHZhciBrZXkgaW4gbWFwTWFwcGluZyl7XHJcblx0XHRcdHZhciBpbWFnZVBhdGggPSBcImltYWdlcy9cIiArIG1hcE1hcHBpbmdba2V5XS5uYW1lO1xyXG5cdFx0XHQkKCc8aW1nLz4nKS5hdHRyKFwic3JjXCIsIGltYWdlUGF0aCkuYXBwZW5kVG8oJGxvYWREaXYpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMubG9hZE1hcChcIjAxXCIpO1xyXG5cdH0sXHJcblxyXG5cdGxvYWRNYXA6IGZ1bmN0aW9uKG1hcEtleSkge1xyXG5cdFx0JChcIi5tYWluIC5tYXBMYXllclwiKS5yZW1vdmUoKTtcclxuXHRcdHZhciAkbWFwTGF5ZXIgPSAkKFwiPGRpdiBjbGFzcz0nbWFwTGF5ZXInPjwvZGl2PlwiKTtcclxuXHRcdCRtYXBMYXllci5hcHBlbmRUbygkKFwiLm1haW5cIikpO1xyXG5cclxuXHRcdC8vIHNldCBtYXAgdG90YWwgaGVpZ2h0IGFuZCB3aWR0aFxyXG5cdFx0dmFyIG1hcERhdGEgPSB0aGlzLm1hcHNbbWFwS2V5XTtcclxuXHRcdHZhciBjZWxsU2l6ZSA9IHRoaXMuY29uZmlnLmNlbGxTaXplO1xyXG5cdFx0dmFyIGhMZW4gPSBtYXBEYXRhLmxlbmd0aDtcclxuXHRcdHZhciB3TGVuID0gbWFwRGF0YVswXS5sZW5ndGg7XHJcblx0XHR2YXIgd2lkdGggPSB3TGVuICogY2VsbFNpemU7XHJcblx0XHR2YXIgaGVpZ2h0ID0gaExlbiAqIGNlbGxTaXplO1xyXG5cdFx0JG1hcExheWVyLmNzcyh7XHJcblx0XHRcdHdpZHRoOiB3aWR0aCArIFwicHhcIixcclxuXHRcdFx0aGVpZ2h0OiBoZWlnaHQgKyBcInB4XCJcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIOagueaNruWcsOWbvuWBmuaVsOaNruaIkGRhdGFTb3VyY2XvvIzlubborr7lrprliLBlbmdpbuWvueixoeS4rVxyXG5cdFx0Ly8g5qC55o2u5Zyw5Zu+5pWw5o2u55S75Ye65Zyw5Zu+XHJcblx0XHR2YXIgdmFsdWUgPSBudWxsO1xyXG5cdFx0dmFyIHJvdyA9IG51bGw7XHJcblx0XHR2YXIgeCx5O1xyXG5cdFx0dmFyIGRhdGFTb3VyY2UgPSBuZXcgQ29vck1hcCgpO1xyXG5cdFx0Zm9yKHZhciBqPTA7ajxtYXBEYXRhLmxlbmd0aDtqKyspe1xyXG5cdFx0XHRyb3cgPSBtYXBEYXRhW2pdO1xyXG5cdFx0XHRmb3IodmFyIGk9MDtpPHJvdy5sZW5ndGg7aSsrKXtcclxuXHRcdFx0XHR2YWx1ZSA9IHRoaXMubWFwTWFwcGluZ1tyb3dbaV1dLm5hbWU7XHJcblx0XHRcdFx0eCA9IGkgKiBjZWxsU2l6ZTtcclxuXHRcdFx0XHR5ID0gaiAqIGNlbGxTaXplO1xyXG5cclxuXHRcdFx0XHQvLyBkYXRhc291cmNlXHJcblx0XHRcdFx0ZGF0YVNvdXJjZS5zZXQoeCx5LCB7Ymc6IHJvd1tpXX0pO1xyXG5cclxuXHRcdFx0XHQvLyBpbWFnZXNcclxuXHRcdFx0XHQvLyB2YXIgJGltZyA9ICQoJzxpbWcgYWx0PVwiXCIgLz4nKS5hdHRyKFwic3JjXCIsIFwiaW1hZ2VzL1wiICsgdmFsdWUpO1xyXG5cdFx0XHRcdHZhciAkaW1nID0gJCgnPGRpdj48L2Rpdj4nKS50ZXh0KHZhbHVlLnN1YnN0cmluZygwLDIpKTtcclxuXHRcdFx0XHQkaW1nLmNzcyh7XHJcblx0XHRcdFx0XHR3aWR0aDogY2VsbFNpemUgKyBcInB4XCIsXHJcblx0XHRcdFx0XHRoZWlnaHQ6IGNlbGxTaXplICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuXHRcdFx0XHRcdGxlZnQ6IHggKyBcInB4XCIsXHJcblx0XHRcdFx0XHR0b3A6IHkgKyBcInB4XCJcclxuXHRcdFx0XHR9KS5hcHBlbmRUbygkbWFwTGF5ZXIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR0aGlzLmVuZ2luLnNldERhdGFTb3VyY2UoZGF0YVNvdXJjZSk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEVuZ2luO1xyXG4iLCJ2YXIgY2hhcmFjdGVycyA9IHt9XHJcblxyXG5jaGFyYWN0ZXJzW1wiZ2lybFwiXSA9IHtcclxuXHRpbWdOYW1lOiBcImNfZ2lybC5wbmdcIixcclxuXHRzaXplOiA0NVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjaGFyYWN0ZXJzOyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGNlbGxTaXplOiA0NVxyXG59IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoXCIuL2NvbmZpZy5qc1wiKTtcclxudmFyIEVuZ2luID0gcmVxdWlyZShcIi4vRW5naW4uanNcIik7XHJcblxyXG52YXIgZW5naW4gPSBuZXcgRW5naW4oY29uZmlnKTtcclxuXHJcblxyXG4kKGZ1bmN0aW9uKCl7XHJcblx0ZW5naW4uaW5pdCgpO1xyXG59KSIsInZhciBtYXBzID0ge31cclxuXHJcbm1hcHNbXCJtYXBNYXBwaW5nXCJdID0ge1xyXG5cdFwidHJcIjoge1xyXG5cdFx0bmFtZTogXCJ0cmVlLnBuZ1wiLFxyXG5cdFx0Y2FuV2FsazogZmFsc2VcclxuXHR9LFxyXG5cdFwic2VcIjoge1xyXG5cdFx0bmFtZTogXCJzZWEucG5nXCIsXHJcblx0XHRjYW5XYWxrOiBmYWxzZVxyXG5cdH0sXHJcblx0XCJiZVwiOiB7XHJcblx0XHRuYW1lOiBcImJlYWNoLnBuZ1wiLFxyXG5cdFx0Y2FuV2FsazogdHJ1ZVxyXG5cdH0sXHJcblx0XCJsYVwiOiB7XHJcblx0XHRuYW1lOiBcImxhbmQucG5nXCIsXHJcblx0XHRjYW5XYWxrOiB0cnVlXHJcblx0fSxcclxuXHRcImJyXCI6IHtcclxuXHRcdG5hbWU6IFwiYnJpZGdlLnBuZ1wiLFxyXG5cdFx0Y2FuV2FsazogdHJ1ZVxyXG5cdH1cclxufVxyXG5cclxubWFwc1tcIjAxXCJdID1cclxuXCJ0cix0cix0cixiZSxzZSxicixzZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLGJlLGJyLGJlLGJlLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixsYSxsYSxsYSxsYSxsYSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cImxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhX1wiICtcclxuXCJ0cix0cix0cixsYSxsYSxsYSxsYSxsYSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLGJlLGJyLGJlLGJlLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixiZSxzZSxicixzZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJcIjtcclxuXHJcblxyXG4vLyDlnLDlm77mlbDmja7kuLLovazkuoznu7TmlbDnu4RcclxuZnVuY3Rpb24gdG9BcnJheShzdHIpe1xyXG5cdHZhciByZXR1cm5BcnJheSA9IFtdO1xyXG5cdHZhciBsaW5lQXJyID0gc3RyLnNwbGl0KFwiX1wiKTtcclxuXHRsaW5lQXJyLmZvckVhY2goZnVuY3Rpb24obGluZSl7XHJcblx0XHRyZXR1cm5BcnJheS5wdXNoKGxpbmUuc3BsaXQoXCIsXCIpKTtcclxuXHR9KTtcclxuXHRyZXR1cm4gcmV0dXJuQXJyYXk7XHJcbn1cclxuXHJcblxyXG5mb3IodmFyIGtleSBpbiBtYXBzKXtcclxuXHRpZigvXFxkXFxkLy50ZXN0KGtleSkpe1xyXG5cdFx0bWFwc1trZXldID0gdG9BcnJheShtYXBzW2tleV0pO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBtYXBzIl19
