(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var characters = require("./characters.js");

function CharacterEngin() {
	this.currentDirection = "right";
	this.nextDirection = null;

	this.currentMove = "01"; // x = 0; y = 1

	this.characterData = null;

}

CharacterEngin.prototype = {
	constructor: CharacterEngin,

	init: function(){
		this.startTimer();
		this.bindEvent();
		this.loadCharacter("girl");

	},

	// 定时检测任务走动
	startTimer: function(){
		var _this = this;
		setInterval(function(){
			_this.walk();
		},200);
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
		if($characterDom.length == 0){
			return;
		}
		if(this.nextDirection == null){
			return;
		}

		var nextMove = this._getNextMove();
		var nextPositions = this._getPositionXY(this.characterData.size, nextMove);
		console.log(nextMove, nextPositions);

		var $characterDom = $(".currentCharacter");
		$characterDom.css({
			"background-position-x": nextPositions.x + "px",
			"background-position-y": nextPositions.y + "px"
		});
		
		this.currentMove = nextMove;
		this.currentDirection = this.nextDirection;
		this.nextDirection = null;
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
			var moveInt = parseInt(currentMove[0], 10);
			moveInt++;
			if(moveInt > 3){
				moveInt = 0;
			}
			returnMove = moveInt + currentMove[1];
		} else {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJycGcvZnJvbnRlbmQvQ2hhcmFjdGVyRW5naW4uanMiLCJycGcvZnJvbnRlbmQvQ29vck1hcC5qcyIsInJwZy9mcm9udGVuZC9Fbmdpbi5qcyIsInJwZy9mcm9udGVuZC9NYXBFbmdpbi5qcyIsInJwZy9mcm9udGVuZC9jaGFyYWN0ZXJzLmpzIiwicnBnL2Zyb250ZW5kL2NvbmZpZy5qcyIsInJwZy9mcm9udGVuZC9pbmRleC5qcyIsInJwZy9mcm9udGVuZC9tYXBzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGNoYXJhY3RlcnMgPSByZXF1aXJlKFwiLi9jaGFyYWN0ZXJzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gQ2hhcmFjdGVyRW5naW4oKSB7XHJcblx0dGhpcy5jdXJyZW50RGlyZWN0aW9uID0gXCJyaWdodFwiO1xyXG5cdHRoaXMubmV4dERpcmVjdGlvbiA9IG51bGw7XHJcblxyXG5cdHRoaXMuY3VycmVudE1vdmUgPSBcIjAxXCI7IC8vIHggPSAwOyB5ID0gMVxyXG5cclxuXHR0aGlzLmNoYXJhY3RlckRhdGEgPSBudWxsO1xyXG5cclxufVxyXG5cclxuQ2hhcmFjdGVyRW5naW4ucHJvdG90eXBlID0ge1xyXG5cdGNvbnN0cnVjdG9yOiBDaGFyYWN0ZXJFbmdpbixcclxuXHJcblx0aW5pdDogZnVuY3Rpb24oKXtcclxuXHRcdHRoaXMuc3RhcnRUaW1lcigpO1xyXG5cdFx0dGhpcy5iaW5kRXZlbnQoKTtcclxuXHRcdHRoaXMubG9hZENoYXJhY3RlcihcImdpcmxcIik7XHJcblxyXG5cdH0sXHJcblxyXG5cdC8vIOWumuaXtuajgOa1i+S7u+WKoei1sOWKqFxyXG5cdHN0YXJ0VGltZXI6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xyXG5cdFx0c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXtcclxuXHRcdFx0X3RoaXMud2FsaygpO1xyXG5cdFx0fSwyMDApO1xyXG5cdH0sXHJcblxyXG5cdC8vIOS6uueJqei1sOWKqOeahOmUruebmOS6i+S7tlxyXG5cdGJpbmRFdmVudDogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBfdGhpcyA9IHRoaXM7XHJcblx0XHQkKGRvY3VtZW50LmJvZHkpLm9uKFwia2V5ZG93bi5jaGFyYWN0ZXIud2Fsa1wiLCBmdW5jdGlvbihlKXtcclxuXHRcdFx0c3dpdGNoKGUua2V5Q29kZSl7XHJcblx0XHRcdFx0Y2FzZSAzNzpcclxuXHRcdFx0XHRcdF90aGlzLm5leHREaXJlY3Rpb24gPSBcImxlZnRcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMzg6XHJcblx0XHRcdFx0XHRfdGhpcy5uZXh0RGlyZWN0aW9uID0gXCJ1cFwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzOTpcclxuXHRcdFx0XHRcdF90aGlzLm5leHREaXJlY3Rpb24gPSBcInJpZ2h0XCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDQwOlxyXG5cdFx0XHRcdFx0X3RoaXMubmV4dERpcmVjdGlvbiA9IFwiZG93blwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdGJyZWFrXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH0sXHJcblxyXG5cdC8vIOWKoOi9veS6uueJqeWbvueJh++8jOWIneWni+WMluWnv+WKv1xyXG5cdGxvYWRDaGFyYWN0ZXI6IGZ1bmN0aW9uKG5hbWUpe1xyXG5cdFx0dmFyIGNoYXJhY3RlckRhdGEgPSB0aGlzLmNoYXJhY3RlckRhdGEgPSBjaGFyYWN0ZXJzW25hbWVdO1xyXG5cdFx0dmFyIGNoYXJhY3RlclNpemUgPSBjaGFyYWN0ZXJEYXRhLnNpemU7XHJcblx0XHR2YXIgaW1nUGF0aCA9IFwiaW1hZ2VzL1wiICsgY2hhcmFjdGVyRGF0YS5pbWdOYW1lO1xyXG5cclxuXHRcdHZhciAkY2hhcmFjdGVyRG9tID0gJCgnPGRpdiBjbGFzcz1cImN1cnJlbnRDaGFyYWN0ZXJcIj48L2Rpdj4nKTtcclxuXHRcdCRjaGFyYWN0ZXJEb20uYXBwZW5kVG8oJChcIi5tYWluXCIpKTtcclxuXHJcblx0XHR2YXIgcG9zaXRpb25zID0gdGhpcy5fZ2V0UG9zaXRpb25YWShjaGFyYWN0ZXJTaXplLCB0aGlzLmN1cnJlbnRNb3ZlKTtcclxuXHRcdCRjaGFyYWN0ZXJEb20uY3NzKHtcclxuXHRcdFx0XCJ3aWR0aFwiOiBjaGFyYWN0ZXJTaXplICsgXCJweFwiLFxyXG5cdFx0XHRcImhlaWdodFwiOiBjaGFyYWN0ZXJTaXplICsgXCJweFwiLFxyXG5cdFx0XHRcImJhY2tncm91bmQtaW1hZ2VcIjogXCJ1cmwoJ1wiICsgaW1nUGF0aCArIFwiJylcIixcclxuXHRcdFx0XCJiYWNrZ3JvdW5kLXBvc2l0aW9uLXhcIjogcG9zaXRpb25zLnggKyBcInB4XCIsXHJcblx0XHRcdFwiYmFja2dyb3VuZC1wb3NpdGlvbi15XCI6IHBvc2l0aW9ucy55ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHJcblx0fSxcclxuXHJcblx0Ly8g5Lq654mp56e75YqoXHJcblx0d2FsazogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0dmFyICRjaGFyYWN0ZXJEb20gPSAkKFwiLmN1cnJlbnRDaGFyYWN0ZXJcIik7XHJcblx0XHRpZigkY2hhcmFjdGVyRG9tLmxlbmd0aCA9PSAwKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0aWYodGhpcy5uZXh0RGlyZWN0aW9uID09IG51bGwpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIG5leHRNb3ZlID0gdGhpcy5fZ2V0TmV4dE1vdmUoKTtcclxuXHRcdHZhciBuZXh0UG9zaXRpb25zID0gdGhpcy5fZ2V0UG9zaXRpb25YWSh0aGlzLmNoYXJhY3RlckRhdGEuc2l6ZSwgbmV4dE1vdmUpO1xyXG5cdFx0Y29uc29sZS5sb2cobmV4dE1vdmUsIG5leHRQb3NpdGlvbnMpO1xyXG5cclxuXHRcdHZhciAkY2hhcmFjdGVyRG9tID0gJChcIi5jdXJyZW50Q2hhcmFjdGVyXCIpO1xyXG5cdFx0JGNoYXJhY3RlckRvbS5jc3Moe1xyXG5cdFx0XHRcImJhY2tncm91bmQtcG9zaXRpb24teFwiOiBuZXh0UG9zaXRpb25zLnggKyBcInB4XCIsXHJcblx0XHRcdFwiYmFja2dyb3VuZC1wb3NpdGlvbi15XCI6IG5leHRQb3NpdGlvbnMueSArIFwicHhcIlxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMuY3VycmVudE1vdmUgPSBuZXh0TW92ZTtcclxuXHRcdHRoaXMuY3VycmVudERpcmVjdGlvbiA9IHRoaXMubmV4dERpcmVjdGlvbjtcclxuXHRcdHRoaXMubmV4dERpcmVjdGlvbiA9IG51bGw7XHJcblx0fSxcclxuXHJcblx0Ly8g6K6h566X5Lq654mp55qEY3Nz5YGP56e76YePXHJcblx0X2dldFBvc2l0aW9uWFk6IGZ1bmN0aW9uKHNpemUsIG1vdmVQb3NpdGlvbil7XHJcblx0XHR2YXIgeCA9IHNpemUgKiBwYXJzZUludChtb3ZlUG9zaXRpb25bMF0sIDEwKSAqIC0xO1xyXG5cdFx0dmFyIHkgPSBzaXplICogcGFyc2VJbnQobW92ZVBvc2l0aW9uWzFdLCAxMCkgKiAtMTtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHg6IHgsXHJcblx0XHRcdHk6IHlcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvLyDlj5blvpfkuIvkuIDmrKHnp7vliqjnmoTkvY3nva4gXHJcblx0Ly8gXCIwM1wiLCBcIjMzXCIgLi4uXHJcblx0X2dldE5leHRNb3ZlOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIGN1cnJlbnRNb3ZlID0gdGhpcy5jdXJyZW50TW92ZTtcclxuXHRcdHZhciBjdXJyZW50RGlyZWN0aW9uID0gdGhpcy5jdXJyZW50RGlyZWN0aW9uO1xyXG5cdFx0dmFyIG5leHREaXJlY3Rpb24gPSB0aGlzLm5leHREaXJlY3Rpb247XHJcblx0XHR2YXIgcmV0dXJuTW92ZSA9IG51bGw7XHJcblx0XHRpZihjdXJyZW50RGlyZWN0aW9uID09IG5leHREaXJlY3Rpb24pe1xyXG5cdFx0XHR2YXIgbW92ZUludCA9IHBhcnNlSW50KGN1cnJlbnRNb3ZlWzBdLCAxMCk7XHJcblx0XHRcdG1vdmVJbnQrKztcclxuXHRcdFx0aWYobW92ZUludCA+IDMpe1xyXG5cdFx0XHRcdG1vdmVJbnQgPSAwO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybk1vdmUgPSBtb3ZlSW50ICsgY3VycmVudE1vdmVbMV07XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRzd2l0Y2gobmV4dERpcmVjdGlvbil7XHJcblx0XHRcdFx0Y2FzZSBcImxlZnRcIjpcclxuXHRcdFx0XHRcdHJldHVybk1vdmUgPSBcIjAzXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwicmlnaHRcIjpcclxuXHRcdFx0XHRcdHJldHVybk1vdmUgPSBcIjAxXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwidXBcIjpcclxuXHRcdFx0XHRcdHJldHVybk1vdmUgPSBcIjAyXCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwiZG93blwiOlxyXG5cdFx0XHRcdFx0cmV0dXJuTW92ZSA9IFwiMDBcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gcmV0dXJuTW92ZTtcclxuXHRcdFxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGFyYWN0ZXJFbmdpbiIsInZhciBDb29yTWFwID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLm1hcCA9IG5ldyBNYXAoKTtcclxufVxyXG5Db29yTWFwLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogQ29vck1hcCxcclxuXHRnZXQ6IGZ1bmN0aW9uKHgsIHkpe1xyXG5cdFx0dmFyIGsgPSBudWxsO1xyXG5cdFx0Zm9yKGtleSBvZiB0aGlzLm1hcC5rZXlzKCkpe1xyXG5cdFx0XHRpZihrZXkueCA9PSB4ICYmIGtleS55ID09IHkpe1xyXG5cdFx0XHRcdGsgPSBrZXk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5tYXAuZ2V0KGspO1xyXG5cdH0sXHJcblx0c2V0OiBmdW5jdGlvbih4LHksIHZhbHVlKXtcclxuXHRcdHZhciBrID0gbnVsbDtcclxuXHRcdGZvcihrZXkgb2YgdGhpcy5tYXAua2V5cygpKXtcclxuXHRcdFx0aWYoa2V5LnggPT0geCAmJiBrZXkueSA9PSB5KXtcclxuXHRcdFx0XHRrID0ga2V5O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZihrKSB7XHJcblx0XHRcdHRoaXMubWFwLnNldChrLCB2YWx1ZSk7XHJcblx0XHR9ZWxzZSB7XHJcblx0XHRcdHRoaXMubWFwLnNldCh7XCJ4XCI6eCAsIFwieVwiOnl9LCB2YWx1ZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHRnZXRNYXA6IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMubWFwO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb29yTWFwOyIsInZhciBNYXBFbmdpbiA9IHJlcXVpcmUoXCIuL01hcEVuZ2luXCIpO1xyXG52YXIgQ2hhcmFjdGVyRW5naW4gPSByZXF1aXJlKFwiLi9DaGFyYWN0ZXJFbmdpbi5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEVuZ2luKGNvbmZpZyl7XHJcblx0dGhpcy5jb25maWcgPSBjb25maWc7XHJcblx0dGhpcy5kYXRhU291cmNlID0gbnVsbDtcclxuXHR0aGlzLm1hcEVuZ2luID0gbmV3IE1hcEVuZ2luKGNvbmZpZyk7XHJcblx0dGhpcy5jaGFyYWN0ZXJFbmdpbiA9IG5ldyBDaGFyYWN0ZXJFbmdpbigpO1xyXG59XHJcblxyXG5Fbmdpbi5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IEVuZ2luLFxyXG5cclxuXHRpbml0OiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5tYXBFbmdpbi5pbml0KHRoaXMpO1xyXG5cdFx0dGhpcy5jaGFyYWN0ZXJFbmdpbi5pbml0KCk7XHJcblx0fSxcclxuXHJcblx0c3RhcnQ6IGZ1bmN0aW9uKCl7XHJcblxyXG5cdH0sXHJcblxyXG5cdHNldERhdGFTb3VyY2U6IGZ1bmN0aW9uKGRhdGFTb3VyY2Upe1xyXG5cdFx0dGhpcy5kYXRhU291cmNlID0gZGF0YVNvdXJjZTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzPUVuZ2luO1xyXG4iLCJ2YXIgQ29vck1hcCA9IHJlcXVpcmUoXCIuL0Nvb3JNYXAuanNcIik7XHJcblxyXG5mdW5jdGlvbiBNYXBFbmdpbihjb25maWcpe1xyXG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdHRoaXMuZW5naW4gPSBudWxsO1xyXG5cdHRoaXMubWFwcyA9IHJlcXVpcmUoXCIuL21hcHMuanNcIik7XHJcblx0dGhpcy5tYXBNYXBwaW5nID0gdGhpcy5tYXBzLm1hcE1hcHBpbmc7XHJcbn1cclxuXHJcbk1hcEVuZ2luLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogTWFwRW5naW4sXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKGVuZ2luKXtcclxuXHJcblx0XHR0aGlzLmVuZ2luID0gZW5naW47XHJcblxyXG5cdFx0Ly8gcHJlLWxvYWQgYWxsIGltYWdlc1xyXG5cdFx0dmFyIG1hcE1hcHBpbmcgPSB0aGlzLm1hcHMubWFwTWFwcGluZztcclxuXHRcdHZhciAkbG9hZERpdiA9ICQoXCI8ZGl2IGNsYXNzPSdkaXNwbGF5X25vbmUnPjwvZGl2PlwiKTtcclxuXHRcdCRsb2FkRGl2LmFwcGVuZFRvKCQoZG9jdW1lbnQuYm9keSkpO1xyXG5cdFx0Zm9yKHZhciBrZXkgaW4gbWFwTWFwcGluZyl7XHJcblx0XHRcdHZhciBpbWFnZVBhdGggPSBcImltYWdlcy9cIiArIG1hcE1hcHBpbmdba2V5XTtcclxuXHRcdFx0JCgnPGltZy8+JykuYXR0cihcInNyY1wiLCBpbWFnZVBhdGgpLmFwcGVuZFRvKCRsb2FkRGl2KTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmxvYWRNYXAoXCIwMVwiKTtcclxuXHR9LFxyXG5cclxuXHRsb2FkTWFwOiBmdW5jdGlvbihtYXBLZXkpIHtcclxuXHRcdCQoXCIubWFpbiAubWFwTGF5ZXJcIikucmVtb3ZlKCk7XHJcblx0XHR2YXIgJG1hcExheWVyID0gJChcIjxkaXYgY2xhc3M9J21hcExheWVyJz48L2Rpdj5cIik7XHJcblx0XHQkbWFwTGF5ZXIuYXBwZW5kVG8oJChcIi5tYWluXCIpKTtcclxuXHJcblx0XHQvLyBzZXQgbWFwIHRvdGFsIGhlaWdodCBhbmQgd2lkdGhcclxuXHRcdHZhciBtYXBEYXRhID0gdGhpcy5tYXBzW21hcEtleV07XHJcblx0XHR2YXIgY2VsbFNpemUgPSB0aGlzLmNvbmZpZy5jZWxsU2l6ZTtcclxuXHRcdHZhciBoTGVuID0gbWFwRGF0YS5sZW5ndGg7XHJcblx0XHR2YXIgd0xlbiA9IG1hcERhdGFbMF0ubGVuZ3RoO1xyXG5cdFx0dmFyIHdpZHRoID0gd0xlbiAqIGNlbGxTaXplO1xyXG5cdFx0dmFyIGhlaWdodCA9IGhMZW4gKiBjZWxsU2l6ZTtcclxuXHRcdCRtYXBMYXllci5jc3Moe1xyXG5cdFx0XHR3aWR0aDogd2lkdGggKyBcInB4XCIsXHJcblx0XHRcdGhlaWdodDogaGVpZ2h0ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBpbml0IGRhdGFTb3VyY2UgYW5kIGRvbVxyXG5cdFx0dmFyIHZhbHVlID0gbnVsbDtcclxuXHRcdHZhciByb3cgPSBudWxsO1xyXG5cdFx0dmFyIHgseTtcclxuXHRcdHZhciBkYXRhU291cmNlID0gbmV3IENvb3JNYXAoKTtcclxuXHRcdGZvcih2YXIgaj0wO2o8bWFwRGF0YS5sZW5ndGg7aisrKXtcclxuXHRcdFx0cm93ID0gbWFwRGF0YVtqXTtcclxuXHRcdFx0Zm9yKHZhciBpPTA7aTxyb3cubGVuZ3RoO2krKyl7XHJcblx0XHRcdFx0dmFsdWUgPSB0aGlzLm1hcE1hcHBpbmdbcm93W2ldXTtcclxuXHRcdFx0XHR4ID0gaSAqIGNlbGxTaXplO1xyXG5cdFx0XHRcdHkgPSBqICogY2VsbFNpemU7XHJcblxyXG5cdFx0XHRcdC8vIGRhdGFzb3VyY2VcclxuXHRcdFx0XHRkYXRhU291cmNlLnNldCh4LHksIHtiZzogdmFsdWV9KTtcclxuXHJcblx0XHRcdFx0Ly8gaW1hZ2VzXHJcblx0XHRcdFx0dmFyICRpbWcgPSAkKCc8aW1nIGFsdD1cIlwiIC8+JykuYXR0cihcInNyY1wiLCBcImltYWdlcy9cIiArIHZhbHVlKTtcclxuXHRcdFx0XHQkaW1nLmNzcyh7XHJcblx0XHRcdFx0XHR3aWR0aDogY2VsbFNpemUgKyBcInB4XCIsXHJcblx0XHRcdFx0XHRoZWlnaHQ6IGNlbGxTaXplICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuXHRcdFx0XHRcdGxlZnQ6IHggKyBcInB4XCIsXHJcblx0XHRcdFx0XHR0b3A6IHkgKyBcInB4XCJcclxuXHRcdFx0XHR9KS5hcHBlbmRUbygkbWFwTGF5ZXIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR0aGlzLmVuZ2luLnNldERhdGFTb3VyY2UoZGF0YVNvdXJjZSk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEVuZ2luO1xyXG4iLCJ2YXIgY2hhcmFjdGVycyA9IHt9XHJcblxyXG5jaGFyYWN0ZXJzW1wiZ2lybFwiXSA9IHtcclxuXHRpbWdOYW1lOiBcImNfZ2lybC5wbmdcIixcclxuXHRzaXplOiAxMjBcclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2hhcmFjdGVyczsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRjZWxsU2l6ZTogNDVcclxufSIsInZhciBjb25maWcgPSByZXF1aXJlKFwiLi9jb25maWcuanNcIik7XHJcbnZhciBFbmdpbiA9IHJlcXVpcmUoXCIuL0VuZ2luLmpzXCIpO1xyXG5cclxudmFyIGVuZ2luID0gbmV3IEVuZ2luKGNvbmZpZyk7XHJcblxyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cdGVuZ2luLmluaXQoKTtcclxufSkiLCJ2YXIgbWFwcyA9IHt9XHJcblxyXG5tYXBzW1wibWFwTWFwcGluZ1wiXSA9IHtcclxuXHRcInRyXCI6IFwidHJlZS5wbmdcIixcclxuXHRcInNlXCI6IFwic2VhLnBuZ1wiLFxyXG5cdFwiYmVcIjogXCJiZWFjaC5wbmdcIixcclxuXHRcImxhXCI6IFwibGFuZC5wbmdcIixcclxuXHRcImJyXCI6IFwiYnJpZGdlLnBuZ1wiXHJcbn1cclxuXHJcbm1hcHNbXCIwMVwiXSA9XHJcblwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLHNlLGJyLHNlLGJlLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixiZSxiZSxicixiZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGxhLGxhLGxhLGxhLGxhLHRyLHRyLHRyX1wiICtcclxuXCJsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYV9cIiArXHJcblwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGxhLGxhLGxhLGxhLGxhLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixiZSxiZSxicixiZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLHNlLGJyLHNlLGJlLHRyLHRyLHRyXCI7XHJcblxyXG5cclxuLy8g5Zyw5Zu+5pWw5o2u5Liy6L2s5LqM57u05pWw57uEXHJcbmZ1bmN0aW9uIHRvQXJyYXkoc3RyKXtcclxuXHR2YXIgcmV0dXJuQXJyYXkgPSBbXTtcclxuXHR2YXIgbGluZUFyciA9IHN0ci5zcGxpdChcIl9cIik7XHJcblx0bGluZUFyci5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpe1xyXG5cdFx0cmV0dXJuQXJyYXkucHVzaChsaW5lLnNwbGl0KFwiLFwiKSk7XHJcblx0fSk7XHJcblx0cmV0dXJuIHJldHVybkFycmF5O1xyXG59XHJcblxyXG5cclxuZm9yKHZhciBrZXkgaW4gbWFwcyl7XHJcblx0aWYoL1xcZFxcZC8udGVzdChrZXkpKXtcclxuXHRcdG1hcHNba2V5XSA9IHRvQXJyYXkobWFwc1trZXldKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbWFwcyJdfQ==
