var CoorMap = require("./CoorMap.js");

function MapEngin(config){
	this.config = config;
	this.engin = null;
	this.maps = require("./maps.js");
	this.mapMapping = this.maps.mapMapping;

	this.currentMapKey = null;
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
		this.currentMapKey = mapKey;

		var $mapLayer = $(".main .map-layer")
		$mapLayer.empty();

		// set map total height and width
		var mapData = this.maps[mapKey].data;
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
	},

	checkChangeMap: function(x,y){
		var position = this._getPosition(x,y);
		var exits = this.maps[this.currentMapKey].exits;
		var exitsInfo = exits[position];
		if(exitsInfo){
			// 到达出口,加载下一张地图
			this._changeMap(exitsInfo);
		}
	},

	_changeMap: function(exitsInfo){
		var mapName = exitsInfo.map;
		var initPosition = exitsInfo.initPosition;
		var faceTo = exitsInfo.faceTo;

		var posArr = initPosition.split("_");
		var x = posArr[0];
		var y = posArr[1];

		this.engin.characterEngin.currentCharacter.stop();
		$(".character-overlay").show();
		this.loadMap(mapName);
		this.engin.characterEngin.setCharacterPosition(x, y, faceTo);
		$(".character-overlay").hide();
	},

	// param: 450, 45
	// return "10_1"
	_getPosition: function(x, y){
		var cellSize = this.config.cellSize;
		return "" + x / cellSize + "_" +  y / cellSize;
	}
}

module.exports = MapEngin;
