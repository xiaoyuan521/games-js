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
		var currentScriptKey = this.currentScriptKey;
		var currentMapKey = this.engin.mapEngin.currentMapKey;
		var currentMapScript = this.scriptData[currentScriptKey][currentMapKey];
		var characters = currentMapScript.characters;
		for(var key in characters) {
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
		character.setPosition(posArr[0], posArr[1], faceTo);
		return character;
	},

	changeScript: function(scriptKey){
		this.currentScriptKey = scriptKey;
	}
}

module.exports = ScriptEngin;