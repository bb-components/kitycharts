var LineChartDefaultConfig = kc.LineChartDefaultConfig = {
    color : [
        'rgb(31, 119, 180)',
        'rgb(174, 199, 232)',
        'rgb(255, 127, 14)',
        'rgb(255, 187, 120)'
    ],

    finalColor: 'rgb(255, 187, 120)',

    xAxis : {
        categories : [],

        ticks: {
            enabled : true,
            dash : null,
            value: 0,
            width: 1,
            color: '#808080'
        },

        axis : {
            enabled : true
        },

        label : {
            enabled : true
        },

        padding : {
            left : 0,
            right : 20
        },

        margin : {
            left : 40,
            right : 10
        }
    },

    yAxis : {
        categories : [],

        ticks: {
            enabled : true,
            dash : null,
            value: 0,
            width: 1,
            color: '#808080'
        },

        axis : {
            enabled : true
        },

        label : {
            enabled : true
        },

        padding : {
            top: 20,
            bottom : 0
        },

        margin : {
            top : 20,
            bottom : 40
        }

    },

    plotOptions : {

        line : {
            width : 2,
            dash : [ 2 ],

	        dot : {
	        	enabled : true,
	            radius : 3
	        }

        },

        label : {
        	enabled : false,
            text : {
                color : '#333',
                margin : -15
            }
        }

    },

    interaction : {

        indicatrix : {
            color : '#BBB',
            width : 1,
            dash : [ 4, 2 ],
        },

        circle : {
            radius : 4,
            stroke : {
                width : 2,
                color : '#FFF'
            }
        }
    },

    enableAnimation : true
};