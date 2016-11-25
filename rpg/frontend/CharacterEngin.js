var characters = require("./characters");

function CharacterEngin() {
	this.currentDirection = "right";
	this.nextDirection = null;

	this.currentMove = "01"; // x = 0; y = 1

	this.characterData = null;

}

CharacterEngin.prototype = {
	constructor: CharacterEngin,

	init: function(){
		this.loadCharacter("girl");

	},

	loadCharacter: function(name){
		this.characterData = characters[name];
		var characterSize = characterData.size;
		var imgPath = "images/" + characterData.imgName;

		var $characterDom = $('<div class="currentCharacter"></div>');
		$characterDom.appendTo($(".main"));

		var positions = this._getPositionXY(characterSize, this.currentMove);
		$characterDom.css({
			"width": characterSize + "px",
			"height": characterSize + "px",
			"background-image": "url('" + imgPath + "')",
			"background-position-x": positions.x + "px",
			"background-position-y": positions.y + "px"
		})

	},

	walk: function(){

		if(this.nextDirection = null){
			return;
		}

		var nextMove = this._getNextMove();
		var nextPositions = this._getPositionXY(this.characterData, nextMove);

		var $characterDom = $(".currentCharacter");
		$characterDom.css({
			"background-position-x": nextPositions.x + "px",
			"background-position-y": nextPositions.y + "px"
		})

	},

	_getPositionXY: function(size, movePosition){
		var x = size * parseInt(movePosition[0], 10) * -1;
		var y = size * parseInt(movePosition[1], 10) * -1;
		return {
			x: x,
			y: y
		}
	},

	_getNextMove: function(){
		var currentMove = this.currentMove;
		var currentDirection = this.currentDirection;
		var nextDirection = this.nextDirection;
		switch(nextDirection){
			case: "left"
				if(currentDirection != "left") {
					return 
				}
			case:"right"
			case: "up"
			case: "down"
			defalt:
				break;
		}
	}
}

module.exports = CharacterEngin