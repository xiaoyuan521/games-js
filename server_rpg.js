var path = require("path");
var koa = require("koa");
var koaStatic = require("koa-static");

var yaml = require("js-yaml");
var fs = require("fs");
var walk = require("walk");

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
		var walker = walk.walk(path.resolve(__dirname, "rpg", "backend"));
		var scriptData = {};
		walker.on("file", function(root, fileStats, next){
			var fileName = fileStats.name;
			if(/scripts*/.test(fileName)){
				var key = fileName.replace("scripts_", "").replace(".yaml", "");
				scriptData[key] = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, "rpg", "backend", fileName), 'utf8'));
			}
			next();
		});

		walker.on("errors", function(root, nodeStatsArray, next){
			reject(root);
			next();
		})

		walker.on("end", function(){
			resolve(scriptData);
		});
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

