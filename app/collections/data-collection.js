var app = app || {};

$(function(){
	app.DataCollection = Backbone.Collection.extend({
	    model: app.DataModel,

	    initialize: function(){
	    	var me = this;

	    	$.get('sample-data.csv', function(data){
	    		if(!data) return;

	    		// Split the lines
	    		var lines = data.split('\n'),
	    			header_categories = lines[0].split(','),
	    			result = [],
	    			lines_len = lines.length,
	    			totaActivity = 0;

	    		for( var i = 1 ; i < lines_len ; i ++ ) {
	    			var item = lines[i].split(',');

	    			if(item.length > 1 ) {
	    				var tmp_data = {},
	    					item_len = item.length;

	    				for(var d = 0 ; d < item_len ; d++) {
		    				tmp_data[header_categories[d]] = item[d];
		    			}
		    			result.push(tmp_data);
		    			if( _.last( item ) == 1 ) totaActivity++;
	    			}
	    		}

	    		app.config.totalActivityRecorded = totaActivity;
	    		me.models = result;
	    		me.trigger('change');
	    	});
	    }
	});
});