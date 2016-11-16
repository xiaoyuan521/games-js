(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CoorMap = require("./CoorMap.js");

var Box = function(){
	this.dataSource = null;
	this.points = null;
}

// dataSource
// 0 - blank
// 1 - snake
// 2 - genereate points
Box.prototype = {
	constructor: Box,

	init: function(wLen,hLen, cellLen){

		this.dataSource = new CoorMap();
		this.points = [];

		// draw container dom
		var widthTotal = cellLen * wLen;
		var heightTotal = cellLen * hLen;
		var $boxNode = $("<div class='box'></div>")
			.css({
				"width": widthTotal + "px",
				"height": heightTotal + "px"
			}).appendTo(document.body);

		var w = 0;
		var h = 0;

		for (var j=0;j<hLen;j++){
			for(var i=0;i<wLen; i++){

				var x = i * cellLen;
				var y = j * cellLen;

				// init dom
				$cell = $("<div class='cell'></div>")
					.css({
						"width": cellLen + "px",
						"height": cellLen + "px",
						"left": x + "px",
						"top": y + "px"
					})
					.appendTo($boxNode);

				// init datasource
				this.dataSource.set(x,y, 0);
			}
		}
	},

	generatePoints: function(){

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
	map: function() {
		return this.map;
	}
}

CoorMap.prototype.size = Map


module.exports = CoorMap;
},{}],3:[function(require,module,exports){
var Drawer = function(){

}

Drawer.prototype = {
	constructor: Drawer,

	notify: function(){

	},

	notifyPoints: function(){

	}
}

module.exports = Drawer;
},{}],4:[function(require,module,exports){
var CoorMap = require("./CoorMap.js");

var Snake = function(box){
	this.dataSource = null;
	this.box = box;
}

Snake.prototype = {
	constructor: Snake,

	init: function(box){
		this.dataSource = new CoorMap();
	},

	move: function(x, y){

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

	function startup(){
		var box = new Box();
		box.init(boxXNum, boxYNum, cellWidth);
	}
	startup();


});
},{"./Box.js":1,"./Drawer.js":3,"./Snake.js":4}]},{},[1,2,5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL1VzZXJzL3poYW9faG9uZ3NoZW5nL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzbmFrZS9Cb3guanMiLCJzbmFrZS9Db29yTWFwLmpzIiwic25ha2UvRHJhd2VyLmpzIiwic25ha2UvU25ha2UuanMiLCJzbmFrZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQ29vck1hcCA9IHJlcXVpcmUoXCIuL0Nvb3JNYXAuanNcIik7XHJcblxyXG52YXIgQm94ID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLmRhdGFTb3VyY2UgPSBudWxsO1xyXG5cdHRoaXMucG9pbnRzID0gbnVsbDtcclxufVxyXG5cclxuLy8gZGF0YVNvdXJjZVxyXG4vLyAwIC0gYmxhbmtcclxuLy8gMSAtIHNuYWtlXHJcbi8vIDIgLSBnZW5lcmVhdGUgcG9pbnRzXHJcbkJveC5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IEJveCxcclxuXHJcblx0aW5pdDogZnVuY3Rpb24od0xlbixoTGVuLCBjZWxsTGVuKXtcclxuXHJcblx0XHR0aGlzLmRhdGFTb3VyY2UgPSBuZXcgQ29vck1hcCgpO1xyXG5cdFx0dGhpcy5wb2ludHMgPSBbXTtcclxuXHJcblx0XHQvLyBkcmF3IGNvbnRhaW5lciBkb21cclxuXHRcdHZhciB3aWR0aFRvdGFsID0gY2VsbExlbiAqIHdMZW47XHJcblx0XHR2YXIgaGVpZ2h0VG90YWwgPSBjZWxsTGVuICogaExlbjtcclxuXHRcdHZhciAkYm94Tm9kZSA9ICQoXCI8ZGl2IGNsYXNzPSdib3gnPjwvZGl2PlwiKVxyXG5cdFx0XHQuY3NzKHtcclxuXHRcdFx0XHRcIndpZHRoXCI6IHdpZHRoVG90YWwgKyBcInB4XCIsXHJcblx0XHRcdFx0XCJoZWlnaHRcIjogaGVpZ2h0VG90YWwgKyBcInB4XCJcclxuXHRcdFx0fSkuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XHJcblxyXG5cdFx0dmFyIHcgPSAwO1xyXG5cdFx0dmFyIGggPSAwO1xyXG5cclxuXHRcdGZvciAodmFyIGo9MDtqPGhMZW47aisrKXtcclxuXHRcdFx0Zm9yKHZhciBpPTA7aTx3TGVuOyBpKyspe1xyXG5cclxuXHRcdFx0XHR2YXIgeCA9IGkgKiBjZWxsTGVuO1xyXG5cdFx0XHRcdHZhciB5ID0gaiAqIGNlbGxMZW47XHJcblxyXG5cdFx0XHRcdC8vIGluaXQgZG9tXHJcblx0XHRcdFx0JGNlbGwgPSAkKFwiPGRpdiBjbGFzcz0nY2VsbCc+PC9kaXY+XCIpXHJcblx0XHRcdFx0XHQuY3NzKHtcclxuXHRcdFx0XHRcdFx0XCJ3aWR0aFwiOiBjZWxsTGVuICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0XHRcImhlaWdodFwiOiBjZWxsTGVuICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0XHRcImxlZnRcIjogeCArIFwicHhcIixcclxuXHRcdFx0XHRcdFx0XCJ0b3BcIjogeSArIFwicHhcIlxyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0XHRcdC5hcHBlbmRUbygkYm94Tm9kZSk7XHJcblxyXG5cdFx0XHRcdC8vIGluaXQgZGF0YXNvdXJjZVxyXG5cdFx0XHRcdHRoaXMuZGF0YVNvdXJjZS5zZXQoeCx5LCAwKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGdlbmVyYXRlUG9pbnRzOiBmdW5jdGlvbigpe1xyXG5cclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQm94OyIsInZhciBDb29yTWFwID0gZnVuY3Rpb24oKXtcclxuXHR0aGlzLm1hcCA9IG5ldyBNYXAoKTtcclxufVxyXG5Db29yTWFwLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogQ29vck1hcCxcclxuXHRnZXQ6IGZ1bmN0aW9uKHgsIHkpe1xyXG5cdFx0dmFyIGsgPSBudWxsO1xyXG5cdFx0Zm9yKGtleSBvZiB0aGlzLm1hcC5rZXlzKCkpe1xyXG5cdFx0XHRpZihrZXkueCA9PSB4ICYmIGtleS55ID09IHkpe1xyXG5cdFx0XHRcdGsgPSBrZXk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdGhpcy5tYXAuZ2V0KGspO1xyXG5cdH0sXHJcblx0c2V0OiBmdW5jdGlvbih4LHksIHZhbHVlKXtcclxuXHRcdHZhciBrID0gbnVsbDtcclxuXHRcdGZvcihrZXkgb2YgdGhpcy5tYXAua2V5cygpKXtcclxuXHRcdFx0aWYoa2V5LnggPT0geCAmJiBrZXkueSA9PSB5KXtcclxuXHRcdFx0XHRrID0ga2V5O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZihrKSB7XHJcblx0XHRcdHRoaXMubWFwLnNldChrLCB2YWx1ZSk7XHJcblx0XHR9ZWxzZSB7XHJcblx0XHRcdHRoaXMubWFwLnNldCh7XCJ4XCI6eCAsIFwieVwiOnl9LCB2YWx1ZSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHRtYXA6IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMubWFwO1xyXG5cdH1cclxufVxyXG5cclxuQ29vck1hcC5wcm90b3R5cGUuc2l6ZSA9IE1hcFxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29vck1hcDsiLCJ2YXIgRHJhd2VyID0gZnVuY3Rpb24oKXtcclxuXHJcbn1cclxuXHJcbkRyYXdlci5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IERyYXdlcixcclxuXHJcblx0bm90aWZ5OiBmdW5jdGlvbigpe1xyXG5cclxuXHR9LFxyXG5cclxuXHRub3RpZnlQb2ludHM6IGZ1bmN0aW9uKCl7XHJcblxyXG5cdH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEcmF3ZXI7IiwidmFyIENvb3JNYXAgPSByZXF1aXJlKFwiLi9Db29yTWFwLmpzXCIpO1xyXG5cclxudmFyIFNuYWtlID0gZnVuY3Rpb24oYm94KXtcclxuXHR0aGlzLmRhdGFTb3VyY2UgPSBudWxsO1xyXG5cdHRoaXMuYm94ID0gYm94O1xyXG59XHJcblxyXG5TbmFrZS5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IFNuYWtlLFxyXG5cclxuXHRpbml0OiBmdW5jdGlvbihib3gpe1xyXG5cdFx0dGhpcy5kYXRhU291cmNlID0gbmV3IENvb3JNYXAoKTtcclxuXHR9LFxyXG5cclxuXHRtb3ZlOiBmdW5jdGlvbih4LCB5KXtcclxuXHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNuYWtlOyIsInZhciBTbmFrZSA9IHJlcXVpcmUoXCIuL1NuYWtlLmpzXCIpO1xyXG52YXIgRHJhd2VyID0gcmVxdWlyZShcIi4vRHJhd2VyLmpzXCIpO1xyXG52YXIgQm94ID0gcmVxdWlyZShcIi4vQm94LmpzXCIpO1xyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cdC8vIHdoZW4gRE9NIGlzIHJlYWR5LCBydW4gdGhpc1xyXG5cclxuXHR2YXIgYm94WE51bSA9IDIwO1xyXG5cdHZhciBib3hZTnVtID0gMjA7XHJcblx0dmFyIGNlbGxXaWR0aCA9IDIwO1xyXG5cclxuXHRmdW5jdGlvbiBzdGFydHVwKCl7XHJcblx0XHR2YXIgYm94ID0gbmV3IEJveCgpO1xyXG5cdFx0Ym94LmluaXQoYm94WE51bSwgYm94WU51bSwgY2VsbFdpZHRoKTtcclxuXHR9XHJcblx0c3RhcnR1cCgpO1xyXG5cclxuXHJcbn0pOyJdfQ==
