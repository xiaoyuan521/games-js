var PLAY_TIME = 200;

function Lines(engin){
	this.engin = engin;

	this.linesObj = null; // 当前地图的全部对话对象
	this.currentRef = null; // 当前人物间的全部对话的key
	this._index = 0; // 当前对话走到的index

	this.currentOption = null;
	this._optionIndex = 0;

	this._interval_handler = null;
	this.isPlaying = false;

	this.nextScript = null;
}

Lines.prototype = {

	constructor: Lines,

	init: function() {
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
		this._optionIndex = 0;
		var $options = $(".lines .options");
		options.forEach(function(o, index){
			$o = $('<div class="option"></div>')
			$o.html(o.content).appendTo($options);
			if(index == 0){
				$o.addClass("selected");
			}
		});
		this.currentOption = options;
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

		// 在option选择模式中
		if(this.currentOption){

			// 根据options已经做出了选择，清空
			$(".lines .options").empty();
		
			var optionInfos = this.currentOption;
			this.currentOption = null;

			var selectedOption = optionInfos[this._optionIndex];
			
			// 选择某个分支，设定剧情脚本，等待对话结束触发剧情
			if(selectedOption.script){
				this.nextScript = selectedOption.script;
			}

			// 选择某个分支，继续对话
			if(selectedOption.line_ref){
				this._index = 0;
				this.currentRef = selectedOption.line_ref;
			}
		}

		var lineArr = this.linesObj[this.currentRef];
		if(this._index >= lineArr.length){
			// 结束对话
			this.stopLines();
			return;
		}

		var currentLine = this._getCurrentLineObj();

		// 跟随主角
		if(currentLine.follower){
			var followerName = currentLine.follower.name;

			if(!followerName){
				// name是空的情况下，删除跟随的角色
				this.engin.characterEngin.currentCharacter.clearFollower();
			}else{
				// 设定跟随者
				var characterEngin = this.engin.characterEngin;
				var followerObj = characterEngin.currentNpcs[followerName];
				followerObj.getDom().addClass("follower");
				this.engin.characterEngin.removeFromDataSource(followerObj);
				characterEngin.currentCharacter.setFollower(followerObj);
			}
		}

		// 触发剧情
		if(currentLine.script) {
			this.nextScript = currentLine.script;
		}

		// 	设定头像
		var $avatar = $(".lines .avatar_container");
		if(this.engin.debugMode){
			var characterName = currentLine.character;
			var $nameDiv = $('<div class="wrapByWord debug"></div>');
			$nameDiv.text(characterName).css({
				"max-width": "100%",
				"max-height": "100%"
			});
			$avatar.empty();
			$nameDiv.appendTo($avatar);
		} else {
			var characterData = this.engin.characterData;
			var characterName = currentLine.character;
			var avatarPath = 'images/' + characterData.characters[characterName].avatar;
			var $avatarImg = $('<img src="" alt="" />').attr("src", avatarPath);
			$avatarImg.css({
				"max-width": "100%",
				"max-height": "100%"
			});
			$avatar.empty();
			$avatarImg.appendTo($avatar);
		}


		// 播放台词
		var count = 1;
		this.isPlaying = true;
		var contentArr = this._getContentArr(currentLine.content);
		this._interval_handler = setInterval(function(){
			var displayContent = contentArr.slice(0,count).join("");
			$content.html(displayContent);
			count++;
			if(count > contentArr.length) {
				clearInterval(_this._interval_handler);
				var options = currentLine.options;
				if(options){
					_this.initOptions(options);
				}
				_this.isPlaying = false;
				_this._index++;
				if(callback){
					callback();
				}
			}
		}, PLAY_TIME);

	},

	playEnd: function() {
		if(this.isPlaying === false) {
			return;
		}
		var $content = $(".lines .content");
		var currentLine = this._getCurrentLineObj();
		$content.html(currentLine.content);
		clearInterval(this._interval_handler);
		var options = currentLine.options;
		if(options){
			this.initOptions(options);
		}
		this._index++;
		this.isPlaying = false;
	},

	stopLines: function(){
		// 本段对话结束
		$(".lines-overlay").hide();
		$("div.lines").hide();
		$("div.lines .avatar_container").empty();
		$("div.lines .content_container > div").empty();

		this.changeScript();
	},

	changeScript: function() {
		if(!this.nextScript){
			return;
		}

		// 剧情脚本设定
		var scriptKey = this.nextScript.key;
		this.engin.scriptEngin.changeScript(scriptKey);

		var mapKey = this.nextScript.mapKey;
		if(mapKey){
			// 地图变更的场合，重新加载地图
			this.engin.mapEngin.loadMap(mapKey);
			// 加载地图上的人物
			this.engin.characterEngin.loadCharacter();
			// 设定主人公的位置
			var position = this.nextScript.position;
			if(position){
				var faceTo = this.nextScript.faceTo;
				var posArr = position.split("_");
				this.engin.characterEngin.currentCharacter.setPosition(posArr[0], posArr[1], faceTo);
			}
		}


		this.nextScript = null;
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
		$options.removeClass("selected").eq(this._optionIndex).addClass("selected");
	},

	_getCurrentLineObj: function(){
		var lineArr = this.linesObj[this.currentRef];
		var line = lineArr[this._index];
		return line;
	},

	// 将对话内容分成每次显示的数组
	// 由于对话内容中可能存在html语法，所以需要这样做
	_getContentArr: function(content){
		var regExp = new RegExp("[^<]|<.*?</.*?>", "g");
		var result;
		var contentArr = [];
		while((result = regExp.exec(content)) != null){
			contentArr.push(result[0]);
		}
		return contentArr;
	}
}

module.exports = Lines;