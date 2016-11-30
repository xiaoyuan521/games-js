var maps = {}

maps["mapMapping"] = {
	"tr": {
		name: "tree.png",
		canWalk: false
	},
	"se": {
		name: "sea.png",
		canWalk: false
	},
	"be": {
		name: "beach.png",
		canWalk: true
	},
	"la": {
		name: "land.png",
		canWalk: true
	},
	"br": {
		name: "bridge.png",
		canWalk: true
	}
}

maps["01"] = {
	data: 
		"tr,tr,tr,be,se,br,se,be,tr,tr,tr_" +
		"tr,tr,tr,be,se,br,se,be,tr,tr,tr_" +
		"tr,tr,tr,be,be,br,be,be,tr,tr,tr_" +
		"tr,tr,tr,la,la,la,la,la,tr,tr,tr_" +
		"tr,tr,tr,la,la,la,la,la,tr,tr,tr_" +
		"la,la,la,la,la,la,la,la,la,la,la_" +
		"tr,tr,tr,la,la,la,la,la,tr,tr,tr_" +
		"tr,tr,tr,la,la,la,la,la,tr,tr,tr_" +
		"tr,tr,tr,be,be,br,be,be,tr,tr,tr_" +
		"tr,tr,tr,be,se,br,se,be,tr,tr,tr_" +
		"tr,tr,tr,be,se,br,se,be,tr,tr,tr",
	exit: {
		"10_5": {
			map: "02",
			initPosition: "0_5"
		},
		"5_10": {
			map: "03",
			initPosition: "1_0"
		}
	}
};

maps["02"] = {
	data: 
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"la,la,la,la,la,la,la,la,la,la,la_" +
		"la,la,la,la,la,la,la,la,la,la,la_" +
		"la,la,la,la,la,la,la,la,la,la,la_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,tr,tr,tr,tr_",
	exit: {
		"0_5": {
			map: "01",
			initPosition: "10_5"
		}
	}
};

maps["03"] = {
	data: 
		"tr,la,la,tr,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,la,la,tr,tr,tr,tr,tr,tr,tr_" +
		"tr,tr,tr,la,la,tr,tr,la,la,la,tr_" +
		"tr,tr,tr,tr,la,la,tr,la,tr,la,tr_" +
		"tr,tr,tr,tr,tr,la,tr,la,tr,la,tr_" +
		"tr,tr,tr,tr,tr,la,tr,la,tr,la,tr_" +
		"tr,tr,tr,tr,tr,la,tr,la,tr,la,tr_" +
		"tr,tr,tr,tr,tr,la,tr,la,tr,la,tr_" +
		"tr,tr,tr,tr,tr,la,la,la,la,la,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,la,tr,tr,tr_" +
		"tr,tr,tr,tr,tr,tr,tr,la,la,la,tr_",
	exit: {
		"1_0": {
			map: "01",
			initPosition: "5_10"
		}
	}
};


// 地图数据串转二维数组
function toArray(str){
	var returnArray = [];
	var lineArr = str.split("_");
	lineArr.forEach(function(line){
		returnArray.push(line.split(","));
	});
	return returnArray;
}


for(var key in maps){
	if(/\d\d/.test(key)){
		maps[key].data = toArray(maps[key].data);
	}
}

module.exports = maps