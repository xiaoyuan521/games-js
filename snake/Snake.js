var CoorMap = require("./CoorMap.js");

var Snake = function(box, drawer){
	this.box = box;
	this.drawer = drawer;
	this.config = box.getConfig();
	this.dataSource = box.getDataSource();
	this.domSource = box.getDomSource();

	this.direction = null; // left, right, up, down
	this.directionLock = false;

	this.head = null;
	this.tail = null;

	this.handler = null;
}

Snake.prototype = {
	constructor: Snake,

	init: function(box){
		var wLen = this.config.wLen;
		var hLen = this.config.hLen;
		var cellLen = this.config.cellLen;

		// when init, the snake has two points
		// first point
		var centerX = parseInt(wLen / 2, 10) * cellLen;
		var centerY = parseInt(hLen / 2, 10) * cellLen;
		this.dataSource.set(centerX, centerY, {value: 1, leader: null});
		this.head = {
			x: centerX,
			y: centerY
		}
		// second point
		var centerX2 = centerX - cellLen;
		var centerY2 = centerY;
		this.dataSource.set(centerX2, centerY2, {value: 1, leader: this.head});
		this.direction = "right";
		this.tail = {
			x: centerX2,
			y: centerY2
		}

		this.drawer.notify();

		this.startSnake();

	},

	startSnake: function(){
		var _this = this;
		this.handler = setInterval(function(){
			_this.move();
		}, 100);
	},

	move: function(){
		var next = this._getNextPoint();
		if(this.checkHit(next) === true){
			clearInterval(this.handler);
			var restartFlg = confirm("game over ! restart ?");
			if(restartFlg === true){
				window.location.reload();
			} else {
				// nothing todo
			}
		} else {
			// head move
			var eatFlg = false;
			if(this.dataSource.get(next.x, next.y).value == 2){
				// eat!
				eatFlg = true;
				var $cell = this.domSource.get(next.x, next.y);
				$(".point", $cell).removeClass("alone");
				this.box.generatePoints();
			}
			this.dataSource.get(this.head.x, this.head.y).leader = next;
			this.dataSource.set(next.x, next.y, {value: 1, leader: null});
			this.head = next;

			// tail move
			if(eatFlg != true) {
				var tailX = this.tail.x;
				var tailY = this.tail.y;
				this.tail = this.dataSource.get(tailX, tailY).leader;
				this.dataSource.set(tailX, tailY, {value:0, leader: null});
			}

			this.directionLock = false;

			// draw
			this.drawer.notify();
		}
	},

	checkHit: function(point){
		var cell = this.dataSource.get(point.x, point.y);
		console.log(cell);
		if(!cell){
			return true;
		}
		if(cell.value == 1){
			return true;
		}
		return false;
	},

	setDirection: function(direction){
		this.direction = direction;
	},

	getDirection: function(){
		return this.direction;
	},

	_getNextPoint: function(){
		var cellLen = this.config.cellLen;
		var d = this.direction;
		var headX = this.head.x;
		var headY = this.head.y;

		switch(d){
			case "right":
				headX += cellLen;
				break;
			case "left":
				headX -= cellLen;
				break;
			case "up":
				headY -= cellLen;
				break;
			case "down":
				headY += cellLen;
				break;
		}

		return {
			x: headX,
			y: headY
		}
	}


}

module.exports = Snake;