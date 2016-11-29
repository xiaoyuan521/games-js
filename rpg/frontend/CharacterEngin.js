var maps = require("./maps");
var Character = require("./Character.js");

var moveTime = 600;

function CharacterEngin(config) {
	this.config = config;
	this.engin = null;
	this.dataSource = null;

	// 人物移动方向， null代表停止
	this.nextDirection = null;

	this.currentCharacter = null;

	// 人物在地图中的位置
	this.x = 0;
	this.y = 0;

	this.isWalking = false;
}

CharacterEngin.prototype = {
	constructor: CharacterEngin,

	init: function(engin) {
		this.engin = engin;
		this.dataSource = engin.getDataSource();

		// 绑定键盘事件
		this.bindEvent();

		// 初始化人物
		var currentCharacter = this.currentCharacter = new Character(engin, "girl");
		// 人物放到地图空位置上
		var x = this.x = 3 * this.config.cellSize;
		var y = this.y = 3 * this.config.cellSize;
		$(".currentCharacter").css({
			left: x + "px",
			top: y + "px"
		});

		this.startTimer();
	},

	// 人物走动的键盘事件
	bindEvent: function() {
		var _this = this;
		$(document.body).on("keydown.character.walk", function(e){

			if(_this.isWalking === true){
				return;
			}

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
		});
	},

	// 定时检测人物走动
	startTimer: function() {

		var _this = this;
		setInterval(function() {
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
		var $characterDom = $(".currentCharacter");
		if($characterDom.length == 0) {
			return;
		}

		var nextMapXy = this._getNextMapXy(this.nextDirection);
		var canWalkFlg = this._canWalk(nextMapXy);

		if(canWalkFlg === true){
			this.isWalking = true;
			this.currentCharacter.walk();
			this._moveCharacter(nextMapXy.x, nextMapXy.y, function(){
				_this.isWalking = false;
				_this.nextDirection = null;
				_this.x = nextMapXy.x;
				_this.y = nextMapXy.y;
			})
		}
	},

	_moveCharacter: function(x, y, callbackFn){
		var $characterDom = $(".currentCharacter");
		$characterDom.animate({
			"left": x + "px",
			"top": y + "px"
		}, moveTime, "linear", callbackFn);
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
	}
}

module.exports = CharacterEngin