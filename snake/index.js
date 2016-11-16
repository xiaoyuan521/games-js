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