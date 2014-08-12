adapt-rollay
================

Rollup overlay  

Responds to events:  

	bottomnavigation:open
	bottomnavigation:close

Adapt.bottomnavigation public interface:  

	setCustomView(view) : Sets contents to Backbone.View  
	render() : Renders/rerenders custom Backbone.View  
	forceShow(bool) : Show even when drawer open or back clicked   
	show(duration, callback) : Show with millisecond slide-up animation and callback    
	hide(duration, callback) : Hide with millisecond slide-down animation and callback  
	$el : jQuery element

Adapt.bottomnavigation.model: 

```
	"_rollay": {
	    "_duration": {
	        "show": 100,
	        "hide": 100
	    },
	    "_forceShow" : true //will not close on back nav or drawer open
	}
```

Compatible with [adapt-ratioRestrict](http://github.com/cgkineo/adapt-ratioRestrict):  
	
	Uses $(window).width() to calculate width  

Compatible with [adapt-bottomnavigation](http://github.com/cgkineo/adapt-bottomnavigation):  
	
	Moves up by size of bottomnavigation  