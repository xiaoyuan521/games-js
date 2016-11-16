describe("CoorMap", function(){

	var coormap = null;

	beforeEach(function(){

		var CoorMap = require("../../snake/CoorMap.js");

		coormap = new CoorMap();

	});

	describe("#set", function(){

		it("should has proper length", function(){

			coormap.set(1,1, "a");
			coormap.set(1,2, "b");
			coormap.set(2,1, "c");
			coormap.set(2,2, "d");

			expect(coormap.map.size).toEqual(4);
		});


		it("should set wright value", function(){
			coormap.set(1,1, "a");
			coormap.set(1,2, "b");
			coormap.set(2,1, "c");
			coormap.set(2,2, "d");

			expect(coormap.get(1,1)).toEqual("a");
			expect(coormap.get(2,2)).toEqual("d");
		})

	});

	describe("#get", function(){
		beforeEach(function(){
			coormap.set(1,1, "a");
			coormap.set(1,2, "b");
			coormap.set(2,1, "c");
			coormap.set(2,2, "d");
		});

		it("should get correct value", function(){
			expect(coormap.get(1,2)).toEqual("b");
		});
	})

})