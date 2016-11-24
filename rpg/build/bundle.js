(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
var MapEngin = require("./MapEngin");

function Engin(config){
	this.config = config;
	this.dataSource = null;
	this.mapEngin = new MapEngin(config);
}

Engin.prototype = {
	constructor: Engin,

	init: function(){
		this.mapEngin.init(this);
	},

	start: function(){

	},

	setDataSource: function(dataSource){
		this.dataSource = dataSource;
	}
}

module.exports=Engin;

},{"./MapEngin":3}],3:[function(require,module,exports){
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

},{"./CoorMap.js":1,"./maps.js":6}],4:[function(require,module,exports){
module.exports = {
	cellSize: 45
}
},{}],5:[function(require,module,exports){
var config = require("./config.js");
var Engin = require("./Engin.js");

var engin = new Engin(config);


$(function(){
	engin.init();
})
},{"./Engin.js":2,"./config.js":4}],6:[function(require,module,exports){
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
},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL1VzZXJzL3poYW9faG9uZ3NoZW5nL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJycGcvZnJvbnRlbmQvQ29vck1hcC5qcyIsInJwZy9mcm9udGVuZC9Fbmdpbi5qcyIsInJwZy9mcm9udGVuZC9NYXBFbmdpbi5qcyIsInJwZy9mcm9udGVuZC9jb25maWcuanMiLCJycGcvZnJvbnRlbmQvaW5kZXguanMiLCJycGcvZnJvbnRlbmQvbWFwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQ29vck1hcCA9IGZ1bmN0aW9uKCl7XHJcblx0dGhpcy5tYXAgPSBuZXcgTWFwKCk7XHJcbn1cclxuQ29vck1hcC5wcm90b3R5cGUgPSB7XHJcblx0Y29uc3RydWN0b3I6IENvb3JNYXAsXHJcblx0Z2V0OiBmdW5jdGlvbih4LCB5KXtcclxuXHRcdHZhciBrID0gbnVsbDtcclxuXHRcdGZvcihrZXkgb2YgdGhpcy5tYXAua2V5cygpKXtcclxuXHRcdFx0aWYoa2V5LnggPT0geCAmJiBrZXkueSA9PSB5KXtcclxuXHRcdFx0XHRrID0ga2V5O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMubWFwLmdldChrKTtcclxuXHR9LFxyXG5cdHNldDogZnVuY3Rpb24oeCx5LCB2YWx1ZSl7XHJcblx0XHR2YXIgayA9IG51bGw7XHJcblx0XHRmb3Ioa2V5IG9mIHRoaXMubWFwLmtleXMoKSl7XHJcblx0XHRcdGlmKGtleS54ID09IHggJiYga2V5LnkgPT0geSl7XHJcblx0XHRcdFx0ayA9IGtleTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYoaykge1xyXG5cdFx0XHR0aGlzLm1hcC5zZXQoaywgdmFsdWUpO1xyXG5cdFx0fWVsc2Uge1xyXG5cdFx0XHR0aGlzLm1hcC5zZXQoe1wieFwiOnggLCBcInlcIjp5fSwgdmFsdWUpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0Z2V0TWFwOiBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB0aGlzLm1hcDtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29vck1hcDsiLCJ2YXIgTWFwRW5naW4gPSByZXF1aXJlKFwiLi9NYXBFbmdpblwiKTtcclxuXHJcbmZ1bmN0aW9uIEVuZ2luKGNvbmZpZyl7XHJcblx0dGhpcy5jb25maWcgPSBjb25maWc7XHJcblx0dGhpcy5kYXRhU291cmNlID0gbnVsbDtcclxuXHR0aGlzLm1hcEVuZ2luID0gbmV3IE1hcEVuZ2luKGNvbmZpZyk7XHJcbn1cclxuXHJcbkVuZ2luLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogRW5naW4sXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKCl7XHJcblx0XHR0aGlzLm1hcEVuZ2luLmluaXQodGhpcyk7XHJcblx0fSxcclxuXHJcblx0c3RhcnQ6IGZ1bmN0aW9uKCl7XHJcblxyXG5cdH0sXHJcblxyXG5cdHNldERhdGFTb3VyY2U6IGZ1bmN0aW9uKGRhdGFTb3VyY2Upe1xyXG5cdFx0dGhpcy5kYXRhU291cmNlID0gZGF0YVNvdXJjZTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzPUVuZ2luO1xyXG4iLCJ2YXIgQ29vck1hcCA9IHJlcXVpcmUoXCIuL0Nvb3JNYXAuanNcIik7XHJcblxyXG5mdW5jdGlvbiBNYXBFbmdpbihjb25maWcpe1xyXG5cdHRoaXMuY29uZmlnID0gY29uZmlnO1xyXG5cdHRoaXMuZW5naW4gPSBudWxsO1xyXG5cdHRoaXMubWFwcyA9IHJlcXVpcmUoXCIuL21hcHMuanNcIik7XHJcblx0dGhpcy5tYXBNYXBwaW5nID0gdGhpcy5tYXBzLm1hcE1hcHBpbmc7XHJcbn1cclxuXHJcbk1hcEVuZ2luLnByb3RvdHlwZSA9IHtcclxuXHRjb25zdHJ1Y3RvcjogTWFwRW5naW4sXHJcblxyXG5cdGluaXQ6IGZ1bmN0aW9uKGVuZ2luKXtcclxuXHJcblx0XHR0aGlzLmVuZ2luID0gZW5naW47XHJcblxyXG5cdFx0Ly8gcHJlLWxvYWQgYWxsIGltYWdlc1xyXG5cdFx0dmFyIG1hcE1hcHBpbmcgPSB0aGlzLm1hcHMubWFwTWFwcGluZztcclxuXHRcdHZhciAkbG9hZERpdiA9ICQoXCI8ZGl2IGNsYXNzPSdkaXNwbGF5X25vbmUnPjwvZGl2PlwiKTtcclxuXHRcdCRsb2FkRGl2LmFwcGVuZFRvKCQoZG9jdW1lbnQuYm9keSkpO1xyXG5cdFx0Zm9yKHZhciBrZXkgaW4gbWFwTWFwcGluZyl7XHJcblx0XHRcdHZhciBpbWFnZVBhdGggPSBcImltYWdlcy9cIiArIG1hcE1hcHBpbmdba2V5XTtcclxuXHRcdFx0JCgnPGltZy8+JykuYXR0cihcInNyY1wiLCBpbWFnZVBhdGgpLmFwcGVuZFRvKCRsb2FkRGl2KTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmxvYWRNYXAoXCIwMVwiKTtcclxuXHR9LFxyXG5cclxuXHRsb2FkTWFwOiBmdW5jdGlvbihtYXBLZXkpIHtcclxuXHRcdCQoXCIubWFpbiAubWFwTGF5ZXJcIikucmVtb3ZlKCk7XHJcblx0XHR2YXIgJG1hcExheWVyID0gJChcIjxkaXYgY2xhc3M9J21hcExheWVyJz48L2Rpdj5cIik7XHJcblx0XHQkbWFwTGF5ZXIuYXBwZW5kVG8oJChcIi5tYWluXCIpKTtcclxuXHJcblx0XHQvLyBzZXQgbWFwIHRvdGFsIGhlaWdodCBhbmQgd2lkdGhcclxuXHRcdHZhciBtYXBEYXRhID0gdGhpcy5tYXBzW21hcEtleV07XHJcblx0XHR2YXIgY2VsbFNpemUgPSB0aGlzLmNvbmZpZy5jZWxsU2l6ZTtcclxuXHRcdHZhciBoTGVuID0gbWFwRGF0YS5sZW5ndGg7XHJcblx0XHR2YXIgd0xlbiA9IG1hcERhdGFbMF0ubGVuZ3RoO1xyXG5cdFx0dmFyIHdpZHRoID0gd0xlbiAqIGNlbGxTaXplO1xyXG5cdFx0dmFyIGhlaWdodCA9IGhMZW4gKiBjZWxsU2l6ZTtcclxuXHRcdCRtYXBMYXllci5jc3Moe1xyXG5cdFx0XHR3aWR0aDogd2lkdGggKyBcInB4XCIsXHJcblx0XHRcdGhlaWdodDogaGVpZ2h0ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBpbml0IGRhdGFTb3VyY2UgYW5kIGRvbVxyXG5cdFx0dmFyIHZhbHVlID0gbnVsbDtcclxuXHRcdHZhciByb3cgPSBudWxsO1xyXG5cdFx0dmFyIHgseTtcclxuXHRcdHZhciBkYXRhU291cmNlID0gbmV3IENvb3JNYXAoKTtcclxuXHRcdGZvcih2YXIgaj0wO2o8bWFwRGF0YS5sZW5ndGg7aisrKXtcclxuXHRcdFx0cm93ID0gbWFwRGF0YVtqXTtcclxuXHRcdFx0Zm9yKHZhciBpPTA7aTxyb3cubGVuZ3RoO2krKyl7XHJcblx0XHRcdFx0dmFsdWUgPSB0aGlzLm1hcE1hcHBpbmdbcm93W2ldXTtcclxuXHRcdFx0XHR4ID0gaSAqIGNlbGxTaXplO1xyXG5cdFx0XHRcdHkgPSBqICogY2VsbFNpemU7XHJcblxyXG5cdFx0XHRcdC8vIGRhdGFzb3VyY2VcclxuXHRcdFx0XHRkYXRhU291cmNlLnNldCh4LHksIHtiZzogdmFsdWV9KTtcclxuXHJcblx0XHRcdFx0Ly8gaW1hZ2VzXHJcblx0XHRcdFx0dmFyICRpbWcgPSAkKCc8aW1nIGFsdD1cIlwiIC8+JykuYXR0cihcInNyY1wiLCBcImltYWdlcy9cIiArIHZhbHVlKTtcclxuXHRcdFx0XHQkaW1nLmNzcyh7XHJcblx0XHRcdFx0XHR3aWR0aDogY2VsbFNpemUgKyBcInB4XCIsXHJcblx0XHRcdFx0XHRoZWlnaHQ6IGNlbGxTaXplICsgXCJweFwiLFxyXG5cdFx0XHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuXHRcdFx0XHRcdGxlZnQ6IHggKyBcInB4XCIsXHJcblx0XHRcdFx0XHR0b3A6IHkgKyBcInB4XCJcclxuXHRcdFx0XHR9KS5hcHBlbmRUbygkbWFwTGF5ZXIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR0aGlzLmVuZ2luLnNldERhdGFTb3VyY2UoZGF0YVNvdXJjZSk7XHJcblx0fVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1hcEVuZ2luO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRjZWxsU2l6ZTogNDVcclxufSIsInZhciBjb25maWcgPSByZXF1aXJlKFwiLi9jb25maWcuanNcIik7XHJcbnZhciBFbmdpbiA9IHJlcXVpcmUoXCIuL0VuZ2luLmpzXCIpO1xyXG5cclxudmFyIGVuZ2luID0gbmV3IEVuZ2luKGNvbmZpZyk7XHJcblxyXG5cclxuJChmdW5jdGlvbigpe1xyXG5cdGVuZ2luLmluaXQoKTtcclxufSkiLCJ2YXIgbWFwcyA9IHt9XHJcblxyXG5tYXBzW1wibWFwTWFwcGluZ1wiXSA9IHtcclxuXHRcInRyXCI6IFwidHJlZS5wbmdcIixcclxuXHRcInNlXCI6IFwic2VhLnBuZ1wiLFxyXG5cdFwiYmVcIjogXCJiZWFjaC5wbmdcIixcclxuXHRcImxhXCI6IFwibGFuZC5wbmdcIixcclxuXHRcImJyXCI6IFwiYnJpZGdlLnBuZ1wiXHJcbn1cclxuXHJcbm1hcHNbXCIwMVwiXSA9XHJcblwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLHNlLGJyLHNlLGJlLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixiZSxiZSxicixiZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGxhLGxhLGxhLGxhLGxhLHRyLHRyLHRyX1wiICtcclxuXCJsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYSxsYV9cIiArXHJcblwidHIsdHIsdHIsbGEsbGEsbGEsbGEsbGEsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGxhLGxhLGxhLGxhLGxhLHRyLHRyLHRyX1wiICtcclxuXCJ0cix0cix0cixiZSxiZSxicixiZSxiZSx0cix0cix0cl9cIiArXHJcblwidHIsdHIsdHIsYmUsc2UsYnIsc2UsYmUsdHIsdHIsdHJfXCIgK1xyXG5cInRyLHRyLHRyLGJlLHNlLGJyLHNlLGJlLHRyLHRyLHRyXCI7XHJcblxyXG5cclxuLy8g5Zyw5Zu+5pWw5o2u5Liy6L2s5LqM57u05pWw57uEXHJcbmZ1bmN0aW9uIHRvQXJyYXkoc3RyKXtcclxuXHR2YXIgcmV0dXJuQXJyYXkgPSBbXTtcclxuXHR2YXIgbGluZUFyciA9IHN0ci5zcGxpdChcIl9cIik7XHJcblx0bGluZUFyci5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpe1xyXG5cdFx0cmV0dXJuQXJyYXkucHVzaChsaW5lLnNwbGl0KFwiLFwiKSk7XHJcblx0fSk7XHJcblx0cmV0dXJuIHJldHVybkFycmF5O1xyXG59XHJcblxyXG5cclxuZm9yKHZhciBrZXkgaW4gbWFwcyl7XHJcblx0aWYoL1xcZFxcZC8udGVzdChrZXkpKXtcclxuXHRcdG1hcHNba2V5XSA9IHRvQXJyYXkobWFwc1trZXldKTtcclxuXHR9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gbWFwcyJdfQ==
