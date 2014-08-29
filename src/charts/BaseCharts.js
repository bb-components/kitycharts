(function(){

var BaseChart = kc.BaseChart = kity.createClass( 'BaseChart', {

    mixins : [ kc.ConfigHandler ],

    base: kc.Chart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.config = this.param;

        this.callMixin();

        this.bindAction();
        this.initTooltip();

    },

    _setConfig : function( param, formatter ){

        var config = kity.Utils.deepExtend( this.config, param ),
            base = kc.ChartsConfig.init( this.chartType || '' ),
            data, coordConf;

        this.config = kity.Utils.deepExtend( base, config ),
        this.setData( new formatter( this.config ) );

        data = this.data.format();
        this.config = kity.Utils.deepExtend( this.config, data );

    },

    update : function( param ){
        var DataFormatter = arguments[ 1 ] || kc.ChartData;
        this._setConfig( param, DataFormatter );
        
        coordConf = this.coordinate.setCoordinateConf( this.config );
        this.coordinate.update( coordConf );
        this.getPlots().update( this.coordinate, this.config );

        this.getOption('legend.enabled') && this.addLegend();
    },

    getPlots : function(){
        return this.plots;
    },

    setPlots : function( plots ){
        this.plots = plots;
    },

    getXOffset : function(){
        var oxy = this.coordinate,
            ox = oxy.param.padding.left + oxy.param.margin.left;
        return ox;
    },

    isOutOfXRange : function( x ){
        var ox = this.getXOffset( x ),
            oxy = this.coordinate;
        return x - ox < oxy.param.padding.left || x - ox + oxy.param.padding.left > oxy.xRuler.map_grid[ oxy.xRuler.map_grid.length-1 ];
    },

    getChartElementByShape : function( shape ){
        return shape.container.host;
    },

    getXInfoByPosX : function( x ){
        var ox = this.getXOffset(), oxy = this.coordinate;

        if( oxy.xRuler.map_grid.length == 0 ){
            return {
                index : 0,
                posX : 0
            };      
        }

        var result = oxy.xRuler.leanTo( x - ox , 'map' );
        result.value += oxy.param.padding.left;

        return {
            index : result.index,
            posX : result.value
        };
    },

    bindAction : function(){
        var self = this;
        this.currentIndex = -1;

        this.paper.on( 'mousemove', function( ev ) {
            self.onmousemove && self.onmousemove( ev );
        } );

        this.paper.on('click', function(ev){
            var oxy = self.coordinate;
            if(!oxy) return;

            self.onclick && self.onclick( ev );

        });
    },

    getEntryColor : function( entry ){
         return entry.color || this.config.color[ entry.index ] || this.config.finalColor;
    },

    initTooltip : function(){
        var container = $(this.container);
        if( !~(['absolute', 'relative']).indexOf( container.css('position') ) ){
            container.css('position', 'relative');
        }

        this.setTooltipContainer();

    },

    setTooltipContainer : function( dom ){
        if( dom ){
            this.tooltip = $( dom ).css({
                position : 'absolute',
                left : '-3000px',
            });
        }else{//默认
            this.tooltip = $('<div></div>').appendTo( this.container ).css({
                position : 'absolute',
                // border : '#888 1px solid',
                boxShadow : '0px 1px 5px rgba(0,0,0,0.3)',
                borderRadius : '4px',
                backgroundColor : '#FFF',
                color : '#888',
                padding : '6px 10px',
                left : '-1000px',
                marginLeft : '10px',
                fontSize : '10px',
                lineHeight : '16px'
            });
        }
    },

    updateTooltip : function( text, x, y ){
        this.tooltip.html( text );
        var tw = this.tooltip[0].clientWidth;
        if( x + tw > $( this.container ).width() ){
            x -= tw + 15;
        }

        this.tooltip.clearQueue().animate({
            left : x,
            top : y
        }, 100);

    },

    getTooltip : function(){
        return this.tooltip;
    },

    addLegend : function(){
        var series = this.config.series || [],
            i, j, entry, label, color, tmp, dataEntry;

        this.legend && this.legend.remove();
        this.legend = $('<div class="kitycharts-legend"></div>').css({
            position : 'absolute',
            bottom : '5px',
            right : '30px',
            height : '26px',
            lineHeight : '26px'
        }).appendTo( this.container );

        var labelArr = [], colorArr = [];
        for ( i = 0; i < series.length; i++ ) {
            
            entry = series[ i ];
            
            if( this.config.legend.level == 'data' ){
                for (var i = 0; i < entry.data.length; i++) {
                    dataEntry = entry.data[ i ];
                    labelArr.push( dataEntry.name );
                    colorArr.push( this.getEntryColor( dataEntry ) );
                }
            }else{
                label = entry.name;
                color = this.getEntryColor( entry );

                labelArr.push(label);
                colorArr.push(color);
            }

        }

        var self = this;

        labelArr.forEach(function(label, i){
           tmp = $('<div></div>').css({
                marginRight : '20px',
                display : 'inline-block'
            }).appendTo( self.legend );

            $('<div class="kitycharts-legend-color"></div>').css({
                width : '12px',
                height : '12px',
                backgroundColor : colorArr[i],
                display : 'inline-block',
                marginRight : '5px',
                position: 'relative',
                top: '1px'
            }).appendTo( tmp );

            $('<div class="kitycharts-legend-label">' + label + '</div>').css({
                fontSize : '12px',
                display : 'inline-block'
            }).appendTo( tmp );
        });

    }

} );


})();