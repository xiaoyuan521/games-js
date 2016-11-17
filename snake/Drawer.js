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