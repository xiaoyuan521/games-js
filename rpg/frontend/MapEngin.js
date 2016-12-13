var CoorMap = require("./CoorMap.js");

function MapEngin(engin){
	this.engin = engin;
	this.config = engin.config;
	this.mapData = engin.mapData;

	this.currentMapKey = null;
}

MapEngin.prototype = {
	constructor: MapEngin,

	init: function(){

		this.preload();
		this.loadMap("01");
		this.initOverlay();
	},

	loadMap: function(mapKey) {
		this.currentMapKey = mapKey;

		var $mapLayer = $(".main .map-layer")
		$mapLayer.empty();

		// set map total height and width
		var mapData = this.mapData[mapKey].data;
		var cellSize = this.config.cellSize;
		var hLen = mapData.length;
		var wLen = mapData[0].length;
		var width = wLen * cellSize;
		var height = hLen * cellSize;
		$(".layer").css({
			width: width + "px",
			height: height + "px"
		});

		// 根据地图做数据成dataSource，并设定到engin对象中
		// 根据地图数据画出地图
		var value = null;
		var row = null;
		var x,y;
		var dataSource = this.engin.getDataSource();
		dataSource.clear();
		for(var j=0;j<mapData.length;j++){
			row = mapData[j];
			for(var i=0;i<row.length;i++){
				value = this.mapData.mapMapping[row[i]].name;
				x = i * cellSize;
				y = j * cellSize;

				// datasource
				dataSource.set(x,y, {bg: row[i]});

				// images
				var $img = $('<img alt="" />').attr("src", "images/" + value);
				// var $img = $('<div></div>').text(value.substring(0,2));
				$img.css({
					width: cellSize + "px",
					height: cellSize + "px",
					position: "absolute",
					left: x + "px",
					top: y + "px"
				}).appendTo($mapLayer);
			}
		}
	},

	checkChangeMap: function(x,y){
		var position = this._getPosition(x,y);
		var exits = this.mapData[this.currentMapKey].exits;
		var exitsInfo = exits[position];
		if(exitsInfo) {
			// 到达出口,加载下一张地图
			this._changeMap(exitsInfo);
			return exitsInfo.mapName;
		}
		return false;
	},

	_changeMap: function(exitsInfo){
		var mapName = exitsInfo.map;
		var position = exitsInfo.position;
		var faceTo = exitsInfo.faceTo;

		var posArr = position.split("_");
		var x = posArr[0];
		var y = posArr[1];

		this.engin.characterEngin.currentCharacter.stop();
		$(".character-overlay").show();
		this.loadMap(mapName);
		this.engin.characterEngin.currentCharacter.setPosition(x, y, faceTo);
		$(".character-overlay").hide();
	},

	// param: 450, 45
	// return "10_1"
	_getPosition: function(x, y){
		var cellSize = this.config.cellSize;
		return "" + x / cellSize + "_" +  y / cellSize;
	},

	initOverlay: function(){
		$(".character-overlay").on("keydown", function(e){
			e.preventDefault();
			e.stopPropagation();
		});
	},

	preload: function(){
		// pre-load map images
		var mapMapping = this.mapData.mapMapping;
		var $loadDiv = $("div.preload");
		for(var key in mapMapping){
			var imagePath = "images/" + mapMapping[key].name;
			$('<img/>').attr("src", imagePath).appendTo($loadDiv);
		}
	}
}

module.exports = MapEngin;
