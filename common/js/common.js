(function(){

	function extendsJsCore(){

		String.prototype.format = function() {
	        var args = arguments;
	        return this.replace(/{(\d+)}/g, function(match, number) {
	            return typeof args[number] != 'undefined' ? args[number] : match;
	        });
	    };

	    Number.prototype.random = function(){
	    	var value = this;
	    	return parseInt(Math.random() * value,10);
	    }

	}

	extendsJsCore();


})();