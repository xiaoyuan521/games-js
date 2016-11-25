(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CoorMap = require("./CoorMap.js");

var Box = function(config){
	this.dataSource = null;
	this.domSource = null;
	this.config = config;
	this.points = null;
	this.snake = null;

	this.baseDom = null;
}

// dataSource
// 0 - blank
// 1 - snake
// 2 - genereate points
Box.prototype = {
	constructor: Box,

	init: function(snake){
		this.snake = snake;
		this.initDataSourceAndDom();
		this.generatePoints();
	},

	initDataSourceAndDom: function(){
		var wLen =  this.config.wLen
		var hLen = this.config.hLen;
		var cellLen  = this.config.cellLen;

		this.dataSource = new CoorMap();
		this.domSource = new CoorMap();
		this.points = [];

		// draw container dom
		var widthTotal = cellLen * wLen;
		var heightTotal = cellLen * hLen;
		var $boxNode = $("<div class='box'></div>")
			.css({
				"width": widthTotal + "px",
				"height": heightTotal + "px"
			}).appendTo(document.body);
		this.baseDom = $boxNode;

		var w = 0;
		var h = 0;

		for (var j=0;j<hLen;j++){
			for(var i=0;i<wLen; i++){

				var x = i * cellLen;
				var y = j * cellLen;

				// init dom
				$cell = $("<div class='cell'><div class='point vertical-align-middle'></div></div>")
					.css({
						"width": cellLen + "px",
						"height": cellLen + "px",
						"left": x + "px",
						"top": y + "px"
					})
					.appendTo($boxNode);

				// init datasource
				this.dataSource.set(x, y, {value: 0, leader: null});
				// init domSource
				this.domSource.set(x, y, $cell);
			}
		}
	},

	getDataSource: function(){
		return this.dataSource;
	},

	getDomSource: function(){
		return this.domSource;
	},

	getConfig: function(){
		return this.config;
	},

	generatePoints: function(){
		var wLen = this.config.wLen;
		var hLen = this.config.hLen;
		var cellLen = this.config.cellLen;
		var xCell = new Number(wLen).random();
		var yCell = new Number(hLen).random();
		var x = xCell * cellLen;
		var y = yCell * cellLen;

		if(this.dataSource.get(x,y).value != 0){
			return this.generatePoints();
		}

		this.dataSource.set(x, y, {value:2, leader: null});
		var $cell = this.domSource.get(x,y);
		$(".point", $cell).addClass("alone");
	}


}

module.exports = Box;
},{"./CoorMap.js":2}],2:[function(require,module,exports){
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
var Drawer = function(box) {
	this.box = box;
}

Drawer.prototype = {
	constructor: Drawer,

	init: function() {

	},

	notify: function() {

		$(".box .point.snake").removeClass("snake");

		var dataMap = this.box.getDataSource();
		var nodeMap = this.box.getDomSource();
		for (var k of dataMap.getMap().keys()) {
			if (dataMap.get(k.x, k.y).value == 1) {
				var $cell = nodeMap.get(k.x, k.y);
				$(".point", $cell).addClass("snake");
			}
		}
	},

	notifyPoints: function() {

	}
}

module.exports = Drawer;
},{}],4:[function(require,module,exports){
var CoorMap = require("./CoorMap.js");

var Snake = function(box, drawer){
	this.box = box;
	this.drawer = drawer;
	this.config = box.getConfig();
	this.dataSource = box.getDataSource();
	this.domSource = box.getDomSource();

	this.direction = null; // left, right, up, down
	this.directionLock = false;

	this.head = null;
	this.tail = null;

	this.handler = null;
}

Snake.prototype = {
	constructor: Snake,

	init: function(box){
		var wLen = this.config.wLen;
		var hLen = this.config.hLen;
		var cellLen = this.config.cellLen;

		// when init, the snake has two points
		// first point
		var centerX = parseInt(wLen / 2, 10) * cellLen;
		var centerY = parseInt(hLen / 2, 10) * cellLen;
		this.dataSource.set(centerX, centerY, {value: 1, leader: null});
		this.head = {
			x: centerX,
			y: centerY
		}
		// second point
		var centerX2 = centerX - cellLen;
		var centerY2 = centerY;
		this.dataSource.set(centerX2, centerY2, {value: 1, leader: this.head});
		this.direction = "right";
		this.tail = {
			x: centerX2,
			y: centerY2
		}

		this.drawer.notify();

		this.startSnake();

	},

	startSnake: function(){
		var _this = this;
		this.handler = setInterval(function(){
			_this.move();
		}, 100);
	},

	move: function(){
		var next = this._getNextPoint();
		if(this.checkHit(next) === true){
			clearInterval(this.handler);
			var restartFlg = confirm("game over ! restart ?");
			if(restartFlg === true){
				window.location.reload();
			} else {
				// nothing todo
			}
		} else {
			// head move
			var eatFlg = false;
			if(this.dataSource.get(next.x, next.y).value == 2){
				// eat!
				eatFlg = true;
				var $cell = this.domSource.get(next.x, next.y);
				$(".point", $cell).removeClass("alone");
				this.box.generatePoints();
			}
			this.dataSource.get(this.head.x, this.head.y).leader = next;
			this.dataSource.set(next.x, next.y, {value: 1, leader: null});
			this.head = next;

			// tail move
			if(eatFlg != true) {
				var tailX = this.tail.x;
				var tailY = this.tail.y;
				this.tail = this.dataSource.get(tailX, tailY).leader;
				this.dataSource.set(tailX, tailY, {value:0, leader: null});
			}

			this.directionLock = false;

			// draw
			this.drawer.notify();
		}
	},

	checkHit: function(point){
		var cell = this.dataSource.get(point.x, point.y);
		console.log(cell);
		if(!cell){
			return true;
		}
		if(cell.value == 1){
			return true;
		}
		return false;
	},

	setDirection: function(direction){
		this.direction = direction;
	},

	getDirection: function(){
		return this.direction;
	},

	_getNextPoint: function(){
		var cellLen = this.config.cellLen;
		var d = this.direction;
		var headX = this.head.x;
		var headY = this.head.y;

		switch(d){
			case "right":
				headX += cellLen;
				break;
			case "left":
				headX -= cellLen;
				break;
			case "up":
				headY -= cellLen;
				break;
			case "down":
				headY += cellLen;
				break;
		}

		return {
			x: headX,
			y: headY
		}
	}


}

module.exports = Snake;
},{"./CoorMap.js":2}],5:[function(require,module,exports){
var Snake = require("./Snake.js");
var Drawer = require("./Drawer.js");
var Box = require("./Box.js");

$(function(){
	// when DOM is ready, run this

	var boxXNum = 20;
	var boxYNum = 20;
	var cellWidth = 20;

	function initKeybordEvent(snake) {
		$(document).on("keydown", function(e){
			var keyCode = e.keyCode;
			var direction = null;
			var currentDirection = snake.getDirection();
			switch(keyCode){
				case 37:
					direction = currentDirection == "right" ? "right" : "left";
					break;
				case 38:
					direction = currentDirection == "down" ? "down" : "up";
					break;
				case 39:
					direction = currentDirection == "left" ? "left" : "right";
					break;
				case 40:
					direction = currentDirection == "up" ? "up" : "down";
					break;
				default:
					break;
			}

			if(direction != null && snake.directionLock == false){
				snake.setDirection(direction);
				snake.directionLock = true;
			}
		})
	}

	function startup() {

		var box = new Box({
			wLen: boxXNum,
			hLen: boxYNum,
			cellLen: cellWidth
		});
		box.init();

		var drawer = new Drawer(box);
		drawer.init();

		var snake = new Snake(box, drawer);
		snake.init();

		initKeybordEvent(snake);
	}


	startup();
});
},{"./Box.js":1,"./Drawer.js":3,"./Snake.js":4}]},{},[1,2,3,4,5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzbmFrZS9Cb3guanMiLCJzbmFrZS9Db29yTWFwLmpzIiwic25ha2UvRHJhd2VyLmpzIiwic25ha2UvU25ha2UuanMiLCJzbmFrZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIENvb3JNYXAgPSByZXF1aXJlKFwiLi9Db29yTWFwLmpzXCIpO1xyXG5cclxudmFyIEJveCA9IGZ1bmN0aW9uKGNvbmZpZyl7XHJcblx0dGhpcy5kYXRhU291cmNlID0gbnVsbDtcclxuXHR0aGlzLmRvbVNvdXJjZSA9IG51bGw7XHJcblx0dGhpcy5jb25maWcgPSBjb25maWc7XHJcblx0dGhpcy5wb2ludHMgPSBudWxsO1xyXG5cdHRoaXMuc25ha2UgPSBudWxsO1xyXG5cclxuXHR0aGlzLmJhc2VEb20gPSBudWxsO1xyXG59XHJcblxyXG4vLyBkYXRhU291cmNlXHJcbi8vIDAgLSBibGFua1xyXG4vLyAxIC0gc25ha2VcclxuLy8gMiAtIGdlbmVyZWF0ZSBwb2ludHNcclxuQm94LnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogQm94LFxyXG5cclxuXHRpbml0OiBmdW5jdGlvbihzbmFrZSl7XHJcblx0XHR0aGlzLnNuYWtlID0gc25ha2U7XHJcblx0XHR0aGlzLmluaXREYXRhU291cmNlQW5kRG9tKCk7XHJcblx0XHR0aGlzLmdlbmVyYXRlUG9pbnRzKCk7XHJcblx0fSxcclxuXHJcblx0aW5pdERhdGFTb3VyY2VBbmREb206IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgd0xlbiA9ICB0aGlzLmNvbmZpZy53TGVuXHJcblx0XHR2YXIgaExlbiA9IHRoaXMuY29uZmlnLmhMZW47XHJcblx0XHR2YXIgY2VsbExlbiAgPSB0aGlzLmNvbmZpZy5jZWxsTGVuO1xyXG5cclxuXHRcdHRoaXMuZGF0YVNvdXJjZSA9IG5ldyBDb29yTWFwKCk7XHJcblx0XHR0aGlzLmRvbVNvdXJjZSA9IG5ldyBDb29yTWFwKCk7XHJcblx0XHR0aGlzLnBvaW50cyA9IFtdO1xyXG5cclxuXHRcdC8vIGRyYXcgY29udGFpbmVyIGRvbVxyXG5cdFx0dmFyIHdpZHRoVG90YWwgPSBjZWxsTGVuICogd0xlbjtcclxuXHRcdHZhciBoZWlnaHRUb3RhbCA9IGNlbGxMZW4gKiBoTGVuO1xyXG5cdFx0dmFyICRib3hOb2RlID0gJChcIjxkaXYgY2xhc3M9J2JveCc+PC9kaXY+XCIpXHJcblx0XHRcdC5jc3Moe1xyXG5cdFx0XHRcdFwid2lkdGhcIjogd2lkdGhUb3RhbCArIFwicHhcIixcclxuXHRcdFx0XHRcImhlaWdodFwiOiBoZWlnaHRUb3RhbCArIFwicHhcIlxyXG5cdFx0XHR9KS5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcclxuXHRcdHRoaXMuYmFzZURvbSA9ICRib3hOb2RlO1xyXG5cclxuXHRcdHZhciB3ID0gMDtcclxuXHRcdHZhciBoID0gMDtcclxuXHJcblx0XHRmb3IgKHZhciBqPTA7ajxoTGVuO2orKyl7XHJcblx0XHRcdGZvcih2YXIgaT0wO2k8d0xlbjsgaSsrKXtcclxuXHJcblx0XHRcdFx0dmFyIHggPSBpICogY2VsbExlbjtcclxuXHRcdFx0XHR2YXIgeSA9IGogKiBjZWxsTGVuO1xyXG5cclxuXHRcdFx0XHQvLyBpbml0IGRvbVxyXG5cdFx0XHRcdCRjZWxsID0gJChcIjxkaXYgY2xhc3M9J2NlbGwnPjxkaXYgY2xhc3M9J3BvaW50IHZlcnRpY2FsLWFsaWduLW1pZGRsZSc+PC9kaXY+PC9kaXY+XCIpXHJcblx0XHRcdFx0XHQuY3NzKHtcclxuXHRcdFx0XHRcdFx0XCJ3aWR0aFwiOiBjZWxsTGVuICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0XHRcImhlaWdodFwiOiBjZWxsTGVuICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0XHRcImxlZnRcIjogeCArIFwicHhcIixcclxuXHRcdFx0XHRcdFx0XCJ0b3BcIjogeSArIFwicHhcIlxyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5hcHBlbmRUbygkYm94Tm9kZSk7XHJcblxyXG5cdFx0XHRcdC8vIGluaXQgZGF0YXNvdXJjZVxyXG5cdFx0XHRcdHRoaXMuZGF0YVNvdXJjZS5zZXQoeCwgeSwge3ZhbHVlOiAwLCBsZWFkZXI6IG51bGx9KTtcclxuXHRcdFx0XHQvLyBpbml0IGRvbVNvdXJjZVxyXG5cdFx0XHRcdHRoaXMuZG9tU291cmNlLnNldCh4LCB5LCAkY2VsbCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRnZXREYXRhU291cmNlOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHRoaXMuZGF0YVNvdXJjZTtcclxuXHR9LFxyXG5cclxuXHRnZXREb21Tb3VyY2U6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5kb21Tb3VyY2U7XHJcblx0fSxcclxuXHJcblx0Z2V0Q29uZmlnOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHRoaXMuY29uZmlnO1xyXG5cdH0sXHJcblxyXG5cdGdlbmVyYXRlUG9pbnRzOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIHdMZW4gPSB0aGlzLmNvbmZpZy53TGVuO1xyXG5cdFx0dmFyIGhMZW4gPSB0aGlzLmNvbmZpZy5oTGVuO1xyXG5cdFx0dmFyIGNlbGxMZW4gPSB0aGlzLmNvbmZpZy5jZWxsTGVuO1xyXG5cdFx0dmFyIHhDZWxsID0gbmV3IE51bWJlcih3TGVuKS5yYW5kb20oKTtcclxuXHRcdHZhciB5Q2VsbCA9IG5ldyBOdW1iZXIoaExlbikucmFuZG9tKCk7XHJcblx0XHR2YXIgeCA9IHhDZWxsICogY2VsbExlbjtcclxuXHRcdHZhciB5ID0geUNlbGwgKiBjZWxsTGVuO1xyXG5cclxuXHRcdGlmKHRoaXMuZGF0YVNvdXJjZS5nZXQoeCx5KS52YWx1ZSAhPSAwKXtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZ2VuZXJhdGVQb2ludHMoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmRhdGFTb3VyY2Uuc2V0KHgsIHksIHt2YWx1ZToyLCBsZWFkZXI6IG51bGx9KTtcclxuXHRcdHZhciAkY2VsbCA9IHRoaXMuZG9tU291cmNlLmdldCh4LHkpO1xyXG5cdFx0JChcIi5wb2ludFwiLCAkY2VsbCkuYWRkQ2xhc3MoXCJhbG9uZVwiKTtcclxuXHR9XHJcblxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCb3g7IiwidmFyIENvb3JNYXAgPSBmdW5jdGlvbigpe1xyXG5cdHRoaXMubWFwID0gbmV3IE1hcCgpO1xyXG59XHJcbkNvb3JNYXAucHJvdG90eXBlID0ge1xyXG5cdGNvbnN0cnVjdG9yOiBDb29yTWFwLFxyXG5cdGdldDogZnVuY3Rpb24oeCwgeSl7XHJcblx0XHR2YXIgayA9IG51bGw7XHJcblx0XHRmb3Ioa2V5IG9mIHRoaXMubWFwLmtleXMoKSl7XHJcblx0XHRcdGlmKGtleS54ID09IHggJiYga2V5LnkgPT0geSl7XHJcblx0XHRcdFx0ayA9IGtleTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0aGlzLm1hcC5nZXQoayk7XHJcblx0fSxcclxuXHRzZXQ6IGZ1bmN0aW9uKHgseSwgdmFsdWUpe1xyXG5cdFx0dmFyIGsgPSBudWxsO1xyXG5cdFx0Zm9yKGtleSBvZiB0aGlzLm1hcC5rZXlzKCkpe1xyXG5cdFx0XHRpZihrZXkueCA9PSB4ICYmIGtleS55ID09IHkpe1xyXG5cdFx0XHRcdGsgPSBrZXk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmKGspIHtcclxuXHRcdFx0dGhpcy5tYXAuc2V0KGssIHZhbHVlKTtcclxuXHRcdH1lbHNlIHtcclxuXHRcdFx0dGhpcy5tYXAuc2V0KHtcInhcIjp4ICwgXCJ5XCI6eX0sIHZhbHVlKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cdGdldE1hcDogZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5tYXA7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvb3JNYXA7IiwidmFyIERyYXdlciA9IGZ1bmN0aW9uKGJveCkge1xyXG5cdHRoaXMuYm94ID0gYm94O1xyXG59XHJcblxyXG5EcmF3ZXIucHJvdG90eXBlID0ge1xyXG5cdGNvbnN0cnVjdG9yOiBEcmF3ZXIsXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHR9LFxyXG5cclxuXHRub3RpZnk6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRcdCQoXCIuYm94IC5wb2ludC5zbmFrZVwiKS5yZW1vdmVDbGFzcyhcInNuYWtlXCIpO1xyXG5cclxuXHRcdHZhciBkYXRhTWFwID0gdGhpcy5ib3guZ2V0RGF0YVNvdXJjZSgpO1xyXG5cdFx0dmFyIG5vZGVNYXAgPSB0aGlzLmJveC5nZXREb21Tb3VyY2UoKTtcclxuXHRcdGZvciAodmFyIGsgb2YgZGF0YU1hcC5nZXRNYXAoKS5rZXlzKCkpIHtcclxuXHRcdFx0aWYgKGRhdGFNYXAuZ2V0KGsueCwgay55KS52YWx1ZSA9PSAxKSB7XHJcblx0XHRcdFx0dmFyICRjZWxsID0gbm9kZU1hcC5nZXQoay54LCBrLnkpO1xyXG5cdFx0XHRcdCQoXCIucG9pbnRcIiwgJGNlbGwpLmFkZENsYXNzKFwic25ha2VcIik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRub3RpZnlQb2ludHM6IGZ1bmN0aW9uKCkge1xyXG5cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRHJhd2VyOyIsInZhciBDb29yTWFwID0gcmVxdWlyZShcIi4vQ29vck1hcC5qc1wiKTtcclxuXHJcbnZhciBTbmFrZSA9IGZ1bmN0aW9uKGJveCwgZHJhd2VyKXtcclxuXHR0aGlzLmJveCA9IGJveDtcclxuXHR0aGlzLmRyYXdlciA9IGRyYXdlcjtcclxuXHR0aGlzLmNvbmZpZyA9IGJveC5nZXRDb25maWcoKTtcclxuXHR0aGlzLmRhdGFTb3VyY2UgPSBib3guZ2V0RGF0YVNvdXJjZSgpO1xyXG5cdHRoaXMuZG9tU291cmNlID0gYm94LmdldERvbVNvdXJjZSgpO1xyXG5cclxuXHR0aGlzLmRpcmVjdGlvbiA9IG51bGw7IC8vIGxlZnQsIHJpZ2h0LCB1cCwgZG93blxyXG5cdHRoaXMuZGlyZWN0aW9uTG9jayA9IGZhbHNlO1xyXG5cclxuXHR0aGlzLmhlYWQgPSBudWxsO1xyXG5cdHRoaXMudGFpbCA9IG51bGw7XHJcblxyXG5cdHRoaXMuaGFuZGxlciA9IG51bGw7XHJcbn1cclxuXHJcblNuYWtlLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogU25ha2UsXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKGJveCl7XHJcblx0XHR2YXIgd0xlbiA9IHRoaXMuY29uZmlnLndMZW47XHJcblx0XHR2YXIgaExlbiA9IHRoaXMuY29uZmlnLmhMZW47XHJcblx0XHR2YXIgY2VsbExlbiA9IHRoaXMuY29uZmlnLmNlbGxMZW47XHJcblxyXG5cdFx0Ly8gd2hlbiBpbml0LCB0aGUgc25ha2UgaGFzIHR3byBwb2ludHNcclxuXHRcdC8vIGZpcnN0IHBvaW50XHJcblx0XHR2YXIgY2VudGVyWCA9IHBhcnNlSW50KHdMZW4gLyAyLCAxMCkgKiBjZWxsTGVuO1xyXG5cdFx0dmFyIGNlbnRlclkgPSBwYXJzZUludChoTGVuIC8gMiwgMTApICogY2VsbExlbjtcclxuXHRcdHRoaXMuZGF0YVNvdXJjZS5zZXQoY2VudGVyWCwgY2VudGVyWSwge3ZhbHVlOiAxLCBsZWFkZXI6IG51bGx9KTtcclxuXHRcdHRoaXMuaGVhZCA9IHtcclxuXHRcdFx0eDogY2VudGVyWCxcclxuXHRcdFx0eTogY2VudGVyWVxyXG5cdFx0fVxyXG5cdFx0Ly8gc2Vjb25kIHBvaW50XHJcblx0XHR2YXIgY2VudGVyWDIgPSBjZW50ZXJYIC0gY2VsbExlbjtcclxuXHRcdHZhciBjZW50ZXJZMiA9IGNlbnRlclk7XHJcblx0XHR0aGlzLmRhdGFTb3VyY2Uuc2V0KGNlbnRlclgyLCBjZW50ZXJZMiwge3ZhbHVlOiAxLCBsZWFkZXI6IHRoaXMuaGVhZH0pO1xyXG5cdFx0dGhpcy5kaXJlY3Rpb24gPSBcInJpZ2h0XCI7XHJcblx0XHR0aGlzLnRhaWwgPSB7XHJcblx0XHRcdHg6IGNlbnRlclgyLFxyXG5cdFx0XHR5OiBjZW50ZXJZMlxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuZHJhd2VyLm5vdGlmeSgpO1xyXG5cclxuXHRcdHRoaXMuc3RhcnRTbmFrZSgpO1xyXG5cclxuXHR9LFxyXG5cclxuXHRzdGFydFNuYWtlOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIF90aGlzID0gdGhpcztcclxuXHRcdHRoaXMuaGFuZGxlciA9IHNldEludGVydmFsKGZ1bmN0aW9uKCl7XHJcblx0XHRcdF90aGlzLm1vdmUoKTtcclxuXHRcdH0sIDEwMCk7XHJcblx0fSxcclxuXHJcblx0bW92ZTogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBuZXh0ID0gdGhpcy5fZ2V0TmV4dFBvaW50KCk7XHJcblx0XHRpZih0aGlzLmNoZWNrSGl0KG5leHQpID09PSB0cnVlKXtcclxuXHRcdFx0Y2xlYXJJbnRlcnZhbCh0aGlzLmhhbmRsZXIpO1xyXG5cdFx0XHR2YXIgcmVzdGFydEZsZyA9IGNvbmZpcm0oXCJnYW1lIG92ZXIgISByZXN0YXJ0ID9cIik7XHJcblx0XHRcdGlmKHJlc3RhcnRGbGcgPT09IHRydWUpe1xyXG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBub3RoaW5nIHRvZG9cclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gaGVhZCBtb3ZlXHJcblx0XHRcdHZhciBlYXRGbGcgPSBmYWxzZTtcclxuXHRcdFx0aWYodGhpcy5kYXRhU291cmNlLmdldChuZXh0LngsIG5leHQueSkudmFsdWUgPT0gMil7XHJcblx0XHRcdFx0Ly8gZWF0IVxyXG5cdFx0XHRcdGVhdEZsZyA9IHRydWU7XHJcblx0XHRcdFx0dmFyICRjZWxsID0gdGhpcy5kb21Tb3VyY2UuZ2V0KG5leHQueCwgbmV4dC55KTtcclxuXHRcdFx0XHQkKFwiLnBvaW50XCIsICRjZWxsKS5yZW1vdmVDbGFzcyhcImFsb25lXCIpO1xyXG5cdFx0XHRcdHRoaXMuYm94LmdlbmVyYXRlUG9pbnRzKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5kYXRhU291cmNlLmdldCh0aGlzLmhlYWQueCwgdGhpcy5oZWFkLnkpLmxlYWRlciA9IG5leHQ7XHJcblx0XHRcdHRoaXMuZGF0YVNvdXJjZS5zZXQobmV4dC54LCBuZXh0LnksIHt2YWx1ZTogMSwgbGVhZGVyOiBudWxsfSk7XHJcblx0XHRcdHRoaXMuaGVhZCA9IG5leHQ7XHJcblxyXG5cdFx0XHQvLyB0YWlsIG1vdmVcclxuXHRcdFx0aWYoZWF0RmxnICE9IHRydWUpIHtcclxuXHRcdFx0XHR2YXIgdGFpbFggPSB0aGlzLnRhaWwueDtcclxuXHRcdFx0XHR2YXIgdGFpbFkgPSB0aGlzLnRhaWwueTtcclxuXHRcdFx0XHR0aGlzLnRhaWwgPSB0aGlzLmRhdGFTb3VyY2UuZ2V0KHRhaWxYLCB0YWlsWSkubGVhZGVyO1xyXG5cdFx0XHRcdHRoaXMuZGF0YVNvdXJjZS5zZXQodGFpbFgsIHRhaWxZLCB7dmFsdWU6MCwgbGVhZGVyOiBudWxsfSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuZGlyZWN0aW9uTG9jayA9IGZhbHNlO1xyXG5cclxuXHRcdFx0Ly8gZHJhd1xyXG5cdFx0XHR0aGlzLmRyYXdlci5ub3RpZnkoKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRjaGVja0hpdDogZnVuY3Rpb24ocG9pbnQpe1xyXG5cdFx0dmFyIGNlbGwgPSB0aGlzLmRhdGFTb3VyY2UuZ2V0KHBvaW50LngsIHBvaW50LnkpO1xyXG5cdFx0Y29uc29sZS5sb2coY2VsbCk7XHJcblx0XHRpZighY2VsbCl7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0aWYoY2VsbC52YWx1ZSA9PSAxKXtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fSxcclxuXHJcblx0c2V0RGlyZWN0aW9uOiBmdW5jdGlvbihkaXJlY3Rpb24pe1xyXG5cdFx0dGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcblx0fSxcclxuXHJcblx0Z2V0RGlyZWN0aW9uOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHRoaXMuZGlyZWN0aW9uO1xyXG5cdH0sXHJcblxyXG5cdF9nZXROZXh0UG9pbnQ6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY2VsbExlbiA9IHRoaXMuY29uZmlnLmNlbGxMZW47XHJcblx0XHR2YXIgZCA9IHRoaXMuZGlyZWN0aW9uO1xyXG5cdFx0dmFyIGhlYWRYID0gdGhpcy5oZWFkLng7XHJcblx0XHR2YXIgaGVhZFkgPSB0aGlzLmhlYWQueTtcclxuXHJcblx0XHRzd2l0Y2goZCl7XHJcblx0XHRcdGNhc2UgXCJyaWdodFwiOlxyXG5cdFx0XHRcdGhlYWRYICs9IGNlbGxMZW47XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJsZWZ0XCI6XHJcblx0XHRcdFx0aGVhZFggLT0gY2VsbExlbjtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcInVwXCI6XHJcblx0XHRcdFx0aGVhZFkgLT0gY2VsbExlbjtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImRvd25cIjpcclxuXHRcdFx0XHRoZWFkWSArPSBjZWxsTGVuO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHg6IGhlYWRYLFxyXG5cdFx0XHR5OiBoZWFkWVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNuYWtlOyIsInZhciBTbmFrZSA9IHJlcXVpcmUoXCIuL1NuYWtlLmpzXCIpO1xyXG52YXIgRHJhd2VyID0gcmVxdWlyZShcIi4vRHJhd2VyLmpzXCIpO1xyXG52YXIgQm94ID0gcmVxdWlyZShcIi4vQm94LmpzXCIpO1xyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cdC8vIHdoZW4gRE9NIGlzIHJlYWR5LCBydW4gdGhpc1xyXG5cclxuXHR2YXIgYm94WE51bSA9IDIwO1xyXG5cdHZhciBib3hZTnVtID0gMjA7XHJcblx0dmFyIGNlbGxXaWR0aCA9IDIwO1xyXG5cclxuXHRmdW5jdGlvbiBpbml0S2V5Ym9yZEV2ZW50KHNuYWtlKSB7XHJcblx0XHQkKGRvY3VtZW50KS5vbihcImtleWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRcdHZhciBrZXlDb2RlID0gZS5rZXlDb2RlO1xyXG5cdFx0XHR2YXIgZGlyZWN0aW9uID0gbnVsbDtcclxuXHRcdFx0dmFyIGN1cnJlbnREaXJlY3Rpb24gPSBzbmFrZS5nZXREaXJlY3Rpb24oKTtcclxuXHRcdFx0c3dpdGNoKGtleUNvZGUpe1xyXG5cdFx0XHRcdGNhc2UgMzc6XHJcblx0XHRcdFx0XHRkaXJlY3Rpb24gPSBjdXJyZW50RGlyZWN0aW9uID09IFwicmlnaHRcIiA/IFwicmlnaHRcIiA6IFwibGVmdFwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzODpcclxuXHRcdFx0XHRcdGRpcmVjdGlvbiA9IGN1cnJlbnREaXJlY3Rpb24gPT0gXCJkb3duXCIgPyBcImRvd25cIiA6IFwidXBcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMzk6XHJcblx0XHRcdFx0XHRkaXJlY3Rpb24gPSBjdXJyZW50RGlyZWN0aW9uID09IFwibGVmdFwiID8gXCJsZWZ0XCIgOiBcInJpZ2h0XCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDQwOlxyXG5cdFx0XHRcdFx0ZGlyZWN0aW9uID0gY3VycmVudERpcmVjdGlvbiA9PSBcInVwXCIgPyBcInVwXCIgOiBcImRvd25cIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYoZGlyZWN0aW9uICE9IG51bGwgJiYgc25ha2UuZGlyZWN0aW9uTG9jayA9PSBmYWxzZSl7XHJcblx0XHRcdFx0c25ha2Uuc2V0RGlyZWN0aW9uKGRpcmVjdGlvbik7XHJcblx0XHRcdFx0c25ha2UuZGlyZWN0aW9uTG9jayA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzdGFydHVwKCkge1xyXG5cclxuXHRcdHZhciBib3ggPSBuZXcgQm94KHtcclxuXHRcdFx0d0xlbjogYm94WE51bSxcclxuXHRcdFx0aExlbjogYm94WU51bSxcclxuXHRcdFx0Y2VsbExlbjogY2VsbFdpZHRoXHJcblx0XHR9KTtcclxuXHRcdGJveC5pbml0KCk7XHJcblxyXG5cdFx0dmFyIGRyYXdlciA9IG5ldyBEcmF3ZXIoYm94KTtcclxuXHRcdGRyYXdlci5pbml0KCk7XHJcblxyXG5cdFx0dmFyIHNuYWtlID0gbmV3IFNuYWtlKGJveCwgZHJhd2VyKTtcclxuXHRcdHNuYWtlLmluaXQoKTtcclxuXHJcblx0XHRpbml0S2V5Ym9yZEV2ZW50KHNuYWtlKTtcclxuXHR9XHJcblxyXG5cclxuXHRzdGFydHVwKCk7XHJcbn0pOyJdfQ==
