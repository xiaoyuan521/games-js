var Character = require("./Character.js");

function ScriptEngin(engin) {
	this.engin = engin;
	this.scriptData = this.engin.scriptData;
	this.currentScript = null;
}

ScriptEngin.prototype = {
	constructor: ScriptEngin,

	init: function(){
		var initScriptName = "01";
		this.currentScript = this.scriptData[initScriptName];

		// 初始化主人公
		var mainCharacterInfo = this.engin.characterData.mainCharacter;
		var name = mainCharacterInfo.name;
		var pos = mainCharacterInfo.position;
		var faceTo = mainCharacterInfo.faceTo;
		var currentCharacter = this._loadCharacter(name, pos, faceTo);
		currentCharacter.getDom().addClass("currentCharacter");
		this.engin.characterEngin.setCurrentCharacter(currentCharacter);

		this.loadCharacter();

	},

	// 加载当前地图的人物
	loadCharacter: function(){
		var currentMapKey = this.engin.mapEngin.currentMapKey;
		var currentMapScript = this.currentScript[currentMapKey];
		var characters = currentMapScript.characters;
		for(var key in characters){
			var character = characters[key];
			var name = character.name;
			var pos = character.position;
			var faceTo = character.faceTo;
			this._loadCharacter(name, pos, faceTo);
		}
	},

	_loadCharacter: function(name, pos, faceTo){
		var character = new Character(this.engin, name);
		var posArr = pos.split("_");
		this.engin.characterEngin.setCharacterPosition(posArr[0], posArr[1], faceTo);
		return character;
	}
}

module.exports = ScriptEngin;