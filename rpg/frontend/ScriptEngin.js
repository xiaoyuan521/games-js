var Character = require("./Character.js");

function ScriptEngin(engin) {
	this.engin = engin;
	this.scriptData = this.engin.scriptData;
	this.currentScriptKey = "01";
}

ScriptEngin.prototype = {
	constructor: ScriptEngin,

	init: function() {

		var characterEngin = this.engin.characterEngin;

		// 做成全部剧情用的对象
		this._calcScriptData();

		// 加载主人公
		var mainCharacterInfo = this.engin.characterData.mainCharacter;
		var name = mainCharacterInfo.name;
		var pos = mainCharacterInfo.position;
		var faceTo = mainCharacterInfo.faceTo;
		var currentCharacter = characterEngin._loadCharacter(name, pos, faceTo);
		currentCharacter.getDom().addClass("currentCharacter");
		characterEngin.setCurrentCharacter(currentCharacter);

		// 加载其他人物
		characterEngin.loadCharacter();

	},

	changeScript: function(scriptKey){
		this.currentScriptKey = scriptKey;
	},

	getCurrentScript: function(){
		var mapKey = this.engin.mapEngin.currentMapKey;
		var scriptKey = this.currentScriptKey;
		var scriptInfo = this.scriptData[scriptKey][mapKey];
		return scriptInfo;
	},

	_calcScriptData: function(){
		var baseScriptData = this.scriptData;
		var maxScriptNum = 0;
		var maxMapNumber = 0;
		var scriptKeyArr = [];
		var mapKeyArr = [];
		for(var key in baseScriptData){
			var keyInt = parseInt(key, 10);
			if(keyInt > maxScriptNum){
				maxScriptNum = keyInt;
				scriptKeyArr.push(key);
			}

			for(var mapKey in baseScriptData[key]){
				var mapKeyInt = parseInt(mapKey, 10);
				if(mapKeyInt > maxMapNumber){
					maxMapNumber = mapKeyInt;
					mapKeyArr.push(mapKey);
				}
			}
		}
		scriptKeyArr.sort();
		mapKeyArr.sort();

		console.log("maxScriptNum", maxScriptNum, scriptKeyArr);
		console.log("maxMapNumber", maxMapNumber, mapKeyArr);

		var resultScriptData = {};
		for(var i=0;i<scriptKeyArr.length;i++){
			var skey = scriptKeyArr[i];
			var fullMapScriptData = {};
			for(var j=0; j< mapKeyArr.length; j++){
				var mkey = mapKeyArr[j];
				var keyMapScriptData = this._findPreScript(baseScriptData, skey, mkey);
				fullMapScriptData[mkey] = fullMapScriptData;
			}
			resultScriptData[skey] = fullMapScriptData;
		}
		console.log("all done ...", resultScriptData);
		this.scriptData = resultScriptData;
	},

	_findPreScript: function(scriptDataObj, scriptKey, mapKey){
		scriptKey = scriptKey + "";
		mapKey = mapKey + "";
		var scriptData = scriptDataObj[scriptKey];
		if(!scriptData) {
			var preScriptKey = parseInt(scriptKey, 10) -1;
			if(preScriptKey < 0){
				console.error("preScriptKey is under zero !!!");
				return;
			}
			preScriptKey = this._formatKey(preScriptKey);
			return this._findPreScript(scriptDataObj, preScriptKey, mapKey);
		}
		var mapScriptData = scriptData[mapKey];
		if(mapScriptData){
			return mapScriptData;
		} else {
			var preScriptKey = parseInt(scriptKey, 10) -1;
			if(preScriptKey < 0){
				console.error("preScriptKey is under zero !!!");
				return;
			}
			preScriptKey = this._formatKey(preScriptKey);
			return this._findPreScript(scriptDataObj, preScriptKey, mapKey);
		}
	},

	_formatKey: function(key){
		key = key + "";
		if(key.length == 1){
			return "0" + key;
		}else {
			return key;
		}
	}
}

module.exports = ScriptEngin;