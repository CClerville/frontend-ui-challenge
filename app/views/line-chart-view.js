var app = app || {};

$(function(){
	app.LineChartView = Backbone.View.extend({
		el: '#line-chart',

		initialize: function() {
			var me = this;

			me.listenTo(app.dataCollection, "change", function(){
				me.render();
				$('.selectpicker').selectpicker();
			});
			me.listenTo(app.EventBus, "update_data", me.render );
			me.listenTo(app.EventBus, "window_resize", function(){
				if(me.$chart) {
				    me.$chart.setSize( $('.activity-chart').width(), $('.activity-chart').height());
				}
			});
		},

		render: function() {
			var me = this,
				data = app.dataCollection.models,
				len = data.length,
				total_activity = 0,
				categories = [],
				date_total_activity = {},
				results = [];

			var calculateDateActivity = function(data) {
				var activity_value = parseInt( _.last(_.values(data)) );

				if( ! date_total_activity[ data.Date ] ) {
					date_total_activity[ data.Date ] = activity_value;
				} else {
					date_total_activity[ data.Date ] += activity_value;
				}

				if ( activity_value === 1 ) total_activity++;
			};

			for(var i = 0 ; i < len ; i++) {
				if( moment(data[i].Date) <= moment(app.config.timeline) ) {
					if( app.config.segment === 'All' ) {
						calculateDateActivity( data[i] );
					} else if( app.config.segment.toLowerCase() === data[i].Gender.toLowerCase() ) {
						calculateDateActivity( data[i]);
					}
				}
			}

			// Set percentage data for each date
			for(var d in date_total_activity) {
				if(date_total_activity.hasOwnProperty(d)) {
					results.push({
						name: d,
						y: (date_total_activity[d]/total_activity) * 100
					});
				}
			}

			results.sort(function(a, b){
				return ( moment(a.name) > moment(b.name) ) ? 1 :  ( moment(a.name) < moment(b.name) )? -1 : 0;
			});

			for(var i = 0 ; i < results.length ; i++) {
				categories.push( moment( results[i].name ).format('MMMM D') );
			}


			// Initialize line chart and set data
			if( me.$chart ) {
				me.$chart.series[0].remove();
				me.$chart.addSeries({
					data: results,
					color: 'blue'
				});
			} else {
				me.$chart = new Highcharts.Chart({
			        chart: {
			        	renderTo: me.el.id,
			        	type: 'line'
			        },
			        credits:{
			        	enabled: false
			        },
			        title: {
			        	text: 'Activity',
			            align: 'left',
			            margin: 20
			        },
			        legend: {
			        	enabled: false
			        },
			        yAxis: {
			        	title: {
			        		text: ''
			        	},
			        	labels: {
			                formatter: function () {
			                    return this.value + '%';
			                }
			            }
			        },
			        xAxis: {
			        	categories: categories
			        },
			        tooltip: {
			        	formatter: function() {
			                return '<b>'+ this.x +'</b><br/>'+ parseFloat(this.y).toFixed(1) + '%';
			            }
			        },
			        plotOptions: {
			           
			        },
			        series: [{
			        	name: 'dates-data',
			            data: results,
			            color: 'blue'
			        }]
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