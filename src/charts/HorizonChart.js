 var HorizonData = kc.HorizonData = kity.createClass( 'HorizonData', {
     base: kc.Data,
     format: function ( format ) {
         var origin = this.origin;
         if ( format === undefined ) {
             return origin;
         } else if ( format === 'col' ) {
             //返回每项属性的最大和最小值
             var series = origin.series;
             var result = {};
             var dividecount = 0;
             var ranges = [];
             var labels = [];
             for ( var i = 0; i < origin.categories.length; i++ ) {
                 ranges.push( {
                     max: 0,
                     min: 0
                 } );
             }
             for ( var key in series ) {
                 labels.push( key );
                 dividecount++;
                 var s = series[ key ];
                 for ( var j = 0; j < s.length; j++ ) {
                     var sa = s[ j ].args;
                     for ( var k = 0; k < origin.categories.length; k++ ) {
                         if ( parseFloat( sa[ k ] ) > ranges[ k ].max ) {
                             ranges[ k ].max = sa[ k ];
                         } else if ( parseFloat( sa[ k ] ) < ranges[ k ].min ) {
                             ranges[ k ].min = sa[ k ];
                         }
                     }
                 }
             }
             result.dividecount = dividecount;
             result.ranges = ranges;
             result.labels = labels;
             return result;
         }
     }
 } );
 var HorizonChart = kc.HorizonChart = kity.createClass( 'HorizonChart', {
     base: kc.Chart,
     constructor: function ( target, param ) {
         this.callBase( target, param );
         this.setData( new kc.HorizonData() );
         this.addElement( "Lines", new kc.ElementList() );
         this.addElement( "Axis", new kc.ElementList() );
         this.addElement( "Cate", new kc.ElementList() );
         var tooltips = this.addElement( "Tooltips", new kc.ElementList() );
         var me = this;
         tooltips.on( "listupdatefinish", function ( e ) {
             var foo = me.toolTipUpdated;
             foo( e );
         } );
     },
     toolTipUpdated: function ( e ) {

     },
     highlightLines: function ( args ) {
         var data = this.getData().format();
         var key, val;
         for ( var k in args ) {
             key = k;
             val = args[ key ];
             break;
         }
         var lines = this.getElement( 'Lines' ).elementList;
         var tooltip = [];
         var tooltips = this.getElement( 'Tooltips' );
         tooltips.except = []; //无需进行亮度处理的部分
         for ( var i = 0; i < lines.length; i++ ) {
             var param = lines[ i ].param;
             var args = param.args;
             if ( param[ key ] === val ) {
                 lines[ i ].update( {
                     width: 3,
                     opacity: 1
                 } );
                 //更新tooltip
                 var points = param.points;
                 for ( var j = 1; j < points.length; j++ ) {
                     tooltip.push( {
                         x: points[ j ][ 0 ],
                         y: points[ j ][ 1 ] - 15,
                         content: {
                             color: 'white',
                             text: ( args[ j - 1 ] || 0 )
                         }
                     } );
                 }
             } else {
                 lines[ i ].update( {
                     width: 0,
                     opacity: 0
                 } );
             }
         }
         tooltips.update( {
             elementClass: kc.Tooltip,
             list: tooltip
         } );
     },
     showLines: function ( args ) {
         var lines = this.getElement( 'Lines' ).elementList;
         for ( var i = 0; i < lines.length; i++ ) {
             var param = lines[ i ].param;
             var highlight = true;
             for ( var key in args ) {
                 if ( args[ key ] && ( param[ key ] !== args[ key ] ) ) {
                     highlight = false;
                     break;
                 }
             }
             if ( !highlight ) {
                 lines[ i ].update( {
                     width: 0,
                     opacity: 0
                 } );
             } else if ( param.width < 3 ) {
                 lines[ i ].update( {
                     width: 1,
                     opacity: 0.2
                 } );
             }
         }
     },
     unhighlightAll: function () {
         var tooltips = this.getElement( 'Tooltips' );
         tooltips.update( {
             elementClass: kc.Tooltip,
             list: []
         } );
         var lines = this.getElement( 'Lines' ).elementList;
         for ( var i = 0; i < lines.length; i++ ) {
             var param = lines[ i ].param;
             if ( param.width === 3 ) {
                 lines[ i ].update( {
                     width: 1,
                     opacity: 0.2
                 } );
             }
         }
     },
     renderChart: function () {
         var colors = this.param.colors;
         var data = this.getData().format();
         var datacol = this.getData().format( 'col' );
         var labels = datacol.labels;
         var categories = data.categories;
         var lLength = labels.length - 1;
         var container = this.getPaper().container;
         var _width = container.offsetWidth;
         var _height = container.offsetHeight;
         var padding = this.param.padding;
         var _space = ( _width - padding[ 1 ] - padding[ 3 ] ) / categories.length;
         var _AxisHeight = _height - padding[ 0 ] - padding[ 2 ]; //y坐标轴的高度
         var axis = this.getElement( 'Axis' );
         var lines = this.getElement( 'Lines' );
         var Cate = this.getElement( 'Cate' );
         var AxisLines = [];
         var Polylines = [];
         var Cates = [];
         //生成连线和Categories数据
         var series = data.series;
         for ( var key in series ) {
             var s = series[ key ];
             Cates.push( {
                 text: key,
                 at: 'left',
                 x: padding[ 3 ] - 20,
                 y: padding[ 0 ] + labels.indexOf( key ) * _AxisHeight / lLength
             } );
             for ( var j = 0; j < s.length; j++ ) {
                 var item = {
                     points: [
                         [ padding[ 3 ], padding[ 0 ] + labels.indexOf( key ) * _AxisHeight / lLength ]
                     ],
                     color: colors[ parseInt( labels.indexOf( key ) / 4 ) ],
                     width: 1,
                     opacity: 0.1,
                     contry: key,
                     position: s[ j ].position,
                     name: s[ j ].name,
                     elglishname: s[ j ].elglishname,
                     args: s[ j ].args
                 };
                 Polylines.push( item );
                 var args = s[ j ].args;
                 for ( var k = 0; k < args.length; k++ ) {
                     item.points.push(
                         [ padding[ 3 ] + _space * ( k + 1 ), padding[ 0 ] + ( 1 - ( args[ k ] || 0 ) / datacol.ranges[ k ].max ) * _AxisHeight ]
                     );
                 }
             }
         };
         for ( var x = 0; x < categories.length; x++ ) {
             Cates.push( {
                 text: categories[ x ],
                 x: padding[ 3 ] + _space * ( x + 1 ),
                 y: padding[ 0 ] - 20
             } );
         }
         for ( var i = 0; i <= data.categories.length; i++ ) {
             var item = {
                 x1: padding[ 3 ] + _space * i,
                 y1: padding[ 0 ],
                 x2: padding[ 3 ] + _space * i,
                 y2: _height - padding[ 2 ]
             };
             if ( i !== 0 ) {
                 item.max = datacol.ranges[ i - 1 ].max;
             } else {
                 item.divide = datacol.dividecount;
             }
             AxisLines.push( item );
         }
         //绘制线
         axis.update( {
             elementClass: kc.AxisLine,
             list: AxisLines,
             fx: false
         } );
         lines.update( {
             elementClass: kc.Polyline,
             list: Polylines,
             fx: false
         } );
         Cate.update( {
             elementClass: kc.Label,
             list: Cates,
             fx: false
         } );
     },
     update: function () {
         this.renderChart();
     }
 } );