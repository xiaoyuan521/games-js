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