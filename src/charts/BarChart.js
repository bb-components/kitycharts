(function(){

var BarChart = kc.BarChart = kity.createClass( 'BarChart', {
    base: kc.ChartFrame,

    constructor: function ( target, param ) {
        this.config = kc.BarColumnChartDefaultConfig;
        this.callBase( target, param );

        this.setData( new kc.BarData() );
        this.addElement( 'bars', new kc.ElementList() );
        // this.bindAction();
    },

    update: function () {

        this.callBase();
        var data = this.currentData;
        this.isBar = data.chart.type == 'bar';

        var coordParam = {}, config = this.config;
        if(this.isBar){
            var p  = coordParam.padding = kity.Utils.copy( this.coordinate.param.padding );
            p.bottom = config.xAxis.padding.left;
        }
        
        this.coordinate.update( coordParam );

        this.formattedData = this.drawBars( this.param, data, this.coordinate );
    },

    bindAction : function(){
        var self = this;
        this.currentIndex = 0;

        this.paper.on( 'mousemove', function (ev) {
            var oxy = self.coordinate;
            if(!oxy) return;

            var param = oxy.param,
                data = self.formattedData;
            var oev = ev.originEvent;
            var x = oev.offsetX;
            var y = oev.offsetY;
            var i, l = self.circleArr.length;
            
            var reuslt = oxy.xRuler.leanTo( x - oxy.param.x, 'map' );

            var maxLength = 0;
            var lenArr = [], tmpL;
            for (i = 0; i < data.series.length; i++) {
                tmpL = data.series[i].positions.length;
                if( tmpL > maxLength ){
                    maxLength = tmpL;
                }
            }

            if( !reuslt || reuslt.index > maxLength ) return;

            var pX = reuslt.value + oxy.param.x;

            var pY = 0;
            var index = reuslt.index, tmpPos;

            for (i = 0; i < self.circleArr.length; i++) {
                tmpPos = data.series[i].positions[index];
                if(tmpPos){
                    pY = tmpPos[1];
                    self.circleArr[i].setCenter(pX, pY);
                }else{
                    self.circleArr[i].setCenter(-100, -100);
                }

            }

            self.updateIndicatrix(pX, oxy.param.height + oxy.param.y);

            self.currentIndex = index;

            if( self.param.onCircleHover){
                var info = {
                    posX : pX,
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.x,
                    marginTop : oxy.param.y,
                    data : data
                };
                self.param.onCircleHover( info );
            }
        } );

        this.paper.on('click', function(ev){
            var oxy = self.coordinate;
            if(!oxy) return;

            if( self.param.onCircleClick && (ev.targetShape.lineData || Math.abs(self.indicatrix.param.x1 - ev.originEvent.offsetX) < 10) ){
                var target = ev.targetShape,
                    index = self.currentIndex,
                    indicatrixParam = self.indicatrix.param;

                var info = {
                    circle : target,
                    lineData : target.lineData,
                    position : target.getCenter ? target.getCenter() : { x: indicatrixParam.x1, y: oxy.param.height/2 },
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.x,
                    marginTop : oxy.param.y,
                    data : self.formattedData
                };

                if( target.lineData ){
                    info.value = target.lineData.values[ index ];
                }

                self.param.onCircleClick( info );
            }
        });
    },

    drawBars: function ( param, data, oxy ) {
        var config = this.config,
            opt = config.plotOptions;
        var rotateAngle,
            measureCategoryMethod,
            measureValueMethod;

        if( this.isBar ){
            config.yAxis.padding.bottom = config.xAxis.padding.left;
            rotateAngle = 90;
            measureCategoryMethod = 'measurePointY';
            measureValueMethod    = 'measurePointX';
        }else{
            rotateAngle = 0;
            measureCategoryMethod = 'measurePointX';
            measureValueMethod    = 'measurePointY';
        }


        var xRuler = oxy.xRuler,
            yRuler = oxy.yRuler;

        var series = data.series,
            i, j, k, m, yPos, point, pointsArr = [], linesArr = [],
            barData,
            bar;

        var tmp, valArr, posArr, barList = [], posY, barParam,
            width = opt.bar.width, offset = 0,
            distance = data.chart.mirror? 0 : width + opt.bar.margin
            ;

        for (i = 0; i < series.length; i++) {

            bar = series[ i ];
            bar.values = [];
            bar.positions = [];

            barData = series[i].data;

            for (j = 0; j < barData.length; j++) {

                tmp = barData[ j ];
                if( !kity.Utils.isArray( barData[ j ] ) ){
                    tmp = [ barData[ j ] ];
                }

                valArr = [];
                posArr = [];
                posY = oxy[ measureCategoryMethod ]( j );
                offset = (series.length - 1)*distance/2;

                for (k = 0; k < tmp.length; k++) {
                    valArr[ k ] = sum( tmp.slice(0, k+1) );

                    posArr[ k ] = oxy.measureValueRange( valArr[ k ], this.isBar? 'x' : 'y' );

                    barParam = {
                        // dir: -1,
                        // offset: 0,
                        color: config.color[i][k],
                        width: width,
                        height: posArr[ k ] * (this.isBar ? 1 : -1),
                        rotate: rotateAngle
                    };

                    if( this.isBar ){
                        barParam.x = oxy[ measureValueMethod ]( 0 );
                        barParam.y = posY - offset + distance*i ;
                    }else{
                        barParam.x = posY - offset + distance*i ;
                        barParam.y = oxy[ measureValueMethod ]( 0 );
                    }

                    barList.unshift(barParam);

                }

                bar.values.push( valArr );
                bar.positions.push( {
                        x : posArr,
                        y : posY
                    } );

            }
            
        }

        function sum(arr){
            var sum = 0;
            for(var i = 0; i < arr.length; i++){
                sum += arr[i];
            }
            return sum;
        }

        var bars = this.getElement( 'bars');
        bars.update({
            elementClass: kc.Bar,
            list: barList,
            fx: this.config.enableAnimation
        });

        return data;
    }

} );


})();