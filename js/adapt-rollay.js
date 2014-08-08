/*
* adapt-rollay
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Oliver Foster <oliver.foster@kineo.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');
	var Backbone = require('backbone');
	
	//PRIVATE VARIABLES
	var visibility = {
		topNavBarHeight: 0,
		hidden: true,
		scrollTop: 0
	};

	var rollay = {
		//PUBLIC VARIABLES
		$el: $('<div>').attr("id","rollay").appendTo( $("body") ),
		model: null,
		view: null,

		//EVENTS
		onResize: function() {
			//capture top nav bar bottom (as changes depending on device) 
			visibility.topNavBarHeight = parseInt( $(".navigation").css("height") );

			if (!visibility.hidden) {

				this.$el.css({
					top: visibility.topNavBarHeight + "px", 

					//set width to window width (to align with restricted aspect ratios)
					width: $(window).width()
				});

				$("body").css({ 
					"height": $(window).height() + "px" 
				});
			}
		},

		initialize: function() {
			this.model = new Backbone.Model( Adapt.course.get("_rollay") );

			if (typeof this.model.get("_duration") == "undefined") this.model.set("_duration", { 
				show:200, 
				hide:200 
			});

			if (typeof this.model.get("_forceShow") == "undefined") this.model.set("_forceShow", false);

			Adapt.trigger("rollay:initialized");
		},

		//DRAWING
		setCustomView: function(view) {

			view.undelegateEvents();

			this.view = view;

			this.$el.html("").append( this.view.$el );

			view.delegateEvents();

			Adapt.trigger("rollay:setCustomView", view);

		},

		render: function() {

			if (typeof this.view.preRender == "function") this.view.preRender();
			if (typeof this.view.render == "function") this.view.render();
			if (typeof this.view.postRender == "function") this.view.postRender();

		},

		//MAIN
		forceShow: function(bool) {
			//do not close on drawer open or back nav
			this.model.set("_forceShow", (bool === true));
		},

		show: function(duration, callback) {

			if (typeof duration == "function") {
				callback = duration;
				duration = undefined;
			}

			if (!visibility.hidden) return;

			Adapt.trigger("popup:opened");

			this.render();

			if (typeof duration == "undefined") duration = this.model.get("_duration").show;

			function start() {
				visibility.hidden = false;

				rollay.$el.css({
					top: $(window).height() + "px", 
					display: "block", 
					width: $(window).width() 
				});

				Adapt.trigger("rollay:opening");
			}

			function complete() {
				visibility.scrollTop = $("body").scrollTop();

				rollay.$el.css({
					top: visibility.topNavBarHeight + "px",
					display: "block" 
				});

				$("body").css({ 
					"height": $(window).height() + "px" 
				});

				$("html").addClass("stop-scroll");

				Adapt.trigger("rollay:opened");

				if (typeof callback == "function") callback();
			}

			if (duration > 0) {
				this.$el.animate({ 
					top: visibility.topNavBarHeight + "px" 
				}, {
					duration:duration, 
					start: start, 
					complete: complete 
				});
			} else {
				start();
				complete();
			}
			
		},

		hide: function(duration, callback) {

			if (typeof duration == "function") {
				callback = duration;
				duration = undefined;
			}

			if (visibility.hidden) return;

			if (typeof duration == "undefined") duration = this.model.get("_duration").hide;

			function start() {
				
				$("body").css({
					"height": "auto"
				});
				
				$("html").removeClass("stop-scroll");
				
				$("body").scrollTop( visibility.scrollTop );
				
				rollay.$el.css({ 
					top: visibility.topNavBarHeight + "px" 
				});

				Adapt.trigger("rollay:closing");

			}

			function complete() {

				visibility.hidden = true;

				Adapt.trigger("popup:closed");

				Adapt.trigger("rollay:closed");

				rollay.$el.css({
					top: $(window).height() + "px",
					display: "none" 
				});

				$("body").css({
					"height": "auto"
				});



				if (typeof callback == "function") callback();
			}

			if (duration > 0) {
				this.$el.animate({ 
					top: $(window).height() + "px" 
				}, {
					duration:duration, 
					start: start, 
					complete: complete
				});
			} else {
				start();
				complete();
			}
		}
	};

	Adapt.on("rollay:open", function(duration, callback) {
		rollay.show(duration, callback);
	});

	Adapt.on("rollay:close", function(duration, callback) {
		rollay.hide(duration, callback);
	});

	Adapt.once("app:dataReady", function() {
		rollay.initialize();
	});

	//drawer is opened
	Adapt.on("drawer:opened", function () { 
		if (rollay.model.get("_forceShow")) return;
		rollay.hide(); 
	});

	//back button clicked
	Adapt.on("navigation:backButton",  function () { 
		if (rollay.model.get("_forceShow")) return;
		rollay.hide(); 
	});

	//device resize and navigation drawn
	Adapt.on("device:resize", function() { 
		rollay.onResize(); 
	});

	Adapt.on("navigationView:postRender", function() { 
		rollay.onResize(); 
	});
	
	Adapt.rollay = rollay;

});