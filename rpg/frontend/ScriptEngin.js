var Character = require("./Character.js");

function ScriptEngin(engin) {
	this.engin = engin;
	this.scriptData = this.engin.scriptData;
	this.currentScriptKey = "01";
}

ScriptEngin.prototype = {
	constructor: ScriptEngin,

	init: function() {

		// 加载主人公
		var mainCharacterInfo = this.engin.characterData.mainCharacter;
		var name = mainCharacterInfo.name;
		var pos = mainCharacterInfo.position;
		var faceTo = mainCharacterInfo.faceTo;
		var currentCharacter = this._loadCharacter(name, pos, faceTo);
		currentCharacter.getDom().addClass("currentCharacter");
		this.engin.characterEngin.setCurrentCharacter(currentCharacter);

		// 加载其他人物
		this.loadCharacter();

	},

	// 加载当前地图的人物
	loadCharacter: function() {
		$(".character-layer > div").not(".currentCharacter").remove();

		var currentScriptKey = this.currentScriptKey;
		var currentMapKey = this.engin.mapEngin.currentMapKey;
		var currentMapScript = this.scriptData[currentScriptKey][currentMapKey];
		if(!currentMapScript || !currentMapScript.characters){
			return;
		}		
		var characters = currentMapScript.characters;
		for(var key in characters) {
			var character = characters[key];
			var name = key;
			var pos = character.position;
			var faceTo = character.faceTo;
			this._loadCharacter(name, pos, faceTo, true);
		}
	},

	_loadCharacter: function(name, pos, faceTo, changeDataSourceFlg){
		var config = this.engin.config;
		var cellSize = config.cellSize;

		// 设定人物到画面上
		var character = new Character(this.engin, name);
		var posArr = pos.split("_");
		var x = parseInt(posArr[0],10) * cellSize;
		var y = parseInt(posArr[1], 10) * cellSize;
		character.setPosition(x, y, faceTo);

		if(changeDataSourceFlg === true){
			// 设定人物到datasource中
			var dataSource = this.engin.getDataSource();
			var dataSourcePoint = dataSource.get(x,y);
			dataSourcePoint.character = {
				name: name,
				faceTo: faceTo
			}
		}

		return character;
	},

	changeScript: function(scriptKey){
		this.currentScriptKey = scriptKey;
	},

	getCurrentScript: function(){
		var mapKey = this.engin.mapEngin.currentMapKey;
		var scriptKey = this.currentScriptKey;
		var scriptInfo = this.scriptData[scriptKey][mapKey];
		return scriptInfo;
	}
}

module.exports = ScriptEngin;