var EnginBase = require("./EnginBase.js");
var Lines = require("./Lines");

function LinesEngin(engin){
	EnginBase.prototype.constructor.apply(this, arguments);

	this.engin = engin;
	this.lines = null;
	this.isPlaying = false; // 台词播放中flag
}

// 继承基类
LinesEngin.prototype = new EnginBase();

var methods = {
	init: function(){
		this.initDom();
		this.initLines();
		this.bindEvent();
	},

	initLines: function(){
		this.lines = new Lines();
		this.lines.init();
	},

	initDom: function(){
		var characterData = this.engin.characterData;

		var $linesDiv = $('<div class="lines"></div>');

		// avatar
		var avatarWidth = characterData.avatar.maxWidth;
		var $avatarContainer = $('<div class="avatar_container"></div>');
		$avatarContainer.css({
			"width": avatarWidth + "px"
		}).appendTo($linesDiv);
		
		// content
		var $contentContainer = $('<div class="content_container"></div>')
		$contentContainer.appendTo($linesDiv);
		
		$linesDiv.appendTo(".lines-layer");
	},

	setLinesObj: function(linesObj, lineRef){
		this.lines.setLinesObj(linesObj, lineRef);
	},

	start: function(){
		var _this = this;
		this.isPlaying = true;
		this.lines.play(function(){
			_this.isPlaying = false;
		});
	},

	bindEvent: function(){
		var _this = this;
		$(".lines-overlay").on("keydown", function(e){
			e.preventDefault();
			e.stopPropagation();
			
			var keyCode = e.keyCode;
			if(keyCode === 32 || keyCode === 13){
				// 空格和回车触发事件
				if(_this.isPlaying === true){
					_this.lines.playEnd();
					_this.isPlaying = false;
				} else {
					_this.isPlaying = true;
					_this.lines.play(function(){
						_this.isPlaying = false;
					});
				}
			}
			if(keyCode === 38) {
				_this.lines.chooseUp();
			}
			if(keyCode === 40) {
				_this.lines.chooseDown();
			}


		});
	}
}

for(var key in methods){
	LinesEngin.prototype[key] = methods[key];
}
LinesEngin.prototype.constructor = LinesEngin;

module.exports = LinesEngin;