var path = require("path");
var koa = require("koa");
var koaStatic = require("koa-static");

var yaml = require("js-yaml");
var fs = require("fs");

var app = koa();
app.use(koaStatic(path.resolve(__dirname, ".")));

app.use(function* (next){
	if(this.path == "/init"){
		var scriptData = yield getScriptData();
		var mapData = yield getMapData();
		var characterData = yield getCharacters();
		this.body = {
			scriptData: scriptData,
			mapData: mapData,
			characterData: characterData
		};
		return;
	}
});

function getScriptData(){
	return new Promise((resolve, reject) => {
		var scriptData = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, "rpg", "backend","scripts_01.yaml"), 'utf8'));
		resolve(scriptData);
	});
}

function getMapData(){
	return new Promise((resolve, reject) => {
		var mapData = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, "rpg", "backend","maps.yaml"), 'utf8'));
		resolve(mapData);
	});
}

function getCharacters(){
	return new Promise((resolve, reject) => {
		var mapData = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, "rpg", "backend","characters.yaml"), 'utf8'));
		resolve(mapData);
	});
}

app.listen(3000, function(){
	console.log("server started on 3000 ...");
});

