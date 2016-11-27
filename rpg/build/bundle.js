(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var characters = require("./characters.js");

function CharacterEngin() {
	this.currentDirection = "right";
	this.nextDirection = null;

	this.currentMove = "01"; // x = 0; y = 1

	this.walkFlg = 0; // 每次走动2步，移动一个地图格

	this.characterData = null;

}

CharacterEngin.prototype = {
	constructor: CharacterEngin,

	init: function(){
		this.bindEvent();
		this.loadCharacter("girl");
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
	loadCharacter: function(name){
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

	},

	walk: function(){
		this.walkOneStep();

		
		if(this.walkFlg == 2){
			this.walkFlg = 0;
		}

		if(this.walkFlg == 0){
			this.nextDirection = null;
		}
	},

	// 人物移动
	walkOneStep: function() {

		var $characterDom = $(".currentCharacter");
		if($characterDom.length == 0) {
			return;
		}
		if(this.nextDirection == null){
			return;
		}

		this.walkFlg ++;

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
},{"./characters.js":5}],2:[function(require,module,exports){
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

function Engin(config){
	this.config = config;
	this.dataSource = null;
	this.mapEngin = new MapEngin(config);
	this.characterEngin = new CharacterEngin();
}

Engin.prototype = {
	constructor: Engin,

	init: function(){
		this.mapEngin.init(this);
		this.characterEngin.init();
	},

	start: function(){

	},

	setDataSource: function(dataSource){
		this.dataSource = dataSource;
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
			var imagePath = "images/" + mapMapping[key];
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

		// init dataSource and dom
		var value = null;
		var row = null;
		var x,y;
		var dataSource = new CoorMap();
		for(var j=0;j<mapData.length;j++){
			row = mapData[j];
			for(var i=0;i<row.length;i++){
				value = this.mapMapping[row[i]];
				x = i * cellSize;
				y = j * cellSize;

				// datasource
				dataSource.set(x,y, {bg: value});

				// images
				var $img = $('<img alt="" />').attr("src", "images/" + value);
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
	size: 120

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
	"tr": "tree.png",
	"se": "sea.png",
	"be": "beach.png",
	"la": "land.png",
	"br": "bridge.png"
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJycGcvZnJvbnRlbmQvQ2hhcmFjdGVyRW5naW4uanMiLCJycGcvZnJvbnRlbmQvQ29vck1hcC5qcyIsInJwZy9mcm9udGVuZC9Fbmdpbi5qcyIsInJwZy9mcm9udGVuZC9NYXBFbmdpbi5qcyIsInJwZy9mcm9udGVuZC9jaGFyYWN0ZXJzLmpzIiwicnBnL2Zyb250ZW5kL2NvbmZpZy5qcyIsInJwZy9mcm9udGVuZC9pbmRleC5qcyIsInJwZy9mcm9udGVuZC9tYXBzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGNoYXJhY3RlcnMgPSByZXF1aXJlKFwiLi9jaGFyYWN0ZXJzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gQ2hhcmFjdGVyRW5naW4oKSB7XHJcblx0dGhpcy5jdXJyZW50RGlyZWN0aW9uID0gXCJyaWdodFwiO1xyXG5cdHRoaXMubmV4dERpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdHRoaXMuY3VycmVudE1vdmUgPSBcIjAxXCI7IC8vIHggPSAwOyB5ID0gMVxyXG5cclxuXHR0aGlzLndhbGtGbGcgPSAwOyAvLyDmr4/mrKHotbDliqgy5q2l77yM56e75Yqo5LiA5Liq5Zyw5Zu+5qC8XHJcblxyXG5cdHRoaXMuY2hhcmFjdGVyRGF0YSA9IG51bGw7XHJcblxyXG59XHJcblxyXG5DaGFyYWN0ZXJFbmdpbi5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IENoYXJhY3RlckVuZ2luLFxyXG5cclxuXHRpbml0OiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5iaW5kRXZlbnQoKTtcclxuXHRcdHRoaXMubG9hZENoYXJhY3RlcihcImdpcmxcIik7XHJcblx0XHR0aGlzLnN0YXJ0VGltZXIoKTtcclxuXHJcblx0fSxcclxuXHJcblx0Ly8g5a6a5pe25qOA5rWL5Lq654mp6LWw5YqoXHJcblx0c3RhcnRUaW1lcjogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBfdGhpcyA9IHRoaXM7XHJcblx0XHRzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xyXG5cdFx0XHRfdGhpcy53YWxrKCk7XHJcblx0XHR9LCAyMDApO1xyXG5cdH0sXHJcblxyXG5cdC8vIOS6uueJqei1sOWKqOeahOmUruebmOS6i+S7tlxyXG5cdGJpbmRFdmVudDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBfdGhpcyA9IHRoaXM7XHJcblx0XHQkKGRvY3VtZW50LmJvZHkpLm9uKFwia2V5ZG93bi5jaGFyYWN0ZXIud2Fsa1wiLCBmdW5jdGlvbihlKXtcclxuXHRcdFx0c3dpdGNoKGUua2V5Q29kZSl7XHJcblx0XHRcdFx0Y2FzZSAzNzpcclxuXHRcdFx0XHRcdF90aGlzLm5leHREaXJlY3Rpb24gPSBcImxlZnRcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMzg6XHJcblx0XHRcdFx0XHRfdGhpcy5uZXh0RGlyZWN0aW9uID0gXCJ1cFwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzOTpcclxuXHRcdFx0XHRcdF90aGlzLm5leHREaXJlY3Rpb24gPSBcInJpZ2h0XCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDQwOlxyXG5cdFx0XHRcdFx0X3RoaXMubmV4dERpcmVjdGlvbiA9IFwiZG93blwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdC8vIOWKoOi9veS6uueJqeWbvueJh++8jOWIneWni+WMluWnv+WKv1xyXG5cdGxvYWRDaGFyYWN0ZXI6IGZ1bmN0aW9uKG5hbWUpe1xyXG5cdFx0dmFyIGNoYXJhY3RlckRhdGEgPSB0aGlzLmNoYXJhY3RlckRhdGEgPSBjaGFyYWN0ZXJzW25hbWVdO1xyXG5cdFx0dmFyIGNoYXJhY3RlclNpemUgPSBjaGFyYWN0ZXJEYXRhLnNpemU7XHJcblx0XHR2YXIgaW1nUGF0aCA9IFwiaW1hZ2VzL1wiICsgY2hhcmFjdGVyRGF0YS5pbWdOYW1lO1xyXG5cclxuXHRcdHZhciAkY2hhcmFjdGVyRG9tID0gJCgnPGRpdiBjbGFzcz1cImN1cnJlbnRDaGFyYWN0ZXJcIj48L2Rpdj4nKTtcclxuXHRcdCRjaGFyYWN0ZXJEb20uYXBwZW5kVG8oJChcIi5tYWluXCIpKTtcclxuXHJcblx0XHR2YXIgcG9zaXRpb25zID0gdGhpcy5fZ2V0UG9zaXRpb25YWShjaGFyYWN0ZXJTaXplLCB0aGlzLmN1cnJlbnRNb3ZlKTtcclxuXHRcdCRjaGFyYWN0ZXJEb20uY3NzKHtcclxuXHRcdFx0XCJ3aWR0aFwiOiBjaGFyYWN0ZXJTaXplICsgXCJweFwiLFxyXG5cdFx0XHRcImhlaWdodFwiOiBjaGFyYWN0ZXJTaXplICsgXCJweFwiLFxyXG5cdFx0XHRcImJhY2tncm91bmQtaW1hZ2VcIjogXCJ1cmwoJ1wiICsgaW1nUGF0aCArIFwiJylcIixcclxuXHRcdFx0XCJiYWNrZ3JvdW5kLXBvc2l0aW9uLXhcIjogcG9zaXRpb25zLnggKyBcInB4XCIsXHJcblx0XHRcdFwiYmFja2dyb3VuZC1wb3NpdGlvbi15XCI6IHBvc2l0aW9ucy55ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHJcblx0fSxcclxuXHJcblx0d2FsazogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMud2Fsa09uZVN0ZXAoKTtcclxuXHJcblx0XHRcclxuXHRcdGlmKHRoaXMud2Fsa0ZsZyA9PSAyKXtcclxuXHRcdFx0dGhpcy53YWxrRmxnID0gMDtcclxuXHRcdH1cclxuXHJcblx0XHRpZih0aGlzLndhbGtGbGcgPT0gMCl7XHJcblx0XHRcdHRoaXMubmV4dERpcmVjdGlvbiA9IG51bGw7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Ly8g5Lq654mp56e75YqoXHJcblx0d2Fsa09uZVN0ZXA6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdHZhciAkY2hhcmFjdGVyRG9tID0gJChcIi5jdXJyZW50Q2hhcmFjdGVyXCIpO1xyXG5cdFx0aWYoJGNoYXJhY3RlckRvbS5sZW5ndGggPT0gMCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRpZih0aGlzLm5leHREaXJlY3Rpb24gPT0gbnVsbCl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLndhbGtGbGcgKys7XHJcblxyXG5cdFx0dmFyIG5leHRNb3ZlID0gdGhpcy5fZ2V0TmV4dE1vdmUoKTtcclxuXHRcdHZhciBuZXh0UG9zaXRpb25zID0gdGhpcy5fZ2V0UG9zaXRpb25YWSh0aGlzLmNoYXJhY3RlckRhdGEuc2l6ZSwgbmV4dE1vdmUpO1xyXG5cclxuXHRcdHZhciAkY2hhcmFjdGVyRG9tID0gJChcIi5jdXJyZW50Q2hhcmFjdGVyXCIpO1xyXG5cdFx0JGNoYXJhY3RlckRvbS5jc3Moe1xyXG5cdFx0XHRcImJhY2tncm91bmQtcG9zaXRpb24teFwiOiBuZXh0UG9zaXRpb25zLnggKyBcInB4XCIsXHJcblx0XHRcdFwiYmFja2dyb3VuZC1wb3NpdGlvbi15XCI6IG5leHRQb3NpdGlvbnMueSArIFwicHhcIlxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMuY3VycmVudE1vdmUgPSBuZXh0TW92ZTtcclxuXHRcdHRoaXMuY3VycmVudERpcmVjdGlvbiA9IHRoaXMubmV4dERpcmVjdGlvbjtcclxuXHR9LFxyXG5cclxuXHQvLyDorqHnrpfkurrniannmoRjc3PlgY/np7vph49cclxuXHRfZ2V0UG9zaXRpb25YWTogZnVuY3Rpb24oc2l6ZSwgbW92ZVBvc2l0aW9uKXtcclxuXHRcdHZhciB4ID0gc2l6ZSAqIHBhcnNlSW50KG1vdmVQb3NpdGlvblswXSwgMTApICogLTE7XHJcblx0XHR2YXIgeSA9IHNpemUgKiBwYXJzZUludChtb3ZlUG9zaXRpb25bMV0sIDEwKSAqIC0xO1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDogeCxcclxuXHRcdFx0eTogeVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdC8vIOWPluW+l+S4i+S4gOasoeenu+WKqOeahOS9jee9riBcclxuXHQvLyBcIjAzXCIsIFwiMzNcIiAuLi5cclxuXHRfZ2V0TmV4dE1vdmU6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY3VycmVudE1vdmUgPSB0aGlzLmN1cnJlbnRNb3ZlO1xyXG5cdFx0dmFyIGN1cnJlbnREaXJlY3Rpb24gPSB0aGlzLmN1cnJlbnREaXJlY3Rpb247XHJcblx0XHR2YXIgbmV4dERpcmVjdGlvbiA9IHRoaXMubmV4dERpcmVjdGlvbjtcclxuXHRcdHZhciByZXR1cm5Nb3ZlID0gbnVsbDtcclxuXHJcblx0XHRpZihjdXJyZW50RGlyZWN0aW9uID09IG5leHREaXJlY3Rpb24pe1xyXG5cdFx0XHQvLyDlkJHlkIzkuIDkuKrmlrnlkJHooYzotbBcclxuXHJcblx0XHRcdHZhciBtb3ZlSW50ID0gcGFyc2VJbnQoY3VycmVudE1vdmVbMF0sIDEwKTtcclxuXHRcdFx0bW92ZUludCsrO1xyXG5cdFx0XHRpZihtb3ZlSW50ID4gMyl7XHJcblx0XHRcdFx0bW92ZUludCA9IDA7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuTW92ZSA9IG1vdmVJbnQgKyBjdXJyZW50TW92ZVsxXTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIOaUueWPmOihjOi1sOaWueWQkVxyXG5cclxuXHRcdFx0dGhpcy53YWxrRmxnPTA7XHJcblx0XHRcdHN3aXRjaChuZXh0RGlyZWN0aW9uKXtcclxuXHRcdFx0XHRjYXNlIFwibGVmdFwiOlxyXG5cdFx0XHRcdFx0cmV0dXJuTW92ZSA9IFwiMDNcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgXCJyaWdodFwiOlxyXG5cdFx0XHRcdFx0cmV0dXJuTW92ZSA9IFwiMDFcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgXCJ1cFwiOlxyXG5cdFx0XHRcdFx0cmV0dXJuTW92ZSA9IFwiMDJcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgXCJkb3duXCI6XHJcblx0XHRcdFx0XHRyZXR1cm5Nb3ZlID0gXCIwMFwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiByZXR1cm5Nb3ZlO1xyXG5cdFx0XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENoYXJhY3RlckVuZ2luIiwidmFyIENvb3JNYXAgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMubWFwID0gbmV3IE1hcCgpO1xyXG59XHJcbkNvb3JNYXAucHJvdG90eXBlID0ge1xyXG5cdGNvbnN0cnVjdG9yOiBDb29yTWFwLFxyXG5cdGdldDogZnVuY3Rpb24oeCwgeSl7XHJcblx0XHR2YXIgayA9IG51bGw7XHJcblx0XHRmb3Ioa2V5IG9mIHRoaXMubWFwLmtleXMoKSl7XHJcblx0XHRcdGlmKGtleS54ID09IHggJiYga2V5LnkgPT0geSl7XHJcblx0XHRcdFx0ayA9IGtleTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLm1hcC5nZXQoayk7XHJcblx0fSxcclxuXHRzZXQ6IGZ1bmN0aW9uKHgseSwgdmFsdWUpe1xyXG5cdFx0dmFyIGsgPSBudWxsO1xyXG5cdFx0Zm9yKGtleSBvZiB0aGlzLm1hcC5rZXlzKCkpe1xyXG5cdFx0XHRpZihrZXkueCA9PSB4ICYmIGtleS55ID09IHkpe1xyXG5cdFx0XHRcdGsgPSBrZXk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmKGspIHtcclxuXHRcdFx0dGhpcy5tYXAuc2V0KGssIHZhbHVlKTtcclxuXHRcdH1lbHNlIHtcclxuXHRcdFx0dGhpcy5tYXAuc2V0KHtcInhcIjp4ICwgXCJ5XCI6eX0sIHZhbHVlKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdGdldE1hcDogZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5tYXA7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvb3JNYXA7IiwidmFyIE1hcEVuZ2luID0gcmVxdWlyZShcIi4vTWFwRW5naW5cIik7XHJcbnZhciBDaGFyYWN0ZXJFbmdpbiA9IHJlcXVpcmUoXCIuL0NoYXJhY3RlckVuZ2luLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gRW5naW4oY29uZmlnKXtcclxuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuXHR0aGlzLmRhdGFTb3VyY2UgPSBudWxsO1xyXG5cdHRoaXMubWFwRW5naW4gPSBuZXcgTWFwRW5naW4oY29uZmlnKTtcclxuXHR0aGlzLmNoYXJhY3RlckVuZ2luID0gbmV3IENoYXJhY3RlckVuZ2luKCk7XHJcbn1cclxuXHJcbkVuZ2luLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogRW5naW4sXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLm1hcEVuZ2luLmluaXQodGhpcyk7XHJcblx0XHR0aGlzLmNoYXJhY3RlckVuZ2luLmluaXQoKTtcclxuXHR9LFxyXG5cclxuXHRzdGFydDogZnVuY3Rpb24oKXtcclxuXHJcblx0fSxcclxuXHJcblx0c2V0RGF0YVNvdXJjZTogZnVuY3Rpb24oZGF0YVNvdXJjZSl7XHJcblx0XHR0aGlzLmRhdGFTb3VyY2UgPSBkYXRhU291cmNlO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHM9RW5naW47XHJcbiIsInZhciBDb29yTWFwID0gcmVxdWlyZShcIi4vQ29vck1hcC5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIE1hcEVuZ2luKGNvbmZpZyl7XHJcblx0dGhpcy5jb25maWcgPSBjb25maWc7XHJcblx0dGhpcy5lbmdpbiA9IG51bGw7XHJcblx0dGhpcy5tYXBzID0gcmVxdWlyZShcIi4vbWFwcy5qc1wiKTtcclxuXHR0aGlzLm1hcE1hcHBpbmcgPSB0aGlzLm1hcHMubWFwTWFwcGluZztcclxufVxyXG5cclxuTWFwRW5naW4ucHJvdG90eXBlID0ge1xyXG5cdGNvbnN0cnVjdG9yOiBNYXBFbmdpbixcclxuXHJcblx0aW5pdDogZnVuY3Rpb24oZW5naW4pe1xyXG5cclxuXHRcdHRoaXMuZW5naW4gPSBlbmdpbjtcclxuXHJcblx0XHQvLyBwcmUtbG9hZCBhbGwgaW1hZ2VzXHJcblx0XHR2YXIgbWFwTWFwcGluZyA9IHRoaXMubWFwcy5tYXBNYXBwaW5nO1xyXG5cdFx0dmFyICRsb2FkRGl2ID0gJChcIjxkaXYgY2xhc3M9J2Rpc3BsYXlfbm9uZSc+PC9kaXY+XCIpO1xyXG5cdFx0JGxvYWREaXYuYXBwZW5kVG8oJChkb2N1bWVudC5ib2R5KSk7XHJcblx0XHRmb3IodmFyIGtleSBpbiBtYXBNYXBwaW5nKXtcclxuXHRcdFx0dmFyIGltYWdlUGF0aCA9IFwiaW1hZ2VzL1wiICsgbWFwTWFwcGluZ1trZXldO1xyXG5cdFx0XHQkKCc8aW1nLz4nKS5hdHRyKFwic3JjXCIsIGltYWdlUGF0aCkuYXBwZW5kVG8oJGxvYWREaXYpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMubG9hZE1hcChcIjAxXCIpO1xyXG5cdH0sXHJcblxyXG5cdGxvYWRNYXA6IGZ1bmN0aW9uKG1hcEtleSkge1xyXG5cdFx0JChcIi5tYWluIC5tYXBMYXllclwiKS5yZW1vdmUoKTtcclxuXHRcdHZhciAkbWFwTGF5ZXIgPSAkKFwiPGRpdiBjbGFzcz0nbWFwTGF5ZXInPjwvZGl2PlwiKTtcclxuXHRcdCRtYXBMYXllci5hcHBlbmRUbygkKFwiLm1haW5cIikpO1xyXG5cclxuXHRcdC8vIHNldCBtYXAgdG90YWwgaGVpZ2h0IGFuZCB3aWR0aFxyXG5cdFx0dmFyIG1hcERhdGEgPSB0aGlzLm1hcHNbbWFwS2V5XTtcclxuXHRcdHZhciBjZWxsU2l6ZSA9IHRoaXMuY29uZmlnLmNlbGxTaXplO1xyXG5cdFx0dmFyIGhMZW4gPSBtYXBEYXRhLmxlbmd0aDtcclxuXHRcdHZhciB3TGVuID0gbWFwRGF0YVswXS5sZW5ndGg7XHJcblx0XHR2YXIgd2lkdGggPSB3TGVuICogY2VsbFNpemU7XHJcblx0XHR2YXIgaGVpZ2h0ID0gaExlbiAqIGNlbGxTaXplO1xyXG5cdFx0JG1hcExheWVyLmNzcyh7XHJcblx0XHRcdHdpZHRoOiB3aWR0aCArIFwicHhcIixcclxuXHRcdFx0aGVpZ2h0OiBoZWlnaHQgKyBcInB4XCJcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIGluaXQgZGF0YVNvdXJjZSBhbmQgZG9tXHJcblx0XHR2YXIgdmFsdWUgPSBudWxsO1xyXG5cdFx0dmFyIHJvdyA9IG51bGw7XHJcblx0XHR2YXIgeCx5O1xyXG5cdFx0dmFyIGRhdGFTb3VyY2UgPSBuZXcgQ29vck1hcCgpO1xyXG5cdFx0Zm9yKHZhciBqPTA7ajxtYXBEYXRhLmxlbmd0aDtqKyspe1xyXG5cdFx0XHRyb3cgPSBtYXBEYXRhW2pdO1xyXG5cdFx0XHRmb3IodmFyIGk9MDtpPHJvdy5sZW5ndGg7aSsrKXtcclxuXHRcdFx0XHR2YWx1ZSA9IHRoaXMubWFwTWFwcGluZ1tyb3dbaV1dO1xyXG5cdFx0XHRcdHggPSBpICogY2VsbFNpemU7XHJcblx0XHRcdFx0eSA9IGogKiBjZWxsU2l6ZTtcclxuXHJcblx0XHRcdFx0Ly8gZGF0YXNvdXJjZVxyXG5cdFx0XHRcdGRhdGFTb3VyY2Uuc2V0KHgseSwge2JnOiB2YWx1ZX0pO1xyXG5cclxuXHRcdFx0XHQvLyBpbWFnZXNcclxuXHRcdFx0XHR2YXIgJGltZyA9ICQoJzxpbWcgYWx0PVwiXCIgLz4nKS5hdHRyKFwic3JjXCIsIFwiaW1hZ2VzL1wiICsgdmFsdWUpO1xyXG5cdFx0XHRcdCRpbWcuY3NzKHtcclxuXHRcdFx0XHRcdHdpZHRoOiBjZWxsU2l6ZSArIFwicHhcIixcclxuXHRcdFx0XHRcdGhlaWdodDogY2VsbFNpemUgKyBcInB4XCIsXHJcblx0XHRcdFx0XHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG5cdFx0XHRcdFx0bGVmdDogeCArIFwicHhcIixcclxuXHRcdFx0XHRcdHRvcDogeSArIFwicHhcIlxyXG5cdFx0XHRcdH0pLmFwcGVuZFRvKCRtYXBMYXllcik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHRoaXMuZW5naW4uc2V0RGF0YVNvdXJjZShkYXRhU291cmNlKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwRW5naW47XHJcbiIsInZhciBjaGFyYWN0ZXJzID0ge31cclxuXHJcbmNoYXJhY3RlcnNbXCJnaXJsXCJdID0ge1xyXG5cdGltZ05hbWU6IFwiY19naXJsLnBuZ1wiLFxyXG5cdHNpemU6IDEyMFxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjaGFyYWN0ZXJzOyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGNlbGxTaXplOiA0NVxyXG59IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoXCIuL2NvbmZpZy5qc1wiKTtcclxudmFyIEVuZ2luID0gcmVxdWlyZShcIi4vRW5naW4uanNcIik7XHJcblxyXG52YXIgZW5naW4gPSBuZXcgRW5naW4oY29uZmlnKTtcclxuXHJcblxyXG4kKGZ1bmN0aW9uKCl7XHJcblx0ZW5naW4uaW5pdCgpO1xyXG59KSIsInZhciBtYXBzID0ge31cclxuXHJcbm1hcHNbXCJtYXBNYXBwaW5nXCJdID0ge1xyXG5cdFwidHJcIjogXCJ0cmVlLnBuZ1wiLFxyXG5cdFwic2VcIjogXCJzZWEucG5nXCIsXHJcblx0XCJiZVwiOiBcImJlYWNoLnBuZ1wiLFxyXG5cdFwibGFcIjogXCJsYW5kLnBuZ1wiLFxyXG5cdFwiYnJcIjogXCJicmlkZ2UucG5nXCJcclxufVxyXG5cclxubWFwc1tcIjAxXCJdID1cclxuXCJ0cix0cix0cixiZSxzZSxicixzZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLGJlLGJyLGJlLGJlLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixsYSxsYSxsYSxsYSxsYSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cImxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhLGxhX1wiICtcclxuXCJ0cix0cix0cixsYSxsYSxsYSxsYSxsYSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLGJlLGJyLGJlLGJlLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixiZSxzZSxicixzZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJcIjtcclxuXHJcblxyXG4vLyDlnLDlm77mlbDmja7kuLLovazkuoznu7TmlbDnu4RcclxuZnVuY3Rpb24gdG9BcnJheShzdHIpe1xyXG5cdHZhciByZXR1cm5BcnJheSA9IFtdO1xyXG5cdHZhciBsaW5lQXJyID0gc3RyLnNwbGl0KFwiX1wiKTtcclxuXHRsaW5lQXJyLmZvckVhY2goZnVuY3Rpb24obGluZSl7XHJcblx0XHRyZXR1cm5BcnJheS5wdXNoKGxpbmUuc3BsaXQoXCIsXCIpKTtcclxuXHR9KTtcclxuXHRyZXR1cm4gcmV0dXJuQXJyYXk7XHJcbn1cclxuXHJcblxyXG5mb3IodmFyIGtleSBpbiBtYXBzKXtcclxuXHRpZigvXFxkXFxkLy50ZXN0KGtleSkpe1xyXG5cdFx0bWFwc1trZXldID0gdG9BcnJheShtYXBzW2tleV0pO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBtYXBzIl19
