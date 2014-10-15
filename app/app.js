var app = app || {};

$(function() {
	app.config = {
		today: '7/31/2014',

		//days
		timeline: '7/31/2014',  // default - today

		//gender
		segment: 'All', // default
	
		totalActivityRecorded: 0
	};

	// Global events
	app.EventBus = _({}).extend(Backbone.Events);

	$(window).resize(function() {
		app.EventBus.trigger('window_resize');
	});

	app.dataCollection = new app.DataCollection();
	app.lineChartView = new app.LineChartView();
	app.segmentView = new app.SegmentView(); 
	app.pieChartView = new app.PieChartView();
});