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