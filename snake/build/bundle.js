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

	this.head = null;
	this.tail = null;
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

		var _this = this;
		var handler = setInterval(function(){
			_this.move();
		}, 50);
	},

	move: function(){
		if(this.checkHit() === true){

		} else {
			// head move
			var eatFlg = false;
			var next = this._getNextPoint();
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

			// draw
			this.drawer.notify();
		}
	},

	checkHit: function(){
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

			if(direction != null){
				snake.setDirection(direction);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL1VzZXJzL3poYW9faG9uZ3NoZW5nL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzbmFrZS9Cb3guanMiLCJzbmFrZS9Db29yTWFwLmpzIiwic25ha2UvRHJhd2VyLmpzIiwic25ha2UvU25ha2UuanMiLCJzbmFrZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQ29vck1hcCA9IHJlcXVpcmUoXCIuL0Nvb3JNYXAuanNcIik7XHJcblxyXG52YXIgQm94ID0gZnVuY3Rpb24oY29uZmlnKXtcclxuXHR0aGlzLmRhdGFTb3VyY2UgPSBudWxsO1xyXG5cdHRoaXMuZG9tU291cmNlID0gbnVsbDtcclxuXHR0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuXHR0aGlzLnBvaW50cyA9IG51bGw7XHJcblx0dGhpcy5zbmFrZSA9IG51bGw7XHJcblxyXG5cdHRoaXMuYmFzZURvbSA9IG51bGw7XHJcbn1cclxuXHJcbi8vIGRhdGFTb3VyY2VcclxuLy8gMCAtIGJsYW5rXHJcbi8vIDEgLSBzbmFrZVxyXG4vLyAyIC0gZ2VuZXJlYXRlIHBvaW50c1xyXG5Cb3gucHJvdG90eXBlID0ge1xyXG5cdGNvbnN0cnVjdG9yOiBCb3gsXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKHNuYWtlKXtcclxuXHRcdHRoaXMuc25ha2UgPSBzbmFrZTtcclxuXHRcdHRoaXMuaW5pdERhdGFTb3VyY2VBbmREb20oKTtcclxuXHRcdHRoaXMuZ2VuZXJhdGVQb2ludHMoKTtcclxuXHR9LFxyXG5cclxuXHRpbml0RGF0YVNvdXJjZUFuZERvbTogZnVuY3Rpb24oKXtcclxuXHRcdHZhciB3TGVuID0gIHRoaXMuY29uZmlnLndMZW5cclxuXHRcdHZhciBoTGVuID0gdGhpcy5jb25maWcuaExlbjtcclxuXHRcdHZhciBjZWxsTGVuICA9IHRoaXMuY29uZmlnLmNlbGxMZW47XHJcblxyXG5cdFx0dGhpcy5kYXRhU291cmNlID0gbmV3IENvb3JNYXAoKTtcclxuXHRcdHRoaXMuZG9tU291cmNlID0gbmV3IENvb3JNYXAoKTtcclxuXHRcdHRoaXMucG9pbnRzID0gW107XHJcblxyXG5cdFx0Ly8gZHJhdyBjb250YWluZXIgZG9tXHJcblx0XHR2YXIgd2lkdGhUb3RhbCA9IGNlbGxMZW4gKiB3TGVuO1xyXG5cdFx0dmFyIGhlaWdodFRvdGFsID0gY2VsbExlbiAqIGhMZW47XHJcblx0XHR2YXIgJGJveE5vZGUgPSAkKFwiPGRpdiBjbGFzcz0nYm94Jz48L2Rpdj5cIilcclxuXHRcdFx0LmNzcyh7XHJcblx0XHRcdFx0XCJ3aWR0aFwiOiB3aWR0aFRvdGFsICsgXCJweFwiLFxyXG5cdFx0XHRcdFwiaGVpZ2h0XCI6IGhlaWdodFRvdGFsICsgXCJweFwiXHJcblx0XHRcdH0pLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xyXG5cdFx0dGhpcy5iYXNlRG9tID0gJGJveE5vZGU7XHJcblxyXG5cdFx0dmFyIHcgPSAwO1xyXG5cdFx0dmFyIGggPSAwO1xyXG5cclxuXHRcdGZvciAodmFyIGo9MDtqPGhMZW47aisrKXtcclxuXHRcdFx0Zm9yKHZhciBpPTA7aTx3TGVuOyBpKyspe1xyXG5cclxuXHRcdFx0XHR2YXIgeCA9IGkgKiBjZWxsTGVuO1xyXG5cdFx0XHRcdHZhciB5ID0gaiAqIGNlbGxMZW47XHJcblxyXG5cdFx0XHRcdC8vIGluaXQgZG9tXHJcblx0XHRcdFx0JGNlbGwgPSAkKFwiPGRpdiBjbGFzcz0nY2VsbCc+PGRpdiBjbGFzcz0ncG9pbnQgdmVydGljYWwtYWxpZ24tbWlkZGxlJz48L2Rpdj48L2Rpdj5cIilcclxuXHRcdFx0XHRcdC5jc3Moe1xyXG5cdFx0XHRcdFx0XHRcIndpZHRoXCI6IGNlbGxMZW4gKyBcInB4XCIsXHJcblx0XHRcdFx0XHRcdFwiaGVpZ2h0XCI6IGNlbGxMZW4gKyBcInB4XCIsXHJcblx0XHRcdFx0XHRcdFwibGVmdFwiOiB4ICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0XHRcInRvcFwiOiB5ICsgXCJweFwiXHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0LmFwcGVuZFRvKCRib3hOb2RlKTtcclxuXHJcblx0XHRcdFx0Ly8gaW5pdCBkYXRhc291cmNlXHJcblx0XHRcdFx0dGhpcy5kYXRhU291cmNlLnNldCh4LCB5LCB7dmFsdWU6IDAsIGxlYWRlcjogbnVsbH0pO1xyXG5cdFx0XHRcdC8vIGluaXQgZG9tU291cmNlXHJcblx0XHRcdFx0dGhpcy5kb21Tb3VyY2Uuc2V0KHgsIHksICRjZWxsKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGdldERhdGFTb3VyY2U6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5kYXRhU291cmNlO1xyXG5cdH0sXHJcblxyXG5cdGdldERvbVNvdXJjZTogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiB0aGlzLmRvbVNvdXJjZTtcclxuXHR9LFxyXG5cclxuXHRnZXRDb25maWc6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5jb25maWc7XHJcblx0fSxcclxuXHJcblx0Z2VuZXJhdGVQb2ludHM6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgd0xlbiA9IHRoaXMuY29uZmlnLndMZW47XHJcblx0XHR2YXIgaExlbiA9IHRoaXMuY29uZmlnLmhMZW47XHJcblx0XHR2YXIgY2VsbExlbiA9IHRoaXMuY29uZmlnLmNlbGxMZW47XHJcblx0XHR2YXIgeENlbGwgPSBuZXcgTnVtYmVyKHdMZW4pLnJhbmRvbSgpO1xyXG5cdFx0dmFyIHlDZWxsID0gbmV3IE51bWJlcihoTGVuKS5yYW5kb20oKTtcclxuXHRcdHZhciB4ID0geENlbGwgKiBjZWxsTGVuO1xyXG5cdFx0dmFyIHkgPSB5Q2VsbCAqIGNlbGxMZW47XHJcblxyXG5cdFx0aWYodGhpcy5kYXRhU291cmNlLmdldCh4LHkpLnZhbHVlICE9IDApe1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5nZW5lcmF0ZVBvaW50cygpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuZGF0YVNvdXJjZS5zZXQoeCwgeSwge3ZhbHVlOjIsIGxlYWRlcjogbnVsbH0pO1xyXG5cdFx0dmFyICRjZWxsID0gdGhpcy5kb21Tb3VyY2UuZ2V0KHgseSk7XHJcblx0XHQkKFwiLnBvaW50XCIsICRjZWxsKS5hZGRDbGFzcyhcImFsb25lXCIpO1xyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJveDsiLCJ2YXIgQ29vck1hcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5tYXAgPSBuZXcgTWFwKCk7XHJcbn1cclxuQ29vck1hcC5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IENvb3JNYXAsXHJcblx0Z2V0OiBmdW5jdGlvbih4LCB5KXtcclxuXHRcdHZhciBrID0gbnVsbDtcclxuXHRcdGZvcihrZXkgb2YgdGhpcy5tYXAua2V5cygpKXtcclxuXHRcdFx0aWYoa2V5LnggPT0geCAmJiBrZXkueSA9PSB5KXtcclxuXHRcdFx0XHRrID0ga2V5O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMubWFwLmdldChrKTtcclxuXHR9LFxyXG5cdHNldDogZnVuY3Rpb24oeCx5LCB2YWx1ZSl7XHJcblx0XHR2YXIgayA9IG51bGw7XHJcblx0XHRmb3Ioa2V5IG9mIHRoaXMubWFwLmtleXMoKSl7XHJcblx0XHRcdGlmKGtleS54ID09IHggJiYga2V5LnkgPT0geSl7XHJcblx0XHRcdFx0ayA9IGtleTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYoaykge1xyXG5cdFx0XHR0aGlzLm1hcC5zZXQoaywgdmFsdWUpO1xyXG5cdFx0fWVsc2Uge1xyXG5cdFx0XHR0aGlzLm1hcC5zZXQoe1wieFwiOnggLCBcInlcIjp5fSwgdmFsdWUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0Z2V0TWFwOiBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB0aGlzLm1hcDtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29vck1hcDsiLCJ2YXIgRHJhd2VyID0gZnVuY3Rpb24oYm94KSB7XHJcblx0dGhpcy5ib3ggPSBib3g7XHJcbn1cclxuXHJcbkRyYXdlci5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IERyYXdlcixcclxuXHJcblx0aW5pdDogZnVuY3Rpb24oKSB7XHJcblxyXG5cdH0sXHJcblxyXG5cdG5vdGlmeTogZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0JChcIi5ib3ggLnBvaW50LnNuYWtlXCIpLnJlbW92ZUNsYXNzKFwic25ha2VcIik7XHJcblxyXG5cdFx0dmFyIGRhdGFNYXAgPSB0aGlzLmJveC5nZXREYXRhU291cmNlKCk7XHJcblx0XHR2YXIgbm9kZU1hcCA9IHRoaXMuYm94LmdldERvbVNvdXJjZSgpO1xyXG5cdFx0Zm9yICh2YXIgayBvZiBkYXRhTWFwLmdldE1hcCgpLmtleXMoKSkge1xyXG5cdFx0XHRpZiAoZGF0YU1hcC5nZXQoay54LCBrLnkpLnZhbHVlID09IDEpIHtcclxuXHRcdFx0XHR2YXIgJGNlbGwgPSBub2RlTWFwLmdldChrLngsIGsueSk7XHJcblx0XHRcdFx0JChcIi5wb2ludFwiLCAkY2VsbCkuYWRkQ2xhc3MoXCJzbmFrZVwiKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdG5vdGlmeVBvaW50czogZnVuY3Rpb24oKSB7XHJcblxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEcmF3ZXI7IiwidmFyIENvb3JNYXAgPSByZXF1aXJlKFwiLi9Db29yTWFwLmpzXCIpO1xyXG5cclxudmFyIFNuYWtlID0gZnVuY3Rpb24oYm94LCBkcmF3ZXIpe1xyXG5cdHRoaXMuYm94ID0gYm94O1xyXG5cdHRoaXMuZHJhd2VyID0gZHJhd2VyO1xyXG5cdHRoaXMuY29uZmlnID0gYm94LmdldENvbmZpZygpO1xyXG5cdHRoaXMuZGF0YVNvdXJjZSA9IGJveC5nZXREYXRhU291cmNlKCk7XHJcblx0dGhpcy5kb21Tb3VyY2UgPSBib3guZ2V0RG9tU291cmNlKCk7XHJcblx0dGhpcy5kaXJlY3Rpb24gPSBudWxsOyAvLyBsZWZ0LCByaWdodCwgdXAsIGRvd25cclxuXHJcblx0dGhpcy5oZWFkID0gbnVsbDtcclxuXHR0aGlzLnRhaWwgPSBudWxsO1xyXG59XHJcblxyXG5TbmFrZS5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IFNuYWtlLFxyXG5cclxuXHRpbml0OiBmdW5jdGlvbihib3gpe1xyXG5cdFx0dmFyIHdMZW4gPSB0aGlzLmNvbmZpZy53TGVuO1xyXG5cdFx0dmFyIGhMZW4gPSB0aGlzLmNvbmZpZy5oTGVuO1xyXG5cdFx0dmFyIGNlbGxMZW4gPSB0aGlzLmNvbmZpZy5jZWxsTGVuO1xyXG5cclxuXHRcdC8vIHdoZW4gaW5pdCwgdGhlIHNuYWtlIGhhcyB0d28gcG9pbnRzXHJcblx0XHQvLyBmaXJzdCBwb2ludFxyXG5cdFx0dmFyIGNlbnRlclggPSBwYXJzZUludCh3TGVuIC8gMiwgMTApICogY2VsbExlbjtcclxuXHRcdHZhciBjZW50ZXJZID0gcGFyc2VJbnQoaExlbiAvIDIsIDEwKSAqIGNlbGxMZW47XHJcblx0XHR0aGlzLmRhdGFTb3VyY2Uuc2V0KGNlbnRlclgsIGNlbnRlclksIHt2YWx1ZTogMSwgbGVhZGVyOiBudWxsfSk7XHJcblx0XHR0aGlzLmhlYWQgPSB7XHJcblx0XHRcdHg6IGNlbnRlclgsXHJcblx0XHRcdHk6IGNlbnRlcllcclxuXHRcdH1cclxuXHRcdC8vIHNlY29uZCBwb2ludFxyXG5cdFx0dmFyIGNlbnRlclgyID0gY2VudGVyWCAtIGNlbGxMZW47XHJcblx0XHR2YXIgY2VudGVyWTIgPSBjZW50ZXJZO1xyXG5cdFx0dGhpcy5kYXRhU291cmNlLnNldChjZW50ZXJYMiwgY2VudGVyWTIsIHt2YWx1ZTogMSwgbGVhZGVyOiB0aGlzLmhlYWR9KTtcclxuXHRcdHRoaXMuZGlyZWN0aW9uID0gXCJyaWdodFwiO1xyXG5cdFx0dGhpcy50YWlsID0ge1xyXG5cdFx0XHR4OiBjZW50ZXJYMixcclxuXHRcdFx0eTogY2VudGVyWTJcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmRyYXdlci5ub3RpZnkoKTtcclxuXHJcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xyXG5cdFx0dmFyIGhhbmRsZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xyXG5cdFx0XHRfdGhpcy5tb3ZlKCk7XHJcblx0XHR9LCA1MCk7XHJcblx0fSxcclxuXHJcblx0bW92ZTogZnVuY3Rpb24oKXtcclxuXHRcdGlmKHRoaXMuY2hlY2tIaXQoKSA9PT0gdHJ1ZSl7XHJcblxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gaGVhZCBtb3ZlXHJcblx0XHRcdHZhciBlYXRGbGcgPSBmYWxzZTtcclxuXHRcdFx0dmFyIG5leHQgPSB0aGlzLl9nZXROZXh0UG9pbnQoKTtcclxuXHRcdFx0aWYodGhpcy5kYXRhU291cmNlLmdldChuZXh0LngsIG5leHQueSkudmFsdWUgPT0gMil7XHJcblx0XHRcdFx0Ly8gZWF0IVxyXG5cdFx0XHRcdGVhdEZsZyA9IHRydWU7XHJcblx0XHRcdFx0dmFyICRjZWxsID0gdGhpcy5kb21Tb3VyY2UuZ2V0KG5leHQueCwgbmV4dC55KTtcclxuXHRcdFx0XHQkKFwiLnBvaW50XCIsICRjZWxsKS5yZW1vdmVDbGFzcyhcImFsb25lXCIpO1xyXG5cdFx0XHRcdHRoaXMuYm94LmdlbmVyYXRlUG9pbnRzKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5kYXRhU291cmNlLmdldCh0aGlzLmhlYWQueCwgdGhpcy5oZWFkLnkpLmxlYWRlciA9IG5leHQ7XHJcblx0XHRcdHRoaXMuZGF0YVNvdXJjZS5zZXQobmV4dC54LCBuZXh0LnksIHt2YWx1ZTogMSwgbGVhZGVyOiBudWxsfSk7XHJcblx0XHRcdHRoaXMuaGVhZCA9IG5leHQ7XHJcblxyXG5cdFx0XHQvLyB0YWlsIG1vdmVcclxuXHRcdFx0aWYoZWF0RmxnICE9IHRydWUpIHtcclxuXHRcdFx0XHR2YXIgdGFpbFggPSB0aGlzLnRhaWwueDtcclxuXHRcdFx0XHR2YXIgdGFpbFkgPSB0aGlzLnRhaWwueTtcclxuXHRcdFx0XHR0aGlzLnRhaWwgPSB0aGlzLmRhdGFTb3VyY2UuZ2V0KHRhaWxYLCB0YWlsWSkubGVhZGVyO1xyXG5cdFx0XHRcdHRoaXMuZGF0YVNvdXJjZS5zZXQodGFpbFgsIHRhaWxZLCB7dmFsdWU6MCwgbGVhZGVyOiBudWxsfSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIGRyYXdcclxuXHRcdFx0dGhpcy5kcmF3ZXIubm90aWZ5KCk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Y2hlY2tIaXQ6IGZ1bmN0aW9uKCl7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fSxcclxuXHJcblx0c2V0RGlyZWN0aW9uOiBmdW5jdGlvbihkaXJlY3Rpb24pe1xyXG5cdFx0dGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcblx0fSxcclxuXHJcblx0Z2V0RGlyZWN0aW9uOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHRoaXMuZGlyZWN0aW9uO1xyXG5cdH0sXHJcblxyXG5cdF9nZXROZXh0UG9pbnQ6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY2VsbExlbiA9IHRoaXMuY29uZmlnLmNlbGxMZW47XHJcblx0XHR2YXIgZCA9IHRoaXMuZGlyZWN0aW9uO1xyXG5cdFx0dmFyIGhlYWRYID0gdGhpcy5oZWFkLng7XHJcblx0XHR2YXIgaGVhZFkgPSB0aGlzLmhlYWQueTtcclxuXHJcblx0XHRzd2l0Y2goZCl7XHJcblx0XHRcdGNhc2UgXCJyaWdodFwiOlxyXG5cdFx0XHRcdGhlYWRYICs9IGNlbGxMZW47XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJsZWZ0XCI6XHJcblx0XHRcdFx0aGVhZFggLT0gY2VsbExlbjtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcInVwXCI6XHJcblx0XHRcdFx0aGVhZFkgLT0gY2VsbExlbjtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImRvd25cIjpcclxuXHRcdFx0XHRoZWFkWSArPSBjZWxsTGVuO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHg6IGhlYWRYLFxyXG5cdFx0XHR5OiBoZWFkWVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNuYWtlOyIsInZhciBTbmFrZSA9IHJlcXVpcmUoXCIuL1NuYWtlLmpzXCIpO1xyXG52YXIgRHJhd2VyID0gcmVxdWlyZShcIi4vRHJhd2VyLmpzXCIpO1xyXG52YXIgQm94ID0gcmVxdWlyZShcIi4vQm94LmpzXCIpO1xyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cdC8vIHdoZW4gRE9NIGlzIHJlYWR5LCBydW4gdGhpc1xyXG5cclxuXHR2YXIgYm94WE51bSA9IDIwO1xyXG5cdHZhciBib3hZTnVtID0gMjA7XHJcblx0dmFyIGNlbGxXaWR0aCA9IDIwO1xyXG5cclxuXHRmdW5jdGlvbiBpbml0S2V5Ym9yZEV2ZW50KHNuYWtlKSB7XHJcblx0XHQkKGRvY3VtZW50KS5vbihcImtleWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRcdHZhciBrZXlDb2RlID0gZS5rZXlDb2RlO1xyXG5cdFx0XHR2YXIgZGlyZWN0aW9uID0gbnVsbDtcclxuXHRcdFx0dmFyIGN1cnJlbnREaXJlY3Rpb24gPSBzbmFrZS5nZXREaXJlY3Rpb24oKTtcclxuXHRcdFx0c3dpdGNoKGtleUNvZGUpe1xyXG5cdFx0XHRcdGNhc2UgMzc6XHJcblx0XHRcdFx0XHRkaXJlY3Rpb24gPSBjdXJyZW50RGlyZWN0aW9uID09IFwicmlnaHRcIiA/IFwicmlnaHRcIiA6IFwibGVmdFwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzODpcclxuXHRcdFx0XHRcdGRpcmVjdGlvbiA9IGN1cnJlbnREaXJlY3Rpb24gPT0gXCJkb3duXCIgPyBcImRvd25cIiA6IFwidXBcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMzk6XHJcblx0XHRcdFx0XHRkaXJlY3Rpb24gPSBjdXJyZW50RGlyZWN0aW9uID09IFwibGVmdFwiID8gXCJsZWZ0XCIgOiBcInJpZ2h0XCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDQwOlxyXG5cdFx0XHRcdFx0ZGlyZWN0aW9uID0gY3VycmVudERpcmVjdGlvbiA9PSBcInVwXCIgPyBcInVwXCIgOiBcImRvd25cIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYoZGlyZWN0aW9uICE9IG51bGwpe1xyXG5cdFx0XHRcdHNuYWtlLnNldERpcmVjdGlvbihkaXJlY3Rpb24pO1xyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc3RhcnR1cCgpIHtcclxuXHJcblx0XHR2YXIgYm94ID0gbmV3IEJveCh7XHJcblx0XHRcdHdMZW46IGJveFhOdW0sXHJcblx0XHRcdGhMZW46IGJveFlOdW0sXHJcblx0XHRcdGNlbGxMZW46IGNlbGxXaWR0aFxyXG5cdFx0fSk7XHJcblx0XHRib3guaW5pdCgpO1xyXG5cclxuXHRcdHZhciBkcmF3ZXIgPSBuZXcgRHJhd2VyKGJveCk7XHJcblx0XHRkcmF3ZXIuaW5pdCgpO1xyXG5cclxuXHRcdHZhciBzbmFrZSA9IG5ldyBTbmFrZShib3gsIGRyYXdlcik7XHJcblx0XHRzbmFrZS5pbml0KCk7XHJcblxyXG5cdFx0aW5pdEtleWJvcmRFdmVudChzbmFrZSk7XHJcblx0fVxyXG5cclxuXHJcblx0c3RhcnR1cCgpO1xyXG59KTsiXX0=
