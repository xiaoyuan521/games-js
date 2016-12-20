// 走一步的时间
var MOVEMENT_TIME = 100;
// 地图中走一格的时间
var MOVE_TIME = 400;


function Character(engin, CharacterName) {
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

	this.follower = null; // 跟随移动的人

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
		}, MOVEMENT_TIME);
	},

	// 加载人物图片，初始化姿势
	loadCharacter: function(name){

		var characterData = this.characterData = this.characters[name];
		var characterSizeXy = this._getCharacterSizeXy(characterData.size);
		var imgPath = "images/" + characterData.imgName;

		var $characterDom = this.dom = $('<div class=""></div>');
		$characterDom.appendTo($(".character-layer"));

		if(this.engin.debugMode){
			var dispName = characterData.imgName.replace(/\..*?$/g, '');
			$characterDom.css({
				"width": characterSizeXy.x + "px",
				"height": characterSizeXy.y + "px",
			}).addClass("debug wrapByCharacter");
			$characterDom.text(dispName);
		} else {
			$characterDom.css({
				"width": characterSizeXy.x + "px",
				"height": characterSizeXy.y + "px",
				"background-image": "url('" + imgPath + "')"
			})
		}

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
		var $dom = this.getDom();
		$dom.stop();

		this.isWalking = false;
		var stopMove = "0" + this.currentMove[1];
		this._setCssDeviation(stopMove);

		if(this.follower){
			var follower = this.follower;
			follower.stop();
		}
	},

	// 设定移动方向
	// 需要在walk方法调用前调用
	// 也可以单独调用，用于，撞墙，撞人时候的转向
	setDirection: function(direction){

		if(direction != this.currentDirection){
			// 面向当前方向
			switch(direction){
				case "left":
					this.currentMove = "01";
					break;
				case "right":
					this.currentMove = "02";
					break;
				case "up":
					this.currentMove = "03";
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
		var size = this.characterData.size;
		var singleXy = this._getCharacterSizeXy(size);

		var nextPositions = this._getPositionXY(singleXy.x, singleXy.y, nextMove);
		var $characterDom = this.getDom();
		$characterDom.css({
			"position":"absolute",
			"background-position-x": nextPositions.x + "px",
			"background-position-y": nextPositions.y + "px"
		});
	},

	// 计算人物的css偏移量
	_getPositionXY: function(singleX, singleY, movePosition) {
		var x = singleX * parseInt(movePosition[0], 10) * -1;
		var y = singleY * parseInt(movePosition[1], 10) * -1;
		return {
			x: x,
			y: y
		}
	},

	_getCharacterSizeXy: function(size){

		if(typeof size != 'string'){
			console.error("character.size 必须为string型");
			return;
		}

		var singleX = 0;
		var singinY = 0;
		if(size.indexOf("*") != -1){
			var sizeArr = size.split("*");
			singleX = parseInt(sizeArr[0], 10);
			singleY = parseInt(sizeArr[1], 10);
		} else {
			singleX = singleY = parseInt(size, 10);
		}
		return {
			x: singleX,
			y: singleY
		}

	},

	getDirection: function() {
		return this.direction;
	},

	getDom: function(){
		return this.dom;
	},

	// 人物在地图中行走
	moveInMap: function(x, y, callbackFn){
		var $characterDom = this.getDom();
		$characterDom.animate({
			"left": x + "px",
			"top": y + "px"
		}, MOVE_TIME, "linear", callbackFn);

		if(this.follower){
			this.follower.followMoveInMap(this.x,this.y);
		}
	},

	// 跟随主角在地图中行走
	followMoveInMap: function(leaderX, leaderY){
		var x = this.x;
		var y = this.y;
		if(x == leaderX && y == leaderY){
			// 2个人在同一个位置，跟随的人物不移动
			return;
		}

		// 设定脸部朝向
		var faceTo = null;
		if(x == leaderX){
			if(y < leaderY){
				faceTo = "down";
			}else {
				faceTo = "up";
			}
		} 
		if(y == leaderY){
			if(x > leaderX){
				faceTo = "left";
			}else {
				faceTo = "right";
			}
		}
		this.setDirection(faceTo);

		this.walk();
		var _this = this;
		_this.moveInMap(leaderX, leaderY, function(){
			console.log("follower walk done 22222222");
			_this.stop();
			_this.x = leaderX;
			_this.y = leaderY;
				
		});

	},

	// 根据行走方向取得，下一个地图的x，y坐标
	_getNextMapXy: function(direction){
		var cellSize = this.config.cellSize;
		var currentX = this.x;
		var currentY = this.y;
		var x = 0;
		var y = 0;
		switch(direction){
			case "left":
				x = currentX - cellSize;
				y = currentY;
				break;
			case "right":
				x = currentX + cellSize;
				y = currentY;
				break;
			case "up":
				x = currentX;
				y = currentY - cellSize;
				break;
			case "down":
				x = currentX;
				y = currentY + cellSize;
				break;
			default:
				break;
		}
		return {
			x:x,
			y:y
		}
	},

	setFollower: function(follower){
		this.follower = follower;
	},

	clearFollower: function(characterObj){
		if(characterObj === undefined) {
			characterObj = this;
		}
		if(!characterObj.follower){
			return;
		}
		var followerObj = characterObj.follower;
		characterObj.follower = null;
		followerObj.getDom().remove();
		this.clearFollower(followerObj);
	}

}

module.exports = Character;