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

	var rollay = new (Backbone.View.extend({

		//DRAWING
		setCustomView: function(view) {

			if (view === rollay.model.get("_customView")) return;

			view.undelegateEvents();

			rollay.model.set("_customView", view);

			if (visibility.hidden) {
				rollay.$el.html("").append( view.$el );
				view.delegateEvents();
				Adapt.trigger("rollay:setCustomView", view);
			} else {
				rollay.$el.children().fadeOut({
					complete: function() {
						view.$el.css("display","none");
						rollay.$el.html("").append( view.$el );
						view.$el.fadeIn();
						view.delegateEvents();
						Adapt.trigger("rollay:setCustomView", view);
					},
					duration: 200
				});
			}

		},

		render: function() {

			if (typeof rollay.model.get("_customView").render == "function") rollay.model.get("_customView").render();

		},

		//MAIN
		forceShow: function(bool) {
			//do not close on drawer open or back nav
			rollay.model.set("_forceShow", (bool === true));
		},

		show: function(duration, callback) {

			if (typeof duration == "function") {
				callback = duration;
				duration = undefined;
			}

			if (!visibility.hidden) return;

			rollay.render();

			if (typeof duration == "undefined") duration = rollay.model.get("_duration").show;

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

				Adapt.trigger("popup:opened");
				Adapt.trigger("rollay:opened");

				if (typeof callback == "function") callback();
			}

			if (duration > 0) {
				start();
				rollay.$el.animate({ 
					top: visibility.topNavBarHeight + "px"
				}, {
					duration:duration, 
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

			if (typeof duration == "undefined") duration = rollay.model.get("_duration").hide;

			function start() {
				Adapt.trigger("popup:closed");
				
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
				rollay.$el.animate({ 
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
	}))();

	rollay.$el = $('<div>').attr("id","rollay").appendTo( $("body") );

	Adapt.on("rollay:open", function(duration, callback) {
		rollay.show(duration, callback);
	});

	Adapt.on("rollay:close", function(duration, callback) {
		rollay.hide(duration, callback);
	});

	Adapt.once("app:dataReady", function() {
		rollay.model = new Backbone.Model( Adapt.course.get("_rollay") );

		if (typeof rollay.model.get("_duration") == "undefined") rollay.model.set("_duration", { 
			show:200, 
			hide:200 
		});

		if (typeof rollay.model.get("_forceShow") == "undefined") rollay.model.set("_forceShow", false);

		Adapt.trigger("rollay:initialized");
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
	Adapt.on("device:resize navigationView:postRender", function() { 
		//capture top nav bar bottom (as changes depending on device) 
		visibility.topNavBarHeight = parseInt( $(".navigation").css("height") );

		if (!visibility.hidden) {

			rollay.$el.css({
				top: visibility.topNavBarHeight + "px", 

				//set width to window width (to align with restricted aspect ratios)
				width: $(window).width()
			});

			$("body").css({ 
				"height": $(window).height() + "px" 
			});
		}
	});

	Adapt.rollay = rollay;

});