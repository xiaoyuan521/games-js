var MapEngin = require("./MapEngin");
var CharacterEngin = require("./CharacterEngin.js");

function Engin(config){
	this.config = config;
	this.dataSource = null;
	this.mapEngin = new MapEngin(config);
	this.characterEngin = new CharacterEngin();
}

Engin.prototype = {
	constructor: Engin,

	init: function(){
		this.mapEngin.init(this);
		this.characterEngin.init();
	},

	start: function(){

	},

	setDataSource: function(dataSource){
		this.dataSource = dataSource;
	}
}

module.exports=Engin;
