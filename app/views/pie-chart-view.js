var app = app || {};

$(function(){
	app.PieChartView = Backbone.View.extend({
		el: '#pie-chart',

		initialize: function() {
			var me = this;

			// Colors to represent each device
			me.$colors = {
				'Mobile': '#7B9AEC',
				'Tablet': '#D5A56D',
				'Desktop': '#EC9898'
			}

			me.listenTo(app.dataCollection, "change", me.render );
			me.listenTo(app.EventBus, "update_data", me.render );
			me.listenTo(app.EventBus, "window_resize", me.resizeChart );
		},

		resizeChart: function(){
			var me = this;
			if(me.$chart) {
			    me.$chart.setSize( $('.device-chart').width(), $('.device-chart').height() );
			}
		},

		render: function() {
			var me = this,
				data = app.dataCollection.models,
				len = data.length,
				results = [],
				devices = {},
				total_devices = 0;

			// Calculate total for each device and the overall total
			var calculateDevices = function(device){
				if( ! devices[ device ] ) {
					devices[ device ] = 1;
				} else {
					devices[ device ]++;
				}

				total_devices++;
			};

			// Filter data based on day(s) and segment
			for(var i = 0 ; i < len ; i++) {
				if( moment(data[i].Date) <= moment(app.config.timeline) ) {
					if( app.config.segment === 'All' ) {
						calculateDevices( data[i].Device );
					} else if( app.config.segment.toLowerCase() === data[i].Gender.toLowerCase() ) {
						calculateDevices( data[i].Device );
					}
				}
			}

			// Set percentage data and color for each device
			for(var d in devices) {
				if(devices.hasOwnProperty(d)) {
					var name = app.util.capitalize(d);
					results.push({
						name: name,
						y: (devices[d]/total_devices) * 100,
						color: me.$colors[name]
					});
				}
			}

			// Initialize pie chart and set data
			if( me.$chart ) {
				me.$chart.series[0].remove();
				me.$chart.addSeries({
					type:'pie',
					data: results
				});
			} else {
				me.$chart = new Highcharts.Chart({
			        chart: {
			        	renderTo: me.el.id,
			            plotBackgroundColor: null,
			            plotShadow: false,
			            margin: 0
			        },
			        credits:{
			        	enabled: false
			        },
			        title: {
			            text: 'Devices'
			        },
			        tooltip: {
			            pointFormat: '<b>{point.percentage:.1f}%</b>'
			        },
			        plotOptions: {
			            pie: {
			            	size:'50%',
			                allowPointSelect: true,
			                cursor: 'pointer',
			                dataLabels: {
			                    enabled: true,
			                    useHTML: true,
			                    formatter: function(){
			                    	return '<div class="pie-label" style="background-color:'+ this.point.color +'"><b>'+ this.point.name +'</b></div>'
			                    },
			                    style: {
			                        color: 'black'
			                    }
			                }
			            }
			        },
			        series: [{
			            type: 'pie',
			            data: results
			        }]
			    });
				me.$chart.setSize( $('.device-chart').width(), $('.device-chart').height() );
			}

			return me;
		}
	});
});