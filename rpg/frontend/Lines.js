var PLAY_TIME = 200;

function Lines(engin){
	this.engin = engin;
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

	initDom: function() {

		var $avatarContainer = $("div.lines .avatar_container");
		$('<div class="avatar"></div>').appendTo($avatarContainer);

		var $contentContainer = $("div.lines .content_container");
		$('<div class="content wrapByWord"></div>').appendTo($contentContainer);
		$('<div class="options wrapByWord"></div>').appendTo($contentContainer);
	},

	initOptions: function(options) {
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

	play: function(callback) {
		var _this = this;
		var $content = $(".lines .content");
		
		if(!this.currentRef){
			// 结束对话
			this._stopLines();
			return;
		}

		var lineArr = this.linesObj[this.currentRef];
		var line = this.currentLine = lineArr[this._index];
		this._index++;

		if(!line) {
			// 结束对话
			this._stopLines();
			return;
		}


		// 	设定头像
		var characterData = this.engin.characterData;
		var characterName = line.character;
		var avatarPath = 'images/' + characterData.characters[characterName].avatar;
		var $avatar = $(".lines .avatar_container");
		var $avatarImg = $('<img src="" alt="" />').attr("src", avatarPath);
		$avatarImg.css({
			"max-width": "100%",
			"max-height": "100%"
		});
		$avatar.empty();
		$avatarImg.appendTo($avatar);

		// 有options的情况下，重置相关变量
		if(line.options){
			this._optionIndex = 0;
			this._resetLinesByOption(0);
		}else {
			$(".lines .options").empty();
		}

		// 播放台词
		var count = 1;
		this.isPlaying = true;
		this._interval_handler = setInterval(function(){
			var content = line.content;
			var displayContent = line.content.substring(0, count);
			$content.text(displayContent);
			count++;
			if(count > content.length) {
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
	},

	_stopLines: function(){
		// 本段对话结束
		$(".lines-overlay").hide();
		$("div.lines").hide();
		$("div.lines .avatar_container").empty();
		$("div.lines .content_container > div").empty();
	}
}

module.exports = Lines;