var PLAY_TIME = 200;

function Lines(){
	this.isChooseMode = false;
	this.linesObj = null;
	this.currentRef = null;
	this.currentOptions = null;

	this._index = 0;
	this._interval_handler = null;

	this.currentLine = null;
}

Lines.prototype = {

	constructor: Lines,

	init: function(){
		this.initDom();
	},

	initDom: function(){
		var $lines = $("div.lines");
		$('<div class="content"></div>').appendTo($lines);
		$('<div class="options"></div>').appendTo($lines);
	},

	setLinesObj: function(linesObj, startRef){
		this.linesObj = linesObj;
		this.currentRef = startRef;
	},

	play: function(callback){
		var lineArr = this.linesObj[this.currentRef];
		var line = this.currentLine = lineArr[this._index];
		this._index++;
		var count = 1;

		var _this = this;
		var $content = $(".lines .content");
		this._interval_handler = setInterval(function(){
			var content = line.content;
			var displayContent = line.content.substring(0, count);
			$content.text(displayContent);
			count++;
			if(count > content.length ){
				clearInterval(_this._interval_handler);
				_this.currentLine = null;
				if(callback){
					callback();
				}
			}
		}, PLAY_TIME);

	},

	playEnd: function(){
		if(!this.currentLine){
			return;
		}
		var $content = $(".lines .content");
		$content.text(this.currentLine.content);
		clearInterval(this._interval_handler);
	},

	chooseUp: function(){
		
	},

	chooseDown: function(){

	}
}

module.exports = Lines;