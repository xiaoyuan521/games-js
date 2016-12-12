var PLAY_TIME = 200;

function Lines(){
	this.linesObj = null;
	this.currentRef = null;

	this._index = 0;
	this._optionIndex = 0;
	this._interval_handler = null;

	this.isPlaying = false;
	this.currentLine = null;
}

Lines.prototype = {

	constructor: Lines,

	init: function(){
		this.initDom();
	},

	initDom: function(){
		var $contentContainer = $("div.lines .content_container");
		$('<div class="content"></div>').appendTo($contentContainer);
		$('<div class="options"></div>').appendTo($contentContainer);
	},

	initOptions: function(options){
		var $options = $(".lines .options");
		options.forEach(function(o, index){
			$o = $('<div class="option"></div>')
			$o.text(o.content).appendTo($options);
			if(index == 0){
				$o.addClass("selected");
			}
		})
	},

	setLinesObj: function(linesObj, startRef){
		this.linesObj = linesObj;
		this.currentRef = startRef;
		this._index = 0;
		this.isPlaying = false;
	},

	play: function(callback){
		var _this = this;
		var $content = $(".lines .content");
		
		var lineArr = this.linesObj[this.currentRef];
		var line = this.currentLine = lineArr[this._index];
		this._index++;

		if(!line) {
			// 本段对话结束
			$(".lines-overlay").hide();
			$("div.lines").hide();
			$("div.lines .avatar_container").empty();
			$("div.lines .content_container > div").empty();
			return;
		}

		var character = line.character;
		var avatarPath = "images" + character + "_"

		if(line.options){
			this._optionIndex = 0;
			this._resetLinesByOption(0);
		}else {
			$(".lines .options").empty();
		}

		var count = 1;
		this.isPlaying = true;
		this._interval_handler = setInterval(function(){
			var content = line.content;
			var displayContent = line.content.substring(0, count);
			$content.text(displayContent);
			count++;
			if(count > content.length ){
				clearInterval(_this._interval_handler);
				var options = _this.currentLine.options;
				if(options){
					_this.initOptions(options);
				}
				_this.isPlaying = false;
				if(callback){
					callback();
				}
			}
		}, PLAY_TIME);

	},

	playEnd: function(){
		if(this.isPlaying === false){
			return;
		}
		var $content = $(".lines .content");
		$content.text(this.currentLine.content);
		clearInterval(this._interval_handler);
		var options = this.currentLine.options;
		if(options){
			this.initOptions(options);
		}
		this.isPlaying = false;

	},

	chooseUp: function(){
		var $options = $(".lines .option");
		var len = $options.length;
		if(len <= 0){
			return;
		}
		this._optionIndex--;
		if(this._optionIndex < 0){
			this._optionIndex = len - 1;
		}
		this._resetLinesByOption(this._optionIndex);
		$options.removeClass("selected").eq(this._optionIndex).addClass("selected");
	},

	chooseDown: function(){
		var $options = $(".lines .option");
		var len = $options.length;
		if(len <= 0){
			return;
		}
		this._optionIndex++;
		if(this._optionIndex >= len){
			this._optionIndex = 0;
		}
		this._resetLinesByOption(this._optionIndex);
		$options.removeClass("selected").eq(this._optionIndex).addClass("selected");
	},

	_resetLinesByOption: function(optionIndex){
		var line = this.currentLine;
		this.currentRef = line.options[optionIndex]["line_ref"];
		this._index = 0;
	}
}

module.exports = Lines;