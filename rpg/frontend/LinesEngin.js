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
		this.initLines();
		this.initDom();
		this.bindEvent();
	},

	initLines: function(){
		this.lines = new Lines();
	},

	initDom: function(){
		$('<div class="lines"></div>').appendTo(".lines-layer");
	},

	setLinesObj: function(linesObj, lineRef){
		this.lines.setLinesObj(linesObj, lineRef);
	},

	start: function(){
		var _this = this;
		this.lines.play(function(){
			_this.isPlaying = false;
		});
	},

	bindEvent: function(){
		$(".lines-overlay").on("keydown", function(e){
			var _this = this;
			var keyCode = e.keyCode;
			if(keyCode === 32 || keyCode === 13){
				// 空格和回车触发事件
				if(this.isPlaying === true){
					this.lines.playEnd();
					this.isPlaying = false;
				} else {
					this.lines.play(function(){
						_this.isPlaying = false;
					});
				}
			}
			if(keyCode === 38) {
				this.lines.chooseUp();
			}
			if(keyCode === 40) {
				this.lines.chooseDown();
			}

			e.stopPropagation();
		});
	}
}

for(var key in methods){
	LinesEngin.prototype[key] = methods[key];
}
LinesEngin.prototype.constructor = LinesEngin;

module.exports = LinesEngin;