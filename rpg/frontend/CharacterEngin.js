var Character = require("./Character.js");

var MOVE_TIME = 400;
var BLANK_ENTER_KEY_CODES = [32,13];
var DIRECTION_KEY_CODES = [37,38,39,40]

function CharacterEngin(engin) {
	this.engin = engin;
	this.mapData = this.engin.mapData;
	this.config = engin.config;
	this.dataSource = engin.getDataSource();

	// 人物移动方向， null代表停止
	this.nextDirection = null;

	this.currentCharacter = null;

	this.isWalking = false;
}

CharacterEngin.prototype = {
	constructor: CharacterEngin,

	init: function(engin) {

		this.bindEvent();
		this.startTimer();
	},

	// 键盘事件
	bindEvent: function() {
		var _this = this;
		$(document.body).on("keydown.character.walk", function(e){

			if(_this.isWalking === true){
				return;
			}

			var keyCode = e.keyCode;
			if(DIRECTION_KEY_CODES.indexOf(keyCode) != -1){

				// 人物走路
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
						break;
				}

				_this.currentCharacter.setDirection(_this.nextDirection);
			} else if(BLANK_ENTER_KEY_CODES.indexOf(keyCode) != -1){

				// 对话
				_this.checkLines();
			}
			


		});
	},

	// 定时检测人物走动
	startTimer: function() {

		var _this = this;
		setInterval(function() {

			if(!_this.currentCharacter){
				return;
			}

			if(_this.isWalking === true) {
				return;
			}

			if(_this.nextDirection == null) {
				_this.currentCharacter.stop();
				return;
			}

			_this.walk();
		}, 10);
	},

	// 人物移动
	walk: function(){

		var _this = this;
		var currentCharacter = this.currentCharacter;
		var $characterDom = currentCharacter.getDom();
		if($characterDom.length == 0) {
			return;
		}

		var nextMapXy = this._getNextMapXy(this.nextDirection);
		var canWalkFlg = this._canWalk(nextMapXy);
		var x = nextMapXy.x;
		var y = nextMapXy.y;

		if(canWalkFlg === true){
			this.isWalking = true;
			currentCharacter.walk();
			this._moveCharacter(x, y, function(){
				_this.isWalking = false;
				_this.nextDirection = null;
				currentCharacter.x = x;
				currentCharacter.y = y;

				// 每次移动完成后，校验是否加载新地图 或者 触发剧情
				_this.engin.checkEvent(x, y);
			})
		}
	},

	checkLines: function(){
		var characterFaceTo = this.currentCharacter.currentDirection;
		var nextXy = this._getNextMapXy(characterFaceTo);
		var nextData = this.dataSource.get(nextXy.x, nextXy.y);
		if(!nextData || !nextData.character){
			return;
		}

		$(".lines-overlay").show().focus();
		$("div.lines").show();
		var characterName = nextData.character.name;
		var scriptInfo = this.engin.scriptEngin.getCurrentScript();
		var lineRef = scriptInfo.characters[characterName]["line_ref"];
		var lineObj = scriptInfo.lines;
		this.engin.linesEngin.setLinesObj(lineObj, lineRef);
		this.engin.linesEngin.start();

	},

	_moveCharacter: function(x, y, callbackFn){
		var $characterDom = $(".currentCharacter");
		$characterDom.animate({
			"left": x + "px",
			"top": y + "px"
		}, MOVE_TIME, "linear", callbackFn);
	},

	// 地图中，下一个点是否为可以移动点
	_canWalk: function(nextMapXy){

		if(this.nextDirection == null){
			return false;
		}

		// 不能行走的地图
		var mapCell = this.dataSource.get(nextMapXy.x, nextMapXy.y);
		if(!mapCell){
			// 超出地图
			return false;
		}

		if(mapCell.character){
			// npc
			return false;
		}

		var mapCellName = mapCell.bg;
		if(this.mapData["mapMapping"][mapCellName]["canWalk"] === false){
			// 不能走的地图， 树，或者海洋之类的
			return false;
		}

		return true;
	},

	// 根据行走方向取得，下一个地图的x，y坐标
	_getNextMapXy: function(direction){
		var cellSize = this.config.cellSize;
		var currentX = this.currentCharacter.x;
		var currentY = this.currentCharacter.y;
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

	setCurrentCharacter: function(currentCharacter){
		this.currentCharacter = currentCharacter;
	},
}

module.exports = CharacterEngin