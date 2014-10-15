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
		},

		//Source: http://trentrichardson.com/2010/04/06/compute-linear-regressions-in-javascript/
		linearRegression: function(y, x){
			var lr = {};
			var n = y.length;
			var sum_x = 0;
			var sum_y = 0;
			var sum_xy = 0;
			var sum_xx = 0;
			var sum_yy = 0;
			
			for (var i = 0; i < y.length; i++) {
				
				sum_x += x[i];
				sum_y += y[i];
				sum_xy += (x[i]*y[i]);
				sum_xx += (x[i]*x[i]);
				sum_yy += (y[i]*y[i]);
			} 
			
			lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
			lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
			lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
			
			return lr;
		},
	}
});