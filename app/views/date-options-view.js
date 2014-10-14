var app = app || {};

$(function(){
	app.DateOptionsView = Backbone.View.extend({
		el: '#date-options',

		template : Handlebars.compile( $( "#date-options-view-tpl" ).html() ),

		events: {
			'click .date-btns button, .dropdown-menu li' : 'updateData'
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

		updateData: function(e){
			var days = $(e.target).attr('value') || $('.dropdown-menu li.selected .text').text().split(' ')[0];
			if(days.toLowerCase() === 'today') {
				app.config.timeline = app.config.today;
			} else {
				app.config.timeline =  moment( app.config.today ).subtract(days, 'days').calendar();
			}
			app.EventBus.trigger('update_data');
		}
	});
});