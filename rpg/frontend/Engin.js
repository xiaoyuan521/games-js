var MapEngin = require("./MapEngin");

function Engin(config){
	this.config = config;
	this.dataSource = null;
	this.mapEngin = new MapEngin(config);
}

Engin.prototype = {
	constructor: Engin,

	init: function(){
		this.mapEngin.init(this);
	},

	start: function(){

	},

	setDataSource: function(dataSource){
		this.dataSource = dataSource;
	}
}

module.exports=Engin;
