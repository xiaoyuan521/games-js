var CoorMap = require("./CoorMap");
var MapEngin = require("./MapEngin");
var CharacterEngin = require("./CharacterEngin.js");

function Engin(config) {
	this.config = config;
	this.dataSource = new CoorMap();
	this.mapEngin = null;
	this.characterEngin = null;

	this.mapData = null;
	this.scriptData = null;
}

Engin.prototype = {
	constructor: Engin,

	init: function() {
		var _this = this;
		$.when(this.getInitData()).then(function(result){
			console.log("11111111");
			console.log(result);
			
			_this.mapEngin = new MapEngin(_this, result.mapData);
			_this.mapEngin.init();

			_this.characterEngin = new CharacterEngin(_this);
			_this.characterEngin.init();

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
		if(this.mapEngin.checkChangeMap(x,y) == true){
			return;
		}
	},

	_initOverlay: function(){
		$(".overlay").on("keydown", function(e){
			e.stopPropagation();
			e.preventDefault();
		})
	},

	start: function() {

	},

	setDataSource: function(dataSource) {
		this.dataSource = dataSource;
	},

	getDataSource: function(){
		return this.dataSource;
	}
}

module.exports=Engin;
