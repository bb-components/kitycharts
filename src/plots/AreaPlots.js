(function(){

var AreaPlots = kc.AreaPlots = kity.createClass( 'AreaPlots', {

    base: kc.LinearPlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
    },

    plotsAttrsInit : function(){
        this.chartType = 'area';
    },

    getLineWidth : function(){
        return this.config.plotOptions.area.stroke.width;
    },

    areas : [],

    renderByData : function( line ){
        var offset = line.offsetX || 0;
        var pointsArr, topPart, bottomPart;
        if( this.config.yAxis.stacked ){

            var p = this.config.yAxis.percentage;
            var offsetType = p ? 'percentageOffset' : 'offset';
            var allOffsetType = p ? 'allPercentageOffset' : 'allOffset';

            topPart = this.array2points( line[ offsetType ], offset );
            bottomPart = this.array2points( kity.Utils.copy( line[ allOffsetType ][ line.indexInGroup + 1 ] ), offset ).reverse();

            // pointsArr = arr1.concat( arr2 );

        }else{

            pointsArr = this.array2points( line.data, offset );
            var areaPointArr = kity.Utils.copy( pointsArr );
            var oxy = this.coordinate;
            var x0 = oxy.measurePointX( 0 ),
                y0 = oxy.measurePointY( oxy.yRuler._ref.from );

            var topPart = pointsArr.slice(0),
                bottomPart = [];

            var i = pointsArr.length;
            while( i-- > 0 ){
                bottomPart.push( [ pointsArr[ i ][ 0 ], y0 ] );
            }

        }

        var area = this.drawPolygon( topPart, bottomPart, line );
        this.areas.push( area );
    },

    drawPolygon : function ( topPart, bottomPart, entry ){
        var pointsArr = topPart.concat(bottomPart);
        var area = new kity.Polygon(pointsArr),
            paper = this.container.paper,
            color = this.getEntryColor( entry ),
            fill, opacity;

        var self = this;
        if( kity.Utils.isNumber( opacity = this.config.plotOptions.area.fill.opacity ) ){
            fill = new kity.Color( color ).set( 'a', opacity );
        }else{
            fill = new kity.LinearGradientBrush().pipe( function() {
                var gradient = entry.gradient || self.config.plotOptions.area.fill.gradient;
                var g;
                for( var i = 0; i < gradient.length; i++ ){
                    g = gradient[i];
                    this.addStop( g.pos, g.color||color, gradient[i].opacity );
                }
                this.setStartPosition(0, 0);
                this.setEndPosition(0, 1);
                paper.addResource( this );
            })
        }

        area.fill( fill );

        this.canvas.addShape(area);
        area.bringRear();
        return area;

    }

} );


})();