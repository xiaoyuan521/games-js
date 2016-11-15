// CoorMap - coordination map
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
			map.set(k, value);
		}else {
			map.set({"x":x , "y":y}, value);
		}
	}
}


// Snake
var Snake = function(){
	this.dataSnake = [];
}

Snake.prototype = {
	constructor: Snake,

	init: function(box){

	},

	move: function(x, y){

	}
}

// Drawer
var Drawer = function(){

}

Drawer.prototype = {
	constructor: Drawer,

	notify: function(){

	},

	notifyPoints: function(){

	}
}

// Box
var Box = function(){
	this.dataBox = [];
	this.points = [];
}

Box.prototype = {
	constructor: Box,

	init: function(wLen,hLen){

		var w = 0;
		var h = 0;

		var boxNode = $("<div class='box'></div>");
		boxNode.appendTo(document.body);

		for(var i=0;i<wLen; i++){
			for (var j=0;j<hLen;j++){
				
			}
		}
	},

	generatePoints: function(){

	}
}


// when DOM is ready, run this
$((function(){
	function startup(){
		var box = new Box();
		box.init(40,40);
	}
	starup();
})());