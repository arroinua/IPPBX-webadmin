function MyTour(name, options) {

	if(!name) return console.error('tour name is undefined');

	PbxObject.tours = PbxObject.tours || [];

	var tour = {};
	var defaults = {
		name: "get-started",
        backdrop: true,
        backdropContainer: "#pagecontent",
        storage: false,
        template: ["<div class='popover tour'>",
        			"<div class='arrow'></div>",
        			"<h3 class='popover-title'></h3>",
					"<div class='popover-content'></div>",
					"<div class='popover-navigation'>",
    					"<button class='btn btn-default' data-role='prev'><i class='fa fa-angle-left'></i></button>",
    					"<span data-role='separator'> </span>",
    					"<button class='btn btn-default' data-role='next'><i class='fa fa-angle-right'></i></button>",
    					"<button class='btn btn-link' data-role='end'>", 
    						PbxObject.frases.TOURS.END_TOUR,
    					"</button>",
						// "<button class='btn btn-default' data-role='end'>End tour</button>",
					"</div>",
					"</div>"].join(''),
        steps: []
	};

	if(options) extend(defaults, options);

	tour = new Tour(defaults);
	tour.init();

	PbxObject.tours[name] = tour;

	return tour;
}