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