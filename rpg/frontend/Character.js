var characters = require("./characters.js");

// 走一步的时间
var walkTime = 300;


function Character(engin, CharacterName){
	this.engin = engin;
	this.characterData = null;
	this.intervalHandler = null;
	this.isWalking = false;

	// 人物动作的css偏移用 x = 0; y = 1
	this.currentMove = "01"; 
	// 人物面向的方向
	this.direction = "right";

	this.init(CharacterName);
}

Character.prototype = {
	constrctor: Character,

	init: function(CharacterName){
		this.loadCharacter(CharacterName);
		this.startTimer();
	},

	startTimer: function(){
		var _this = this;
		this.intervalHandler = setInterval(function(){

			if(_this.isWalking === false){
				return;
			}

			var nextMove = _this._getNextMove();
			_this._setCssDeviation(nextMove);
			_this.currentMove = nextMove;
		}, this.walkTime);
	},

	// 加载人物图片，初始化姿势
	loadCharacter: function(name){

		var characterData = this.characterData = characters[name];
		var characterSize = characterData.size;
		var imgPath = "images/" + characterData.imgName;

		var $characterDom = $('<div class="currentCharacter"></div>');
		$characterDom.appendTo($(".main"));

		$characterDom.css({
			"width": characterSize + "px",
			"height": characterSize + "px",
			"background-image": "url('" + imgPath + "')"
		})

		this._setCssDeviation(this.currentMove);
	},

	// 取得下一次移动的位置 
	// "03", "33" ...
	_getNextMove: function(){
		var currentMove = this.currentMove;
		var currentDirection = this.currentDirection;
		var returnMove = null;

		var moveInt = parseInt(currentMove[0], 10);
		moveInt++;
		if(moveInt > 3){
			moveInt = 0;
		}
		returnMove = moveInt + currentMove[1];
		return returnMove;
		
	},

	// 开始走路
	walk: function(){
		this.isWalking = true;
	},

	// 停止走路
	stop: function(){
		this.isWalking = false;
		var stopMove = "0" + this.currentMove[1];
		this._setCssDeviation(stopMove);
	},

	// 设定移动方向
	// 需要在walk方法调用前调用
	// 也可以单独调用，用于，撞墙，撞人时候的转向
	setDirection: function(direction){

		if(direction != this.currentDirection){
			// 面向当前方向
			switch(direction){
				case "left":
					this.currentMove = "03";
					break;
				case "right":
					this.currentMove = "01";
					break;
				case "up":
					this.currentMove = "02";
					break;
				case "down":
					this.currentMove = "00";
					break;
				default:
					break;
			}
		}

		this.currentDirection = direction;
		this._setCssDeviation(this.currentMove);

	},

	// 设定人物图片的偏移量
	// nextMove : "01", "33" ...
	_setCssDeviation: function(nextMove) {
		var nextPositions = this._getPositionXY(this.characterData.size, nextMove);
		var $characterDom = $(".currentCharacter");
		$characterDom.css({
			"position":"absolute",
			"background-position-x": nextPositions.x + "px",
			"background-position-y": nextPositions.y + "px"
		});
	},

	// 计算人物的css偏移量
	_getPositionXY: function(size, movePosition) {
		var x = size * parseInt(movePosition[0], 10) * -1;
		var y = size * parseInt(movePosition[1], 10) * -1;
		return {
			x: x,
			y: y
		}
	},

	getDirection: function() {
		return this.direction;
	}

}

module.exports = Character;