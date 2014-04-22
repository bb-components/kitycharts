var Ruler = kc.Ruler = kity.createClass( 'Ruler', {
    constructor: function ( from, to ) {
        this.ref_grid = [];
        this.map_grid = [];
        this.ref( from, to );
        this.map( from, to );
    },

    ref: function ( from, to ) {
        if ( !arguments.length ) return this._ref;
        this._ref = {
            from: +from,
            to: +to,
            dur: +to - +from
        };
        return this;
    },

    map: function ( from, to ) {
        if ( !arguments.length ) return this._map;
        this._map = {
            from: +from,
            to: +to,
            dur: +to - +from
        };
        return this;
    },

    reverse: function () {
        var ref = this._ref,
            map = this._map;
        return new Ruler( map.from, map.to ).map( ref.from, ref.to );
    },

    measure: function ( value ) {
        // 强烈鄙视 JS 除零不报错，气死劳资了 —— techird
        if ( this._ref.dur === 0 ) return 0;
        var ref = this._ref,
            map = this._map;

        // return map.from + ( value - ref.from ) / ref.dur * map.dur;
        //应该是讲坐标边界的起始点对应

        var ref_grid = this.ref_grid;
        var range = ref_grid[ ref_grid.length-1 ] -  ref_grid[ 0 ];

        // return ( value - ref_grid[0] ) / range * length;
        return map.from + ( value - ref_grid[0] ) / range * map.dur;
    },

    grid: function ( start, step ) {
        var ref = this._ref,
            map = this._map,
            ref_grid = [],
            map_grid = [],
            current;

        for ( current = start; current < ref.to + step; current += step ) {
            ref_grid.push( current );
        }

        this.ref_grid = ref_grid;

        for ( var i = 0; i < ref_grid.length; i++ ) {
            map_grid.push( this.measure( ref_grid[i] ) );
        }
        
        this.map_grid = map_grid;

        return {
            ref: ref_grid,
            map: map_grid
        };
    },

    gridBySize: function ( size ) {
        var ref = this._ref;
        var start = kc.sugar.snap( ref.from, size, 'right' );
        return this.grid( start, size );
    },

    // find a good mod
    fagm: function ( count ) {
        var dur = this._ref.dur,
            sdur = dur / count,
            adjust = 1;

        while(sdur > 100) {
            sdur /= 10;
            adjust *= 10;
        }

        while(sdur < 10) {
            sdur *= 10;
            adjust /= 10;
        }

        return (sdur | 0) * adjust;
    },

    align : function ( value, mod, dir ) {
        var left = value > 0 ?
            value - value % mod :
            value - value % mod - mod,
            right = left + mod;
        return dir == 'left' ? left :
            ( dir == 'right' ? right : (
            value - left < right - value ? left : right ) );
    },

    gridByCount: function ( count, mod, length ) {
        mod = mod || this.fagm( count );
        var ref = this._ref;
        var start = this.align( ref.from, mod, 'left' );
        var size = mod;
        while ( size * count < ref.dur ) size += mod;
        return this.grid( start, size, length );
    },

    gridByCategories : function( count, step ){
        var step = step || 1,
            ref_grid = [],
            map_grid = [],
            i;
        for (i = 0; i < count; i++) {
            ref_grid.push( i*step );
        }

        this.ref_grid = ref_grid;

        for (i = 0; i < ref_grid.length; i++) {
            map_grid.push( this.measure( ref_grid[i] ) );
        }

        this.map_grid = map_grid;

        return {
            ref: ref_grid,
            map: map_grid
        };
    },

    checkOverflow: function ( value ) {
        if ( value < this._ref.from ) {
            return -1;
        }
        if ( value > this._ref.to ) {
            return 1;
        }
        return 0;
    },

    leanTo: function( num, type ){
        var grid = type == 'map'? this.map_grid : this.ref_grid;
        if( !grid || grid.length == 0 ) return null;

        if( grid.length == 1 ){
            return {
                value: grid[ 0 ],
                index: 0
            }
        }

        var first = grid[ 0 ];
        if( num < first ){
            return {
                value: first,
                index: 0
            }
        }

        var last = grid[ grid.length-1 ];
        if( num > last ){
            return {
                value: last,
                index: grid.length-1
            }
        }

        var mod = grid[1] - grid[0];
        var result = this.align( num, mod );
        var index = Math.round( result/mod );

        return {
            value: result,
            index: index
        }
    }
} );

Ruler.from = function ( from ) {
    return {
        to: function ( to ) {
            return new Ruler( from, to );
        }
    };
};