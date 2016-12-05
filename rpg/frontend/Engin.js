var CoorMap = require("./CoorMap");
var MapEngin = require("./MapEngin");
var CharacterEngin = require("./CharacterEngin.js");
var ScriptEngin = require("./ScriptEngin.js");

function Engin(config) {
	this.config = config;
	this.dataSource = new CoorMap();

	this.mapData = null;
	this.mapEngin = null;
	
	this.characterData = null;
	this.characterEngin = null;

	this.scriptData = null;
	this.scriptEngin = null;
}

Engin.prototype = {
	constructor: Engin,

	init: function() {
		var _this = this;
		$.when(this.getInitData()).then(function(result){
			console.log(result);
			
			_this.mapData = result.mapData;
			_this.mapEngin = new MapEngin(_this);
			_this.mapEngin.init();

			_this.characterData = result.characterData;
			_this.characterEngin = new CharacterEngin(_this);
			_this.characterEngin.init();

			_this.scriptData = result.scriptData;
			_this.scriptEngin = new ScriptEngin(_this);
			_this.scriptEngin.init();

			_this._initOverlay();
		});
	},

	getInitData: function(){
		var deferred = new $.Deferred();
		var _this = this;
		var url = "/init";
		$.ajax(url, {
			method: "get"
		}).then(function(result){
			deferred.resolve(result);
		})
		return deferred;
	},

	// 检测地图切换
	// 检测剧情发生
	checkEvent: function(x, y){
		var changeToMap = this.mapEngin.checkChangeMap(x,y);
		if( changeToMap === false){
			return;
		}

		// 地图切换，加载当前地图人物
		this.scriptEngin.loadCharacter();
	},

	_initOverlay: function(){
		$(".overlay").on("keydown", function(e){
			e.stopPropagation();
			e.preventDefault();
		})
	},

	setDataSource: function(dataSource) {
		this.dataSource = dataSource;
	},

	getDataSource: function(){
		return this.dataSource;
	}
}

module.exports=Engin;
