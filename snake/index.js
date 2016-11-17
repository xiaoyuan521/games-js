var Snake = require("./Snake.js");
var Drawer = require("./Drawer.js");
var Box = require("./Box.js");

$(function(){
	// when DOM is ready, run this

	var boxXNum = 20;
	var boxYNum = 20;
	var cellWidth = 20;

	function initKeybordEvent(snake) {
		$(document).on("keydown", function(e){
			var keyCode = e.keyCode;
			var direction = null;
			var currentDirection = snake.getDirection();
			switch(keyCode){
				case 37:
					direction = currentDirection == "right" ? "right" : "left";
					break;
				case 38:
					direction = currentDirection == "down" ? "down" : "up";
					break;
				case 39:
					direction = currentDirection == "left" ? "left" : "right";
					break;
				case 40:
					direction = currentDirection == "up" ? "up" : "down";
					break;
				default:
					break;
			}

			if(direction != null){
				snake.setDirection(direction);
			}
		})
	}

	function startup() {

		var box = new Box({
			wLen: boxXNum,
			hLen: boxYNum,
			cellLen: cellWidth
		});
		box.init();

		var drawer = new Drawer(box);
		drawer.init();

		var snake = new Snake(box, drawer);
		snake.init();

		initKeybordEvent(snake);
	}


	startup();
});