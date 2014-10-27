var app = app || {};

$(function(){
	app.LineChartView = Backbone.View.extend({
		el: '#line-chart',

		initialize: function() {
			var me = this;

			me.listenToOnce(app.dataCollection, "change", function(){
				me.render();
				app.dateOptionsView = new app.DateOptionsView();
				app.statsButtonsView = new app.StatsButtonsView();

				// me.$percentageOfActivityRecorded = (app.config.totalActivityRecorded / app.dataCollection.models.length ) * 100;
			});
			me.listenTo(app.EventBus, "update_data", me.render );
			me.listenTo(app.EventBus, "onMeanButtonClick", me.drawMeanLine );
			me.listenTo(app.EventBus, "onTrendButtonClick", me.drawTrendLine );
			me.listenTo(app.EventBus, "window_resize", me.resizeChart );
		},

		resizeChart: function(){
			var me = this;
			if(me.$chart) {
			    me.$chart.setSize( $('.activity-chart').width(), $('.activity-chart').height());
			}
		},

		drawMeanLine: function(){
			var me = this;
			me.$chart.series[2].setVisible( ! me.$chart.series[2].visible );

			return me;
		},

		drawTrendLine: function(){
			var me = this;
			me.$chart.series[1].setVisible( ! me.$chart.series[1].visible );

			return me;
		},

		render: function() {
			var me = this,
				data = app.dataCollection.models,
				len = data.length,
				total_activity = 0,
				categories = [],
				date_activity_data = {},
				reg_y = [], //linear regression y values
				reg_x = [], //linear regression x values
				results = [],
				lr; // linear regression

			var calculateDateActivity = function(data) {
				var activity_value = parseInt( _.last(_.values(data)) ),
					month = moment(data.Date).format('MMMM D') ;

				if( ! date_activity_data[ month ] ) {
					date_activity_data[month ] = activity_value;
				} else {
					date_activity_data[ month ] += activity_value;
				}

				results.push({
					x: moment( data.Date +' '+ data.Time ).toDate(),
					y: ''
				});

				if ( activity_value === 1 ) total_activity++;
			};

			for(var i = 0 ; i < len ; i++) {
				if( moment(data[i].Date) >= moment(app.config.timeline) ) {
					if( app.config.segment === 'All' ) {
						calculateDateActivity( data[i] );
					} else if( app.config.segment.toLowerCase() === data[i].Gender.toLowerCase() ) {
						calculateDateActivity( data[i]);
					}
				}
			}


			// Set percentage data for each date
			// date_activity_data_.map( date_activity_data, function(value, key){
			// 	return (  value / app.config.totalActivityRecorded) * 100;
			// });

			for(var d in date_activity_data) {
				if(date_activity_data.hasOwnProperty(d)) {
					date_activity_data[d] = (date_activity_data[d] / app.config.totalActivityRecorded) * 100;
					// results.push({
					// 	name: d,
					// 	y: percentage
					// });
				}
			}

			results.sort(function(a, b){
				 return ( moment(a.x) > moment(b.x) ) ? 1 :  ( moment(a.x) < moment(b.x) )? -1 : 0;
			});

			for( var r = 0 ; r < results.length ; r++) {
				results[r].y = date_activity_data[ moment( results[r].x ).format('MMMM D') ];
				reg_y.push( results[r].y );
			}

			// for(var i = 0 ; i < results.length ; i++) {
			// 	categories.push( moment( results[i].name ).format('MMMM D') );
			// 	reg_y.push( results[i].y );
			// }

			// Calculate trend
			reg_x = _.range( results.length );
			lr = app.util.linearRegression(reg_y, reg_x);

			var regression_data = [
				[ reg_x[0], lr.slope * reg_x[0] + lr.intercept ],
			    [ reg_x[reg_x.length-1], lr.slope * reg_x[reg_x.length-1] + lr.intercept ]
			];

			// Calculate mean
			var mean = _.reduce( reg_y, function(m, n){return m + n}, 0 ) / reg_y.length;
				
			var mean_data =  [
				[ 0, mean ],
				[ _.last(reg_x), mean ]
			];

			// Initialize line chart and set data
			if( me.$chart ) {
				me.$chart.series[0].setData(results, false);
				me.$chart.redraw();
				me.$chart.series[1].setData( regression_data ); 
				me.$chart.series[2].setData( mean_data );
			} else {
				me.$chart = new Highcharts.Chart({
			        chart: {
			        	renderTo: me.el.id,
			        	type: 'line',
			        	zoomType: 'x'
			        },
			        credits:{
			        	enabled: false
			        },
			        title: {
			        	text: 'Activity',
			            align: 'left',
			            margin: 20
			        },
			         subtitle: {
			            text: document.ontouchstart === undefined ?
			                    'Click and drag in the plot area to zoom in' :
			                    'Pinch the chart to zoom in'
			        },
			        legend: {
			        	enabled: false
			        },
			        yAxis: {
 			        	title: {
			        		text: ''
			        	},
			        	labels: {
			                format: '{value:.1f}%'
			            }
			        },
			        xAxis: {
			        	// categories: categories
			        	labels: {
			        		formatter: function(){
				        		return moment(this.value).format('hh:mm a');
				        	}
			        	}
			        },
			        tooltip: {
			        	formatter: function() {
			                return '<b>'+ moment( this.x ).format('MMMM D YYYY - hh:mm a') +'</b><br/>'+ parseFloat(this.y).toFixed(1) + '%';
			            },
			            crosshairs:[true]
			        },
			        series: [
				        {
				        	name: 'dates-data',
				            data: results,
				            color: '#3447CD',
				            turboThreshold:0
				        },
				        {
				        	name: 'trend',
				        	data: regression_data,
				        	visible: false,
				        	color: 'red'
				        },
				        {
				        	name: 'Mean',
				        	visible: false,
				        	color: 'green',
				        	data: mean_data
				        }
			        ]
			    });
				me.$chart.setSize( $('.activity-chart').width(), $('.activity-chart').height() );
			}

			return me;
		},

		updateData: function(e){
			var days = $(e.target).attr('value');
			if(days.toLowerCase() === 'today') {
				app.config.timeline = app.config.today;
			} else {
				app.config.timeline =  moment( app.config.today ).subtract(days, 'days').calendar();
			}
			app.EventBus.trigger('update_data');
		}
	});
});