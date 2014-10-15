var app = app || {};

$(function(){
	app.StatsButtonsView = Backbone.View.extend({
		el: '#stats-btns-section',

		template : Handlebars.compile( $( "#stats-buttons-view-tpl" ).html() ),

		events: {
			'click .mean-line-btn': 'onMeanLineButtonClick',
			'click .trend-line-btn': 'onTrendLineButtonClick' 
		},

		initialize: function() {
			var me = this;
			me.render();
		},

		render: function() {
			var me = this;
			me.$el.html( me.template() );
			me.delegateEvents(me.events);

			return me;
		},

		onTrendLineButtonClick: function(e){
			e.preventDefault();
			app.EventBus.trigger('onTrendButtonClick');
		},

		onMeanLineButtonClick: function(e){
			e.preventDefault();
			app.EventBus.trigger('onMeanButtonClick');
		}
	});
});