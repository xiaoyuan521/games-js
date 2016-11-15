describe("CoorMap", function(){
	beforeEach(function(){
		var cm = new CoorMap();
		cm.set(1,1, "a");
		cm.set(1,2, "b");
		cm.set(2,1, "c");
		cm.set(2,2, "d");
	});

	describe("#set", function(){

		it("should has proper length", function(){
			expect(cm.keys.length).toEqual(4);
		})

	})
})