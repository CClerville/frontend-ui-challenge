var app = app || {};

$(function(){
	app.SegmentView = Backbone.View.extend({
		el: '#segments',
		
		template : Handlebars.compile( $( "#segments-view-tpl" ).html() ),

		events: {
			'click td a': 'updateData'
		},

		initialize: function() {
			var me = this;

			me.listenTo(app.dataCollection, "change", me.render );
			me.listenTo(app.EventBus, "update_data", me.render );
		},

		render: function() {
			var me = this,
				data = app.dataCollection.models,
				len = data.length,
				total_seg = 0,
				results = {};

			for(var i = 0 ; i < len ; i++) {
				if( moment(data[i].Date) >= moment(app.config.timeline) ) {
					if( ! results[ data[i].Gender ] ) {
						results[ data[i].Gender ] = 1;
					} else {
						results[ data[i].Gender ]++;
					}
					total_seg++;
				}
			}
			results['female'] = app.util.formatNum( results['female'] );
			results['male'] = app.util.formatNum( results['male'] );
			results['total'] = app.util.formatNum( total_seg );

			me.$el.html( me.template( results ) );
			me.delegateEvents(me.events);
			return me;
		},

		updateData: function(e){
			e.preventDefault();
			app.config.segment = $(e.target).text();

			// trigger global event
			app.EventBus.trigger('update_data');
		}
	});
});