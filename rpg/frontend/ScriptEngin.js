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

		// 做成全部剧情的数据对象
		this._calcScriptData();

		// 加载主人公
		var mainCharacterInfo = this.engin.characterData.mainCharacter;
		var name = mainCharacterInfo.name;
		var pos = mainCharacterInfo.position;
		var faceTo = mainCharacterInfo.faceTo;
		var currentCharacter = characterEngin._loadCharacter(name, pos, faceTo);
		currentCharacter.getDom().addClass("currentCharacter").attr("z-index", "100");
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
		var scriptKeyArr = []; // 全部剧情脚本key的数据
		var mapKeyArr = []; // 全部地图key的数组
		for(var key in baseScriptData){
			if(scriptKeyArr.indexOf(key) == -1){
				scriptKeyArr.push(key);
			}

			for(var mapKey in baseScriptData[key]){
				if(mapKeyArr.indexOf(mapKey) == -1){
					mapKeyArr.push(mapKey);
				}
			}
 		}

 		// 剧情key，地图key 的2个数组排序
 		var _sortByInt = function(a,b){
 			var inta = parseInt(a, 10);
 			var intb = parseInt(b, 10);
 			if(inta == intb){
 				return 0;
 			}
 			return inta > intb ? 1 : -1;
 		}
		scriptKeyArr.sort(_sortByInt);
		mapKeyArr.sort(_sortByInt);

		// console.log("maxScriptNum", maxScriptNum, scriptKeyArr);
		// console.log("maxMapNumber", maxMapNumber, mapKeyArr);

		var resultScriptData = {};
		for(var i=0;i<scriptKeyArr.length;i++){
			var skey = scriptKeyArr[i];
			var fullMapScriptData = {};
			for(var j=0; j< mapKeyArr.length; j++){
				var mkey = mapKeyArr[j];
				var keyMapScriptData = this._findPreScript(baseScriptData, skey, mkey);
				fullMapScriptData[mkey] = keyMapScriptData;
			}
			resultScriptData[skey] = fullMapScriptData;
		}
		// console.log("all done ...", resultScriptData);
		this.scriptData = resultScriptData;
	},

	// 递归寻找某个剧情下的某张地图数据
	// 如果当前剧情中找不到地图数据，向前一个剧情中找寻
	_findPreScript: function(scriptDataObj, scriptKey, mapKey){
		scriptKey = scriptKey + "";
		mapKey = mapKey + "";
		var scriptData = scriptDataObj[scriptKey];
		if(!scriptData) {
			// 剧情脚本的key可能不连续  01 ,03, 05 ...
			var preScriptKey = parseInt(scriptKey, 10) -1;
			if(preScriptKey < 0){
				console.error("preScriptKey is under zero !!!");
				return;
			}
			preScriptKey = this._addZero(preScriptKey);
			return this._findPreScript(scriptDataObj, preScriptKey, mapKey);
		}

		var mapScriptData = scriptData[mapKey];
		if(mapScriptData){
			return mapScriptData;
		} else {
			// 当前剧情脚本中没有这张地图，向前一个剧情脚本继续寻找
			var preScriptKey = parseInt(scriptKey, 10) -1;
			if(preScriptKey < 0){
				console.error("preScriptKey is under zero !!!");
				return;
			}
			preScriptKey = this._addZero(preScriptKey);
			return this._findPreScript(scriptDataObj, preScriptKey, mapKey);
		}
	},

	_addZero: function(key){
		key = key + "";
		if(key.length == 1){
			return "0" + key;
		}else {
			return key;
		}
	}
}

module.exports = ScriptEngin;