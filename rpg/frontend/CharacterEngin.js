var characters = require("./characters.js");
var maps = require("./maps");

function CharacterEngin(config) {
	this.config = config;
	this.engin = null;
	this.dataSource = null;
	this.characterData = null;

	this.currentDirection = "right";
	this.nextDirection = null;

	// 人物动作的css偏移用 x = 0; y = 1
	this.currentMove = "01"; 

	// 计步器，2个状态 0，1
	this.walkFlg = 0;

	// 人物在地图中的位置
	this.x = 0;
	this.y = 0;


}

CharacterEngin.prototype = {
	constructor: CharacterEngin,

	init: function(engin){
		this.engin = engin;
		this.dataSource = engin.getDataSource();

		this.bindEvent();

		var x = 3 * this.config.cellSize;
		var y = 3 * this.config.cellSize;
		this.loadCharacter("girl", x, y);

		this.startTimer();

	},

	// 定时检测人物走动
	startTimer: function(){
		var _this = this;
		setInterval(function(){
			_this.walk();
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
	loadCharacter: function(name, x, y){

		this.x = x;
		this.y = y;

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
			"background-position-y": positions.y + "px",
			"transition": "top .4s linear,left .4s linear" // 移动的动画效果
		});

		// 将人物放到地图中
		$characterDom.css({
			"position": "absolute",
			"left": x + "px",
			"top": y + "px"
		});

	},

	// 人物移动
	walk: function(){

		var $characterDom = $(".currentCharacter");
		if($characterDom.length == 0) {
			return;
		}
		if(this.nextDirection == null){
			return;
		}

		var canWalkFlg = true;
		var nextMapXy = null;
		if(this.walkFlg == 0){
			// 走第一步，判断下一个位置是否能走
			nextMapXy = this._getNextMapXy(this.nextDirection);
			canWalkFlg = this._canWalk(nextMapXy);
			if(canWalkFlg === true) {
				this.x = nextMapXy.x;
				this.y = nextMapXy.y;
				this._moveCharacter(this.x, this.y);
			}
		} else if(this.walkFlg == 1){
			// 走第二步
			canWalkFlg = true;
		}

		if(canWalkFlg === true){
			this._walk();
		}

		// 每走2步，计步器归0
		if(this.walkFlg == 2){
			this.walkFlg = 0;
		}

		// 走完后，将nextDirection设定为null，停止行走
		if(this.walkFlg == 0){
			this.nextDirection = null;
		}
	},

	// 人物移动
	_walk: function() {

		this.walkFlg++;

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

	_moveCharacter: function(x, y){
		var $characterDom = $(".currentCharacter");
		$characterDom.css({
			"left": x + "px",
			"top": y + "px"
		});
	},

	// 地图中，下一个点是否为可以移动点
	_canWalk: function(nextMapXy){

		if(this.nextDirection == null){
			return false;
		}

		// 超出地图
		if(nextMapXy.x < 0 || nextMapXy.y < 0){
			return false;
		}

		// 不能行走的地图
		var mapCellName = this.dataSource.get(nextMapXy.x, nextMapXy.y).bg;
		if(maps["mapMapping"][mapCellName]["canWalk"] === false){
			return false;
		}

		return true;
	},

	// 根据行走方向取得，下一个地图的x，y坐标
	_getNextMapXy: function(direction){
		var cellSize = this.config.cellSize;
		var x = 0;
		var y = 0;
		switch(direction){
			case "left":
				x = this.x - cellSize;
				y = this.y;
				break;
			case "right":
				x = this.x + cellSize;
				y = this.y;
				break;
			case "up":
				x = this.x;
				y = this.y - cellSize;
				break;
			case "down":
				x = this.x;
				y = this.y + cellSize;
				break;
			default:
				break;
		}
		return {
			x:x,
			y:y
		}
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