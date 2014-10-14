var app = app || {};

$(function(){
	app.util = {
		capitalize: function(s) {
			if(s) {
				return s[0].toUpperCase() + s.slice(1);
			} 
		},
		formatNum: function(num){
			return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
		}
	}
});