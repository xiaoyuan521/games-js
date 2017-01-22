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

var SNAKE_SPPED = 200;

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
		}, SNAKE_SPPED);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL1VzZXJzL3poYW9faG9uZ3NoZW5nL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzbmFrZS9Cb3guanMiLCJzbmFrZS9Db29yTWFwLmpzIiwic25ha2UvRHJhd2VyLmpzIiwic25ha2UvU25ha2UuanMiLCJzbmFrZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBDb29yTWFwID0gcmVxdWlyZShcIi4vQ29vck1hcC5qc1wiKTtcclxuXHJcbnZhciBCb3ggPSBmdW5jdGlvbihjb25maWcpe1xyXG5cdHRoaXMuZGF0YVNvdXJjZSA9IG51bGw7XHJcblx0dGhpcy5kb21Tb3VyY2UgPSBudWxsO1xyXG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdHRoaXMucG9pbnRzID0gbnVsbDtcclxuXHR0aGlzLnNuYWtlID0gbnVsbDtcclxuXHJcblx0dGhpcy5iYXNlRG9tID0gbnVsbDtcclxufVxyXG5cclxuLy8gZGF0YVNvdXJjZVxyXG4vLyAwIC0gYmxhbmtcclxuLy8gMSAtIHNuYWtlXHJcbi8vIDIgLSBnZW5lcmVhdGUgcG9pbnRzXHJcbkJveC5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IEJveCxcclxuXHJcblx0aW5pdDogZnVuY3Rpb24oc25ha2Upe1xyXG5cdFx0dGhpcy5zbmFrZSA9IHNuYWtlO1xyXG5cdFx0dGhpcy5pbml0RGF0YVNvdXJjZUFuZERvbSgpO1xyXG5cdFx0dGhpcy5nZW5lcmF0ZVBvaW50cygpO1xyXG5cdH0sXHJcblxyXG5cdGluaXREYXRhU291cmNlQW5kRG9tOiBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIHdMZW4gPSAgdGhpcy5jb25maWcud0xlblxyXG5cdFx0dmFyIGhMZW4gPSB0aGlzLmNvbmZpZy5oTGVuO1xyXG5cdFx0dmFyIGNlbGxMZW4gID0gdGhpcy5jb25maWcuY2VsbExlbjtcclxuXHJcblx0XHR0aGlzLmRhdGFTb3VyY2UgPSBuZXcgQ29vck1hcCgpO1xyXG5cdFx0dGhpcy5kb21Tb3VyY2UgPSBuZXcgQ29vck1hcCgpO1xyXG5cdFx0dGhpcy5wb2ludHMgPSBbXTtcclxuXHJcblx0XHQvLyBkcmF3IGNvbnRhaW5lciBkb21cclxuXHRcdHZhciB3aWR0aFRvdGFsID0gY2VsbExlbiAqIHdMZW47XHJcblx0XHR2YXIgaGVpZ2h0VG90YWwgPSBjZWxsTGVuICogaExlbjtcclxuXHRcdHZhciAkYm94Tm9kZSA9ICQoXCI8ZGl2IGNsYXNzPSdib3gnPjwvZGl2PlwiKVxyXG5cdFx0XHQuY3NzKHtcclxuXHRcdFx0XHRcIndpZHRoXCI6IHdpZHRoVG90YWwgKyBcInB4XCIsXHJcblx0XHRcdFx0XCJoZWlnaHRcIjogaGVpZ2h0VG90YWwgKyBcInB4XCJcclxuXHRcdFx0fSkuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XHJcblx0XHR0aGlzLmJhc2VEb20gPSAkYm94Tm9kZTtcclxuXHJcblx0XHR2YXIgdyA9IDA7XHJcblx0XHR2YXIgaCA9IDA7XHJcblxyXG5cdFx0Zm9yICh2YXIgaj0wO2o8aExlbjtqKyspe1xyXG5cdFx0XHRmb3IodmFyIGk9MDtpPHdMZW47IGkrKyl7XHJcblxyXG5cdFx0XHRcdHZhciB4ID0gaSAqIGNlbGxMZW47XHJcblx0XHRcdFx0dmFyIHkgPSBqICogY2VsbExlbjtcclxuXHJcblx0XHRcdFx0Ly8gaW5pdCBkb21cclxuXHRcdFx0XHQkY2VsbCA9ICQoXCI8ZGl2IGNsYXNzPSdjZWxsJz48ZGl2IGNsYXNzPSdwb2ludCB2ZXJ0aWNhbC1hbGlnbi1taWRkbGUnPjwvZGl2PjwvZGl2PlwiKVxyXG5cdFx0XHRcdFx0LmNzcyh7XHJcblx0XHRcdFx0XHRcdFwid2lkdGhcIjogY2VsbExlbiArIFwicHhcIixcclxuXHRcdFx0XHRcdFx0XCJoZWlnaHRcIjogY2VsbExlbiArIFwicHhcIixcclxuXHRcdFx0XHRcdFx0XCJsZWZ0XCI6IHggKyBcInB4XCIsXHJcblx0XHRcdFx0XHRcdFwidG9wXCI6IHkgKyBcInB4XCJcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQuYXBwZW5kVG8oJGJveE5vZGUpO1xyXG5cclxuXHRcdFx0XHQvLyBpbml0IGRhdGFzb3VyY2VcclxuXHRcdFx0XHR0aGlzLmRhdGFTb3VyY2Uuc2V0KHgsIHksIHt2YWx1ZTogMCwgbGVhZGVyOiBudWxsfSk7XHJcblx0XHRcdFx0Ly8gaW5pdCBkb21Tb3VyY2VcclxuXHRcdFx0XHR0aGlzLmRvbVNvdXJjZS5zZXQoeCwgeSwgJGNlbGwpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Z2V0RGF0YVNvdXJjZTogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiB0aGlzLmRhdGFTb3VyY2U7XHJcblx0fSxcclxuXHJcblx0Z2V0RG9tU291cmNlOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHRoaXMuZG9tU291cmNlO1xyXG5cdH0sXHJcblxyXG5cdGdldENvbmZpZzogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiB0aGlzLmNvbmZpZztcclxuXHR9LFxyXG5cclxuXHRnZW5lcmF0ZVBvaW50czogZnVuY3Rpb24oKXtcclxuXHRcdHZhciB3TGVuID0gdGhpcy5jb25maWcud0xlbjtcclxuXHRcdHZhciBoTGVuID0gdGhpcy5jb25maWcuaExlbjtcclxuXHRcdHZhciBjZWxsTGVuID0gdGhpcy5jb25maWcuY2VsbExlbjtcclxuXHRcdHZhciB4Q2VsbCA9IG5ldyBOdW1iZXIod0xlbikucmFuZG9tKCk7XHJcblx0XHR2YXIgeUNlbGwgPSBuZXcgTnVtYmVyKGhMZW4pLnJhbmRvbSgpO1xyXG5cdFx0dmFyIHggPSB4Q2VsbCAqIGNlbGxMZW47XHJcblx0XHR2YXIgeSA9IHlDZWxsICogY2VsbExlbjtcclxuXHJcblx0XHRpZih0aGlzLmRhdGFTb3VyY2UuZ2V0KHgseSkudmFsdWUgIT0gMCl7XHJcblx0XHRcdHJldHVybiB0aGlzLmdlbmVyYXRlUG9pbnRzKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5kYXRhU291cmNlLnNldCh4LCB5LCB7dmFsdWU6MiwgbGVhZGVyOiBudWxsfSk7XHJcblx0XHR2YXIgJGNlbGwgPSB0aGlzLmRvbVNvdXJjZS5nZXQoeCx5KTtcclxuXHRcdCQoXCIucG9pbnRcIiwgJGNlbGwpLmFkZENsYXNzKFwiYWxvbmVcIik7XHJcblx0fVxyXG5cclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQm94OyIsInZhciBDb29yTWFwID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLm1hcCA9IG5ldyBNYXAoKTtcclxufVxyXG5Db29yTWFwLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogQ29vck1hcCxcclxuXHRnZXQ6IGZ1bmN0aW9uKHgsIHkpe1xyXG5cdFx0dmFyIGsgPSBudWxsO1xyXG5cdFx0Zm9yKGtleSBvZiB0aGlzLm1hcC5rZXlzKCkpe1xyXG5cdFx0XHRpZihrZXkueCA9PSB4ICYmIGtleS55ID09IHkpe1xyXG5cdFx0XHRcdGsgPSBrZXk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5tYXAuZ2V0KGspO1xyXG5cdH0sXHJcblx0c2V0OiBmdW5jdGlvbih4LHksIHZhbHVlKXtcclxuXHRcdHZhciBrID0gbnVsbDtcclxuXHRcdGZvcihrZXkgb2YgdGhpcy5tYXAua2V5cygpKXtcclxuXHRcdFx0aWYoa2V5LnggPT0geCAmJiBrZXkueSA9PSB5KXtcclxuXHRcdFx0XHRrID0ga2V5O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZihrKSB7XHJcblx0XHRcdHRoaXMubWFwLnNldChrLCB2YWx1ZSk7XHJcblx0XHR9ZWxzZSB7XHJcblx0XHRcdHRoaXMubWFwLnNldCh7XCJ4XCI6eCAsIFwieVwiOnl9LCB2YWx1ZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHRnZXRNYXA6IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMubWFwO1xyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb29yTWFwOyIsInZhciBEcmF3ZXIgPSBmdW5jdGlvbihib3gpIHtcclxuXHR0aGlzLmJveCA9IGJveDtcclxufVxyXG5cclxuRHJhd2VyLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogRHJhd2VyLFxyXG5cclxuXHRpbml0OiBmdW5jdGlvbigpIHtcclxuXHJcblx0fSxcclxuXHJcblx0bm90aWZ5OiBmdW5jdGlvbigpIHtcclxuXHJcblx0XHQkKFwiLmJveCAucG9pbnQuc25ha2VcIikucmVtb3ZlQ2xhc3MoXCJzbmFrZVwiKTtcclxuXHJcblx0XHR2YXIgZGF0YU1hcCA9IHRoaXMuYm94LmdldERhdGFTb3VyY2UoKTtcclxuXHRcdHZhciBub2RlTWFwID0gdGhpcy5ib3guZ2V0RG9tU291cmNlKCk7XHJcblx0XHRmb3IgKHZhciBrIG9mIGRhdGFNYXAuZ2V0TWFwKCkua2V5cygpKSB7XHJcblx0XHRcdGlmIChkYXRhTWFwLmdldChrLngsIGsueSkudmFsdWUgPT0gMSkge1xyXG5cdFx0XHRcdHZhciAkY2VsbCA9IG5vZGVNYXAuZ2V0KGsueCwgay55KTtcclxuXHRcdFx0XHQkKFwiLnBvaW50XCIsICRjZWxsKS5hZGRDbGFzcyhcInNuYWtlXCIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0bm90aWZ5UG9pbnRzOiBmdW5jdGlvbigpIHtcclxuXHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERyYXdlcjsiLCJ2YXIgQ29vck1hcCA9IHJlcXVpcmUoXCIuL0Nvb3JNYXAuanNcIik7XHJcblxyXG52YXIgU05BS0VfU1BQRUQgPSAyMDA7XHJcblxyXG52YXIgU25ha2UgPSBmdW5jdGlvbihib3gsIGRyYXdlcil7XHJcblx0dGhpcy5ib3ggPSBib3g7XHJcblx0dGhpcy5kcmF3ZXIgPSBkcmF3ZXI7XHJcblx0dGhpcy5jb25maWcgPSBib3guZ2V0Q29uZmlnKCk7XHJcblx0dGhpcy5kYXRhU291cmNlID0gYm94LmdldERhdGFTb3VyY2UoKTtcclxuXHR0aGlzLmRvbVNvdXJjZSA9IGJveC5nZXREb21Tb3VyY2UoKTtcclxuXHJcblx0dGhpcy5kaXJlY3Rpb24gPSBudWxsOyAvLyBsZWZ0LCByaWdodCwgdXAsIGRvd25cclxuXHR0aGlzLmRpcmVjdGlvbkxvY2sgPSBmYWxzZTtcclxuXHJcblx0dGhpcy5oZWFkID0gbnVsbDtcclxuXHR0aGlzLnRhaWwgPSBudWxsO1xyXG5cclxuXHR0aGlzLmhhbmRsZXIgPSBudWxsO1xyXG59XHJcblxyXG5TbmFrZS5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IFNuYWtlLFxyXG5cclxuXHRpbml0OiBmdW5jdGlvbihib3gpe1xyXG5cdFx0dmFyIHdMZW4gPSB0aGlzLmNvbmZpZy53TGVuO1xyXG5cdFx0dmFyIGhMZW4gPSB0aGlzLmNvbmZpZy5oTGVuO1xyXG5cdFx0dmFyIGNlbGxMZW4gPSB0aGlzLmNvbmZpZy5jZWxsTGVuO1xyXG5cclxuXHRcdC8vIHdoZW4gaW5pdCwgdGhlIHNuYWtlIGhhcyB0d28gcG9pbnRzXHJcblx0XHQvLyBmaXJzdCBwb2ludFxyXG5cdFx0dmFyIGNlbnRlclggPSBwYXJzZUludCh3TGVuIC8gMiwgMTApICogY2VsbExlbjtcclxuXHRcdHZhciBjZW50ZXJZID0gcGFyc2VJbnQoaExlbiAvIDIsIDEwKSAqIGNlbGxMZW47XHJcblx0XHR0aGlzLmRhdGFTb3VyY2Uuc2V0KGNlbnRlclgsIGNlbnRlclksIHt2YWx1ZTogMSwgbGVhZGVyOiBudWxsfSk7XHJcblx0XHR0aGlzLmhlYWQgPSB7XHJcblx0XHRcdHg6IGNlbnRlclgsXHJcblx0XHRcdHk6IGNlbnRlcllcclxuXHRcdH1cclxuXHRcdC8vIHNlY29uZCBwb2ludFxyXG5cdFx0dmFyIGNlbnRlclgyID0gY2VudGVyWCAtIGNlbGxMZW47XHJcblx0XHR2YXIgY2VudGVyWTIgPSBjZW50ZXJZO1xyXG5cdFx0dGhpcy5kYXRhU291cmNlLnNldChjZW50ZXJYMiwgY2VudGVyWTIsIHt2YWx1ZTogMSwgbGVhZGVyOiB0aGlzLmhlYWR9KTtcclxuXHRcdHRoaXMuZGlyZWN0aW9uID0gXCJyaWdodFwiO1xyXG5cdFx0dGhpcy50YWlsID0ge1xyXG5cdFx0XHR4OiBjZW50ZXJYMixcclxuXHRcdFx0eTogY2VudGVyWTJcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmRyYXdlci5ub3RpZnkoKTtcclxuXHJcblx0XHR0aGlzLnN0YXJ0U25ha2UoKTtcclxuXHJcblx0fSxcclxuXHJcblx0c3RhcnRTbmFrZTogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBfdGhpcyA9IHRoaXM7XHJcblx0XHR0aGlzLmhhbmRsZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xyXG5cdFx0XHRfdGhpcy5tb3ZlKCk7XHJcblx0XHR9LCBTTkFLRV9TUFBFRCk7XHJcblx0fSxcclxuXHJcblx0bW92ZTogZnVuY3Rpb24oKXtcclxuXHRcdHZhciBuZXh0ID0gdGhpcy5fZ2V0TmV4dFBvaW50KCk7XHJcblx0XHRpZih0aGlzLmNoZWNrSGl0KG5leHQpID09PSB0cnVlKXtcclxuXHRcdFx0Y2xlYXJJbnRlcnZhbCh0aGlzLmhhbmRsZXIpO1xyXG5cdFx0XHR2YXIgcmVzdGFydEZsZyA9IGNvbmZpcm0oXCJnYW1lIG92ZXIgISByZXN0YXJ0ID9cIik7XHJcblx0XHRcdGlmKHJlc3RhcnRGbGcgPT09IHRydWUpe1xyXG5cdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBub3RoaW5nIHRvZG9cclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gaGVhZCBtb3ZlXHJcblx0XHRcdHZhciBlYXRGbGcgPSBmYWxzZTtcclxuXHRcdFx0aWYodGhpcy5kYXRhU291cmNlLmdldChuZXh0LngsIG5leHQueSkudmFsdWUgPT0gMil7XHJcblx0XHRcdFx0Ly8gZWF0IVxyXG5cdFx0XHRcdGVhdEZsZyA9IHRydWU7XHJcblx0XHRcdFx0dmFyICRjZWxsID0gdGhpcy5kb21Tb3VyY2UuZ2V0KG5leHQueCwgbmV4dC55KTtcclxuXHRcdFx0XHQkKFwiLnBvaW50XCIsICRjZWxsKS5yZW1vdmVDbGFzcyhcImFsb25lXCIpO1xyXG5cdFx0XHRcdHRoaXMuYm94LmdlbmVyYXRlUG9pbnRzKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5kYXRhU291cmNlLmdldCh0aGlzLmhlYWQueCwgdGhpcy5oZWFkLnkpLmxlYWRlciA9IG5leHQ7XHJcblx0XHRcdHRoaXMuZGF0YVNvdXJjZS5zZXQobmV4dC54LCBuZXh0LnksIHt2YWx1ZTogMSwgbGVhZGVyOiBudWxsfSk7XHJcblx0XHRcdHRoaXMuaGVhZCA9IG5leHQ7XHJcblxyXG5cdFx0XHQvLyB0YWlsIG1vdmVcclxuXHRcdFx0aWYoZWF0RmxnICE9IHRydWUpIHtcclxuXHRcdFx0XHR2YXIgdGFpbFggPSB0aGlzLnRhaWwueDtcclxuXHRcdFx0XHR2YXIgdGFpbFkgPSB0aGlzLnRhaWwueTtcclxuXHRcdFx0XHR0aGlzLnRhaWwgPSB0aGlzLmRhdGFTb3VyY2UuZ2V0KHRhaWxYLCB0YWlsWSkubGVhZGVyO1xyXG5cdFx0XHRcdHRoaXMuZGF0YVNvdXJjZS5zZXQodGFpbFgsIHRhaWxZLCB7dmFsdWU6MCwgbGVhZGVyOiBudWxsfSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRoaXMuZGlyZWN0aW9uTG9jayA9IGZhbHNlO1xyXG5cclxuXHRcdFx0Ly8gZHJhd1xyXG5cdFx0XHR0aGlzLmRyYXdlci5ub3RpZnkoKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRjaGVja0hpdDogZnVuY3Rpb24ocG9pbnQpe1xyXG5cdFx0dmFyIGNlbGwgPSB0aGlzLmRhdGFTb3VyY2UuZ2V0KHBvaW50LngsIHBvaW50LnkpO1xyXG5cdFx0Y29uc29sZS5sb2coY2VsbCk7XHJcblx0XHRpZighY2VsbCl7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0aWYoY2VsbC52YWx1ZSA9PSAxKXtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fSxcclxuXHJcblx0c2V0RGlyZWN0aW9uOiBmdW5jdGlvbihkaXJlY3Rpb24pe1xyXG5cdFx0dGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcblx0fSxcclxuXHJcblx0Z2V0RGlyZWN0aW9uOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHRoaXMuZGlyZWN0aW9uO1xyXG5cdH0sXHJcblxyXG5cdF9nZXROZXh0UG9pbnQ6IGZ1bmN0aW9uKCl7XHJcblx0XHR2YXIgY2VsbExlbiA9IHRoaXMuY29uZmlnLmNlbGxMZW47XHJcblx0XHR2YXIgZCA9IHRoaXMuZGlyZWN0aW9uO1xyXG5cdFx0dmFyIGhlYWRYID0gdGhpcy5oZWFkLng7XHJcblx0XHR2YXIgaGVhZFkgPSB0aGlzLmhlYWQueTtcclxuXHJcblx0XHRzd2l0Y2goZCl7XHJcblx0XHRcdGNhc2UgXCJyaWdodFwiOlxyXG5cdFx0XHRcdGhlYWRYICs9IGNlbGxMZW47XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJsZWZ0XCI6XHJcblx0XHRcdFx0aGVhZFggLT0gY2VsbExlbjtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcInVwXCI6XHJcblx0XHRcdFx0aGVhZFkgLT0gY2VsbExlbjtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImRvd25cIjpcclxuXHRcdFx0XHRoZWFkWSArPSBjZWxsTGVuO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHg6IGhlYWRYLFxyXG5cdFx0XHR5OiBoZWFkWVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNuYWtlOyIsInZhciBTbmFrZSA9IHJlcXVpcmUoXCIuL1NuYWtlLmpzXCIpO1xyXG52YXIgRHJhd2VyID0gcmVxdWlyZShcIi4vRHJhd2VyLmpzXCIpO1xyXG52YXIgQm94ID0gcmVxdWlyZShcIi4vQm94LmpzXCIpO1xyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cdC8vIHdoZW4gRE9NIGlzIHJlYWR5LCBydW4gdGhpc1xyXG5cclxuXHR2YXIgYm94WE51bSA9IDIwO1xyXG5cdHZhciBib3hZTnVtID0gMjA7XHJcblx0dmFyIGNlbGxXaWR0aCA9IDIwO1xyXG5cclxuXHRmdW5jdGlvbiBpbml0S2V5Ym9yZEV2ZW50KHNuYWtlKSB7XHJcblx0XHQkKGRvY3VtZW50KS5vbihcImtleWRvd25cIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRcdHZhciBrZXlDb2RlID0gZS5rZXlDb2RlO1xyXG5cdFx0XHR2YXIgZGlyZWN0aW9uID0gbnVsbDtcclxuXHRcdFx0dmFyIGN1cnJlbnREaXJlY3Rpb24gPSBzbmFrZS5nZXREaXJlY3Rpb24oKTtcclxuXHRcdFx0c3dpdGNoKGtleUNvZGUpe1xyXG5cdFx0XHRcdGNhc2UgMzc6XHJcblx0XHRcdFx0XHRkaXJlY3Rpb24gPSBjdXJyZW50RGlyZWN0aW9uID09IFwicmlnaHRcIiA/IFwicmlnaHRcIiA6IFwibGVmdFwiO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzODpcclxuXHRcdFx0XHRcdGRpcmVjdGlvbiA9IGN1cnJlbnREaXJlY3Rpb24gPT0gXCJkb3duXCIgPyBcImRvd25cIiA6IFwidXBcIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMzk6XHJcblx0XHRcdFx0XHRkaXJlY3Rpb24gPSBjdXJyZW50RGlyZWN0aW9uID09IFwibGVmdFwiID8gXCJsZWZ0XCIgOiBcInJpZ2h0XCI7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIDQwOlxyXG5cdFx0XHRcdFx0ZGlyZWN0aW9uID0gY3VycmVudERpcmVjdGlvbiA9PSBcInVwXCIgPyBcInVwXCIgOiBcImRvd25cIjtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYoZGlyZWN0aW9uICE9IG51bGwgJiYgc25ha2UuZGlyZWN0aW9uTG9jayA9PSBmYWxzZSl7XHJcblx0XHRcdFx0c25ha2Uuc2V0RGlyZWN0aW9uKGRpcmVjdGlvbik7XHJcblx0XHRcdFx0c25ha2UuZGlyZWN0aW9uTG9jayA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzdGFydHVwKCkge1xyXG5cclxuXHRcdHZhciBib3ggPSBuZXcgQm94KHtcclxuXHRcdFx0d0xlbjogYm94WE51bSxcclxuXHRcdFx0aExlbjogYm94WU51bSxcclxuXHRcdFx0Y2VsbExlbjogY2VsbFdpZHRoXHJcblx0XHR9KTtcclxuXHRcdGJveC5pbml0KCk7XHJcblxyXG5cdFx0dmFyIGRyYXdlciA9IG5ldyBEcmF3ZXIoYm94KTtcclxuXHRcdGRyYXdlci5pbml0KCk7XHJcblxyXG5cdFx0dmFyIHNuYWtlID0gbmV3IFNuYWtlKGJveCwgZHJhd2VyKTtcclxuXHRcdHNuYWtlLmluaXQoKTtcclxuXHJcblx0XHRpbml0S2V5Ym9yZEV2ZW50KHNuYWtlKTtcclxuXHR9XHJcblxyXG5cclxuXHRzdGFydHVwKCk7XHJcbn0pOyJdfQ==
