var MapEngin = require("./MapEngin");
var CharacterEngin = require("./CharacterEngin.js");

function Engin(config) {
	this.config = config;
	this.dataSource = null;
	this.mapEngin = new MapEngin(config);
	this.characterEngin = new CharacterEngin(config);
}

Engin.prototype = {
	constructor: Engin,

	init: function() {
		this.mapEngin.init(this);
		this.characterEngin.init(this);

		this._initOverlay();
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
