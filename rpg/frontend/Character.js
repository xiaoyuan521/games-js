// 走一步的时间
var walkTime = 100;


function Character(engin, CharacterName){
	this.engin = engin;
	this.config = engin.config;

	this.characters = engin.characterData.characters;
	this.characterData = null;
	this.intervalHandler = null; // 走路动作检测的定时器
	this.isWalking = false;

	
	this.dom = null; // 人物dom
	this.currentMove = "01";  // 人物动作的css偏移用 x = 0; y = 1
	this.direction = "right"; // 人物面向的方向
	this.x = null; // 人物在地图中的位置 x
	this.y = null; // 人物在地图中的位置 y

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
		}, walkTime);
	},

	// 加载人物图片，初始化姿势
	loadCharacter: function(name){

		var characterData = this.characterData = this.characters[name];
		var characterSize = characterData.size;
		var imgPath = "images/" + characterData.imgName;

		var $characterDom = this.dom = $('<div class=""></div>');
		$characterDom.appendTo($(".character-layer"));

		$characterDom.css({
			"width": characterSize + "px",
			"height": characterSize + "px",
			"background-image": "url('" + imgPath + "')"
		})

		this._setCssDeviation(this.currentMove);
	},

	// 设定人物在地图中的位置，和面部朝向
	//
	// 设定人物在地图中的位置
	// 设定人物的面部朝向
	// x,y 可以是字符串 "1","1"
	// x,y 也可以是number型的 45, 90
	setPosition: function(x, y, direction){
		var cellSize = this.config.cellSize;
		if(typeof x === "string") {
			x = cellSize * parseInt(x, 10);
		}
		if(typeof y === "string") {
			y = cellSize * parseInt(y, 10);
		}

		var dom = this.getDom();
		dom.css({
			"left": x + "px",
			"top": y + "px"
		});
		this.x = x;
		this.y = y;

		if(direction){
			this.setDirection(direction);
		}
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
		var $characterDom = this.getDom();
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
	},

	getDom: function(){
		return this.dom;
	}

}

module.exports = Character;