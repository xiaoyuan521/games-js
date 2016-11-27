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

			
			if(_this.walkFlg == 2){
				_this.walkFlg = 0;
			}

			if(_this.walkFlg == 0){
				_this.nextDirection = null;
			}

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

	// 人物移动
	walk: function() {

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJycGcvZnJvbnRlbmQvQ2hhcmFjdGVyRW5naW4uanMiLCJycGcvZnJvbnRlbmQvQ29vck1hcC5qcyIsInJwZy9mcm9udGVuZC9Fbmdpbi5qcyIsInJwZy9mcm9udGVuZC9NYXBFbmdpbi5qcyIsInJwZy9mcm9udGVuZC9jaGFyYWN0ZXJzLmpzIiwicnBnL2Zyb250ZW5kL2NvbmZpZy5qcyIsInJwZy9mcm9udGVuZC9pbmRleC5qcyIsInJwZy9mcm9udGVuZC9tYXBzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY2hhcmFjdGVycyA9IHJlcXVpcmUoXCIuL2NoYXJhY3RlcnMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBDaGFyYWN0ZXJFbmdpbigpIHtcclxuXHR0aGlzLmN1cnJlbnREaXJlY3Rpb24gPSBcInJpZ2h0XCI7XHJcblx0dGhpcy5uZXh0RGlyZWN0aW9uID0gbnVsbDtcclxuXHJcblx0dGhpcy5jdXJyZW50TW92ZSA9IFwiMDFcIjsgLy8geCA9IDA7IHkgPSAxXHJcblxyXG5cdHRoaXMud2Fsa0ZsZyA9IDA7IC8vIOavj+asoei1sOWKqDLmraXvvIznp7vliqjkuIDkuKrlnLDlm77moLxcclxuXHJcblx0dGhpcy5jaGFyYWN0ZXJEYXRhID0gbnVsbDtcclxuXHJcbn1cclxuXHJcbkNoYXJhY3RlckVuZ2luLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogQ2hhcmFjdGVyRW5naW4sXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLmJpbmRFdmVudCgpO1xyXG5cdFx0dGhpcy5sb2FkQ2hhcmFjdGVyKFwiZ2lybFwiKTtcclxuXHRcdHRoaXMuc3RhcnRUaW1lcigpO1xyXG5cclxuXHR9LFxyXG5cclxuXHQvLyDlrprml7bmo4DmtYvkurrnianotbDliqhcclxuXHRzdGFydFRpbWVyOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIF90aGlzID0gdGhpcztcclxuXHRcdHNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcblxyXG5cdFx0XHRfdGhpcy53YWxrKCk7XHJcblxyXG5cdFx0XHRcclxuXHRcdFx0aWYoX3RoaXMud2Fsa0ZsZyA9PSAyKXtcclxuXHRcdFx0XHRfdGhpcy53YWxrRmxnID0gMDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYoX3RoaXMud2Fsa0ZsZyA9PSAwKXtcclxuXHRcdFx0XHRfdGhpcy5uZXh0RGlyZWN0aW9uID0gbnVsbDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH0sIDIwMCk7XHJcblx0fSxcclxuXHJcblx0Ly8g5Lq654mp6LWw5Yqo55qE6ZSu55uY5LqL5Lu2XHJcblx0YmluZEV2ZW50OiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIF90aGlzID0gdGhpcztcclxuXHRcdCQoZG9jdW1lbnQuYm9keSkub24oXCJrZXlkb3duLmNoYXJhY3Rlci53YWxrXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRzd2l0Y2goZS5rZXlDb2RlKXtcclxuXHRcdFx0XHRjYXNlIDM3OlxyXG5cdFx0XHRcdFx0X3RoaXMubmV4dERpcmVjdGlvbiA9IFwibGVmdFwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzODpcclxuXHRcdFx0XHRcdF90aGlzLm5leHREaXJlY3Rpb24gPSBcInVwXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDM5OlxyXG5cdFx0XHRcdFx0X3RoaXMubmV4dERpcmVjdGlvbiA9IFwicmlnaHRcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgNDA6XHJcblx0XHRcdFx0XHRfdGhpcy5uZXh0RGlyZWN0aW9uID0gXCJkb3duXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdFx0YnJlYWtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fSxcclxuXHJcblx0Ly8g5Yqg6L295Lq654mp5Zu+54mH77yM5Yid5aeL5YyW5ae/5Yq/XHJcblx0bG9hZENoYXJhY3RlcjogZnVuY3Rpb24obmFtZSl7XHJcblx0XHR2YXIgY2hhcmFjdGVyRGF0YSA9IHRoaXMuY2hhcmFjdGVyRGF0YSA9IGNoYXJhY3RlcnNbbmFtZV07XHJcblx0XHR2YXIgY2hhcmFjdGVyU2l6ZSA9IGNoYXJhY3RlckRhdGEuc2l6ZTtcclxuXHRcdHZhciBpbWdQYXRoID0gXCJpbWFnZXMvXCIgKyBjaGFyYWN0ZXJEYXRhLmltZ05hbWU7XHJcblxyXG5cdFx0dmFyICRjaGFyYWN0ZXJEb20gPSAkKCc8ZGl2IGNsYXNzPVwiY3VycmVudENoYXJhY3RlclwiPjwvZGl2PicpO1xyXG5cdFx0JGNoYXJhY3RlckRvbS5hcHBlbmRUbygkKFwiLm1haW5cIikpO1xyXG5cclxuXHRcdHZhciBwb3NpdGlvbnMgPSB0aGlzLl9nZXRQb3NpdGlvblhZKGNoYXJhY3RlclNpemUsIHRoaXMuY3VycmVudE1vdmUpO1xyXG5cdFx0JGNoYXJhY3RlckRvbS5jc3Moe1xyXG5cdFx0XHRcIndpZHRoXCI6IGNoYXJhY3RlclNpemUgKyBcInB4XCIsXHJcblx0XHRcdFwiaGVpZ2h0XCI6IGNoYXJhY3RlclNpemUgKyBcInB4XCIsXHJcblx0XHRcdFwiYmFja2dyb3VuZC1pbWFnZVwiOiBcInVybCgnXCIgKyBpbWdQYXRoICsgXCInKVwiLFxyXG5cdFx0XHRcImJhY2tncm91bmQtcG9zaXRpb24teFwiOiBwb3NpdGlvbnMueCArIFwicHhcIixcclxuXHRcdFx0XCJiYWNrZ3JvdW5kLXBvc2l0aW9uLXlcIjogcG9zaXRpb25zLnkgKyBcInB4XCJcclxuXHRcdH0pO1xyXG5cclxuXHR9LFxyXG5cclxuXHQvLyDkurrniannp7vliqhcclxuXHR3YWxrOiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHR2YXIgJGNoYXJhY3RlckRvbSA9ICQoXCIuY3VycmVudENoYXJhY3RlclwiKTtcclxuXHRcdGlmKCRjaGFyYWN0ZXJEb20ubGVuZ3RoID09IDApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0aWYodGhpcy5uZXh0RGlyZWN0aW9uID09IG51bGwpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMud2Fsa0ZsZyArKztcclxuXHJcblx0XHR2YXIgbmV4dE1vdmUgPSB0aGlzLl9nZXROZXh0TW92ZSgpO1xyXG5cdFx0dmFyIG5leHRQb3NpdGlvbnMgPSB0aGlzLl9nZXRQb3NpdGlvblhZKHRoaXMuY2hhcmFjdGVyRGF0YS5zaXplLCBuZXh0TW92ZSk7XHJcblxyXG5cdFx0dmFyICRjaGFyYWN0ZXJEb20gPSAkKFwiLmN1cnJlbnRDaGFyYWN0ZXJcIik7XHJcblx0XHQkY2hhcmFjdGVyRG9tLmNzcyh7XHJcblx0XHRcdFwiYmFja2dyb3VuZC1wb3NpdGlvbi14XCI6IG5leHRQb3NpdGlvbnMueCArIFwicHhcIixcclxuXHRcdFx0XCJiYWNrZ3JvdW5kLXBvc2l0aW9uLXlcIjogbmV4dFBvc2l0aW9ucy55ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jdXJyZW50TW92ZSA9IG5leHRNb3ZlO1xyXG5cdFx0dGhpcy5jdXJyZW50RGlyZWN0aW9uID0gdGhpcy5uZXh0RGlyZWN0aW9uO1xyXG5cdH0sXHJcblxyXG5cdC8vIOiuoeeul+S6uueJqeeahGNzc+WBj+enu+mHj1xyXG5cdF9nZXRQb3NpdGlvblhZOiBmdW5jdGlvbihzaXplLCBtb3ZlUG9zaXRpb24pe1xyXG5cdFx0dmFyIHggPSBzaXplICogcGFyc2VJbnQobW92ZVBvc2l0aW9uWzBdLCAxMCkgKiAtMTtcclxuXHRcdHZhciB5ID0gc2l6ZSAqIHBhcnNlSW50KG1vdmVQb3NpdGlvblsxXSwgMTApICogLTE7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Ly8g5Y+W5b6X5LiL5LiA5qyh56e75Yqo55qE5L2N572uIFxyXG5cdC8vIFwiMDNcIiwgXCIzM1wiIC4uLlxyXG5cdF9nZXROZXh0TW92ZTogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBjdXJyZW50TW92ZSA9IHRoaXMuY3VycmVudE1vdmU7XHJcblx0XHR2YXIgY3VycmVudERpcmVjdGlvbiA9IHRoaXMuY3VycmVudERpcmVjdGlvbjtcclxuXHRcdHZhciBuZXh0RGlyZWN0aW9uID0gdGhpcy5uZXh0RGlyZWN0aW9uO1xyXG5cdFx0dmFyIHJldHVybk1vdmUgPSBudWxsO1xyXG5cclxuXHRcdGlmKGN1cnJlbnREaXJlY3Rpb24gPT0gbmV4dERpcmVjdGlvbil7XHJcblx0XHRcdC8vIOWQkeWQjOS4gOS4quaWueWQkeihjOi1sFxyXG5cclxuXHRcdFx0dmFyIG1vdmVJbnQgPSBwYXJzZUludChjdXJyZW50TW92ZVswXSwgMTApO1xyXG5cdFx0XHRtb3ZlSW50Kys7XHJcblx0XHRcdGlmKG1vdmVJbnQgPiAzKXtcclxuXHRcdFx0XHRtb3ZlSW50ID0gMDtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm5Nb3ZlID0gbW92ZUludCArIGN1cnJlbnRNb3ZlWzFdO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8g5pS55Y+Y6KGM6LWw5pa55ZCRXHJcblxyXG5cdFx0XHR0aGlzLndhbGtGbGc9MDtcclxuXHRcdFx0c3dpdGNoKG5leHREaXJlY3Rpb24pe1xyXG5cdFx0XHRcdGNhc2UgXCJsZWZ0XCI6XHJcblx0XHRcdFx0XHRyZXR1cm5Nb3ZlID0gXCIwM1wiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcInJpZ2h0XCI6XHJcblx0XHRcdFx0XHRyZXR1cm5Nb3ZlID0gXCIwMVwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcInVwXCI6XHJcblx0XHRcdFx0XHRyZXR1cm5Nb3ZlID0gXCIwMlwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcImRvd25cIjpcclxuXHRcdFx0XHRcdHJldHVybk1vdmUgPSBcIjAwXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHJldHVybk1vdmU7XHJcblx0XHRcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhcmFjdGVyRW5naW4iLCJ2YXIgQ29vck1hcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5tYXAgPSBuZXcgTWFwKCk7XHJcbn1cclxuQ29vck1hcC5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IENvb3JNYXAsXHJcblx0Z2V0OiBmdW5jdGlvbih4LCB5KXtcclxuXHRcdHZhciBrID0gbnVsbDtcclxuXHRcdGZvcihrZXkgb2YgdGhpcy5tYXAua2V5cygpKXtcclxuXHRcdFx0aWYoa2V5LnggPT0geCAmJiBrZXkueSA9PSB5KXtcclxuXHRcdFx0XHRrID0ga2V5O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMubWFwLmdldChrKTtcclxuXHR9LFxyXG5cdHNldDogZnVuY3Rpb24oeCx5LCB2YWx1ZSl7XHJcblx0XHR2YXIgayA9IG51bGw7XHJcblx0XHRmb3Ioa2V5IG9mIHRoaXMubWFwLmtleXMoKSl7XHJcblx0XHRcdGlmKGtleS54ID09IHggJiYga2V5LnkgPT0geSl7XHJcblx0XHRcdFx0ayA9IGtleTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYoaykge1xyXG5cdFx0XHR0aGlzLm1hcC5zZXQoaywgdmFsdWUpO1xyXG5cdFx0fWVsc2Uge1xyXG5cdFx0XHR0aGlzLm1hcC5zZXQoe1wieFwiOnggLCBcInlcIjp5fSwgdmFsdWUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0Z2V0TWFwOiBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB0aGlzLm1hcDtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29vck1hcDsiLCJ2YXIgTWFwRW5naW4gPSByZXF1aXJlKFwiLi9NYXBFbmdpblwiKTtcclxudmFyIENoYXJhY3RlckVuZ2luID0gcmVxdWlyZShcIi4vQ2hhcmFjdGVyRW5naW4uanNcIik7XHJcblxyXG5mdW5jdGlvbiBFbmdpbihjb25maWcpe1xyXG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdHRoaXMuZGF0YVNvdXJjZSA9IG51bGw7XHJcblx0dGhpcy5tYXBFbmdpbiA9IG5ldyBNYXBFbmdpbihjb25maWcpO1xyXG5cdHRoaXMuY2hhcmFjdGVyRW5naW4gPSBuZXcgQ2hhcmFjdGVyRW5naW4oKTtcclxufVxyXG5cclxuRW5naW4ucHJvdG90eXBlID0ge1xyXG5cdGNvbnN0cnVjdG9yOiBFbmdpbixcclxuXHJcblx0aW5pdDogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMubWFwRW5naW4uaW5pdCh0aGlzKTtcclxuXHRcdHRoaXMuY2hhcmFjdGVyRW5naW4uaW5pdCgpO1xyXG5cdH0sXHJcblxyXG5cdHN0YXJ0OiBmdW5jdGlvbigpe1xyXG5cclxuXHR9LFxyXG5cclxuXHRzZXREYXRhU291cmNlOiBmdW5jdGlvbihkYXRhU291cmNlKXtcclxuXHRcdHRoaXMuZGF0YVNvdXJjZSA9IGRhdGFTb3VyY2U7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cz1FbmdpbjtcclxuIiwidmFyIENvb3JNYXAgPSByZXF1aXJlKFwiLi9Db29yTWFwLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gTWFwRW5naW4oY29uZmlnKXtcclxuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuXHR0aGlzLmVuZ2luID0gbnVsbDtcclxuXHR0aGlzLm1hcHMgPSByZXF1aXJlKFwiLi9tYXBzLmpzXCIpO1xyXG5cdHRoaXMubWFwTWFwcGluZyA9IHRoaXMubWFwcy5tYXBNYXBwaW5nO1xyXG59XHJcblxyXG5NYXBFbmdpbi5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IE1hcEVuZ2luLFxyXG5cclxuXHRpbml0OiBmdW5jdGlvbihlbmdpbil7XHJcblxyXG5cdFx0dGhpcy5lbmdpbiA9IGVuZ2luO1xyXG5cclxuXHRcdC8vIHByZS1sb2FkIGFsbCBpbWFnZXNcclxuXHRcdHZhciBtYXBNYXBwaW5nID0gdGhpcy5tYXBzLm1hcE1hcHBpbmc7XHJcblx0XHR2YXIgJGxvYWREaXYgPSAkKFwiPGRpdiBjbGFzcz0nZGlzcGxheV9ub25lJz48L2Rpdj5cIik7XHJcblx0XHQkbG9hZERpdi5hcHBlbmRUbygkKGRvY3VtZW50LmJvZHkpKTtcclxuXHRcdGZvcih2YXIga2V5IGluIG1hcE1hcHBpbmcpe1xyXG5cdFx0XHR2YXIgaW1hZ2VQYXRoID0gXCJpbWFnZXMvXCIgKyBtYXBNYXBwaW5nW2tleV07XHJcblx0XHRcdCQoJzxpbWcvPicpLmF0dHIoXCJzcmNcIiwgaW1hZ2VQYXRoKS5hcHBlbmRUbygkbG9hZERpdik7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5sb2FkTWFwKFwiMDFcIik7XHJcblx0fSxcclxuXHJcblx0bG9hZE1hcDogZnVuY3Rpb24obWFwS2V5KSB7XHJcblx0XHQkKFwiLm1haW4gLm1hcExheWVyXCIpLnJlbW92ZSgpO1xyXG5cdFx0dmFyICRtYXBMYXllciA9ICQoXCI8ZGl2IGNsYXNzPSdtYXBMYXllcic+PC9kaXY+XCIpO1xyXG5cdFx0JG1hcExheWVyLmFwcGVuZFRvKCQoXCIubWFpblwiKSk7XHJcblxyXG5cdFx0Ly8gc2V0IG1hcCB0b3RhbCBoZWlnaHQgYW5kIHdpZHRoXHJcblx0XHR2YXIgbWFwRGF0YSA9IHRoaXMubWFwc1ttYXBLZXldO1xyXG5cdFx0dmFyIGNlbGxTaXplID0gdGhpcy5jb25maWcuY2VsbFNpemU7XHJcblx0XHR2YXIgaExlbiA9IG1hcERhdGEubGVuZ3RoO1xyXG5cdFx0dmFyIHdMZW4gPSBtYXBEYXRhWzBdLmxlbmd0aDtcclxuXHRcdHZhciB3aWR0aCA9IHdMZW4gKiBjZWxsU2l6ZTtcclxuXHRcdHZhciBoZWlnaHQgPSBoTGVuICogY2VsbFNpemU7XHJcblx0XHQkbWFwTGF5ZXIuY3NzKHtcclxuXHRcdFx0d2lkdGg6IHdpZHRoICsgXCJweFwiLFxyXG5cdFx0XHRoZWlnaHQ6IGhlaWdodCArIFwicHhcIlxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gaW5pdCBkYXRhU291cmNlIGFuZCBkb21cclxuXHRcdHZhciB2YWx1ZSA9IG51bGw7XHJcblx0XHR2YXIgcm93ID0gbnVsbDtcclxuXHRcdHZhciB4LHk7XHJcblx0XHR2YXIgZGF0YVNvdXJjZSA9IG5ldyBDb29yTWFwKCk7XHJcblx0XHRmb3IodmFyIGo9MDtqPG1hcERhdGEubGVuZ3RoO2orKyl7XHJcblx0XHRcdHJvdyA9IG1hcERhdGFbal07XHJcblx0XHRcdGZvcih2YXIgaT0wO2k8cm93Lmxlbmd0aDtpKyspe1xyXG5cdFx0XHRcdHZhbHVlID0gdGhpcy5tYXBNYXBwaW5nW3Jvd1tpXV07XHJcblx0XHRcdFx0eCA9IGkgKiBjZWxsU2l6ZTtcclxuXHRcdFx0XHR5ID0gaiAqIGNlbGxTaXplO1xyXG5cclxuXHRcdFx0XHQvLyBkYXRhc291cmNlXHJcblx0XHRcdFx0ZGF0YVNvdXJjZS5zZXQoeCx5LCB7Ymc6IHZhbHVlfSk7XHJcblxyXG5cdFx0XHRcdC8vIGltYWdlc1xyXG5cdFx0XHRcdHZhciAkaW1nID0gJCgnPGltZyBhbHQ9XCJcIiAvPicpLmF0dHIoXCJzcmNcIiwgXCJpbWFnZXMvXCIgKyB2YWx1ZSk7XHJcblx0XHRcdFx0JGltZy5jc3Moe1xyXG5cdFx0XHRcdFx0d2lkdGg6IGNlbGxTaXplICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0aGVpZ2h0OiBjZWxsU2l6ZSArIFwicHhcIixcclxuXHRcdFx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcblx0XHRcdFx0XHRsZWZ0OiB4ICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0dG9wOiB5ICsgXCJweFwiXHJcblx0XHRcdFx0fSkuYXBwZW5kVG8oJG1hcExheWVyKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dGhpcy5lbmdpbi5zZXREYXRhU291cmNlKGRhdGFTb3VyY2UpO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNYXBFbmdpbjtcclxuIiwidmFyIGNoYXJhY3RlcnMgPSB7fVxyXG5cclxuY2hhcmFjdGVyc1tcImdpcmxcIl0gPSB7XHJcblx0aW1nTmFtZTogXCJjX2dpcmwucG5nXCIsXHJcblx0c2l6ZTogMTIwXHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNoYXJhY3RlcnM7IiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0Y2VsbFNpemU6IDQ1XHJcbn0iLCJ2YXIgY29uZmlnID0gcmVxdWlyZShcIi4vY29uZmlnLmpzXCIpO1xyXG52YXIgRW5naW4gPSByZXF1aXJlKFwiLi9Fbmdpbi5qc1wiKTtcclxuXHJcbnZhciBlbmdpbiA9IG5ldyBFbmdpbihjb25maWcpO1xyXG5cclxuXHJcbiQoZnVuY3Rpb24oKXtcclxuXHRlbmdpbi5pbml0KCk7XHJcbn0pIiwidmFyIG1hcHMgPSB7fVxyXG5cclxubWFwc1tcIm1hcE1hcHBpbmdcIl0gPSB7XHJcblx0XCJ0clwiOiBcInRyZWUucG5nXCIsXHJcblx0XCJzZVwiOiBcInNlYS5wbmdcIixcclxuXHRcImJlXCI6IFwiYmVhY2gucG5nXCIsXHJcblx0XCJsYVwiOiBcImxhbmQucG5nXCIsXHJcblx0XCJiclwiOiBcImJyaWRnZS5wbmdcIlxyXG59XHJcblxyXG5tYXBzW1wiMDFcIl0gPVxyXG5cInRyLHRyLHRyLGJlLHNlLGJyLHNlLGJlLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixiZSxzZSxicixzZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsYmUsYmUsYnIsYmUsYmUsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGxhLGxhLGxhLGxhLGxhLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixsYSxsYSxsYSxsYSxsYSx0cix0cix0cl9cIiArXHJcblwibGEsbGEsbGEsbGEsbGEsbGEsbGEsbGEsbGEsbGEsbGFfXCIgK1xyXG5cInRyLHRyLHRyLGxhLGxhLGxhLGxhLGxhLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixsYSxsYSxsYSxsYSxsYSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsYmUsYmUsYnIsYmUsYmUsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLHNlLGJyLHNlLGJlLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixiZSxzZSxicixzZSxiZSx0cix0cix0clwiO1xyXG5cclxuXHJcbi8vIOWcsOWbvuaVsOaNruS4sui9rOS6jOe7tOaVsOe7hFxyXG5mdW5jdGlvbiB0b0FycmF5KHN0cil7XHJcblx0dmFyIHJldHVybkFycmF5ID0gW107XHJcblx0dmFyIGxpbmVBcnIgPSBzdHIuc3BsaXQoXCJfXCIpO1xyXG5cdGxpbmVBcnIuZm9yRWFjaChmdW5jdGlvbihsaW5lKXtcclxuXHRcdHJldHVybkFycmF5LnB1c2gobGluZS5zcGxpdChcIixcIikpO1xyXG5cdH0pO1xyXG5cdHJldHVybiByZXR1cm5BcnJheTtcclxufVxyXG5cclxuXHJcbmZvcih2YXIga2V5IGluIG1hcHMpe1xyXG5cdGlmKC9cXGRcXGQvLnRlc3Qoa2V5KSl7XHJcblx0XHRtYXBzW2tleV0gPSB0b0FycmF5KG1hcHNba2V5XSk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG1hcHMiXX0=
