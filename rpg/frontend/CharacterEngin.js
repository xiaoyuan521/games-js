var characters = require("./characters.js");

function CharacterEngin() {
	this.currentDirection = "right";
	this.nextDirection = null;

	this.currentMove = "01"; // x = 0; y = 1

	this.walkFlg = 0; // 每次走动2步，移动一个地图格

	this.characterData = null;

}

CharacterEngin.prototype = {
	constructor: CharacterEngin,

	init: function(){
		this.bindEvent();
		this.loadCharacter("girl");
		this.startTimer();

	},

	// 定时检测人物走动
	startTimer: function(){
		var _this = this;
		setInterval(function(){

			_this.walk();

			
			if(_this.walkFlg == 2){
				_this.walkFlg = 0;
			}

			if(_this.walkFlg == 0){
				_this.nextDirection = null;
			}

		}, 200);
	},

	// 人物走动的键盘事件
	bindEvent: function(){
		var _this = this;
		$(document.body).on("keydown.character.walk", function(e){
			switch(e.keyCode){
				case 37:
					_this.nextDirection = "left";
					break;
				case 38:
					_this.nextDirection = "up";
					break;
				case 39:
					_this.nextDirection = "right";
					break;
				case 40:
					_this.nextDirection = "down";
					break;
				default:
					break
			}
		});
	},

	// 加载人物图片，初始化姿势
	loadCharacter: function(name){
		var characterData = this.characterData = characters[name];
		var characterSize = characterData.size;
		var imgPath = "images/" + characterData.imgName;

		var $characterDom = $('<div class="currentCharacter"></div>');
		$characterDom.appendTo($(".main"));

		var positions = this._getPositionXY(characterSize, this.currentMove);
		$characterDom.css({
			"width": characterSize + "px",
			"height": characterSize + "px",
			"background-image": "url('" + imgPath + "')",
			"background-position-x": positions.x + "px",
			"background-position-y": positions.y + "px"
		});

	},

	// 人物移动
	walk: function() {

		var $characterDom = $(".currentCharacter");
		if($characterDom.length == 0) {
			return;
		}
		if(this.nextDirection == null){
			return;
		}
		
		this.walkFlg ++;

		var nextMove = this._getNextMove();
		var nextPositions = this._getPositionXY(this.characterData.size, nextMove);

		var $characterDom = $(".currentCharacter");
		$characterDom.css({
			"background-position-x": nextPositions.x + "px",
			"background-position-y": nextPositions.y + "px"
		});
		
		this.currentMove = nextMove;
		this.currentDirection = this.nextDirection;
	},

	// 计算人物的css偏移量
	_getPositionXY: function(size, movePosition){
		var x = size * parseInt(movePosition[0], 10) * -1;
		var y = size * parseInt(movePosition[1], 10) * -1;
		return {
			x: x,
			y: y
		}
	},

	// 取得下一次移动的位置 
	// "03", "33" ...
	_getNextMove: function(){
		var currentMove = this.currentMove;
		var currentDirection = this.currentDirection;
		var nextDirection = this.nextDirection;
		var returnMove = null;

		if(currentDirection == nextDirection){
			// 向同一个方向行走

			var moveInt = parseInt(currentMove[0], 10);
			moveInt++;
			if(moveInt > 3){
				moveInt = 0;
			}
			returnMove = moveInt + currentMove[1];
		} else {
			// 改变行走方向

			this.walkFlg=0;
			switch(nextDirection){
				case "left":
					returnMove = "03";
					break;
				case "right":
					returnMove = "01";
					break;
				case "up":
					returnMove = "02";
					break;
				case "down":
					returnMove = "00";
					break;
			}
		}
		return returnMove;
		
	}
}

module.exports = CharacterEngin