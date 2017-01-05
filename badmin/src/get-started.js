function GetStarted(container) {
	var extensions = [],
		trunks = [],
		objects = PbxObject.objects,
		icd = [],
		hunting = [],
		attendant = [],
		welcomeModal = 'welcome-modal',
		wgSteps = [],
		tour = {};

	this.init = function() {

		// Get initial data fot the Widget

		if(typeof objects === 'object') {
			createWidget();
		} else {

			json_rpc_async('getExtensions', null, function(exts) {
			    extensions = exts;
			    console.log('extensions:', extensions);

			    json_rpc_async('getObjects', {kind: 'all'}, function(objs) {
			    	objects = PbxObject.objects = objs;

			    	console.log('objects:', objects);

			    	createWidget();

			    	if(doWelcomeModalNeeded())
			    		loadWelcomeModal();
			    });

			});
		}
		
	};

	function doWelcomeModalNeeded() {
		var noRoutesObjs = filterKinds(objects, 'routes', true);
		return !appStorage.get('welcomed') && !noRoutesObjs.length && !extensions.length
	}

	function loadWelcomeModal() {
	    var modalCont = document.createElement('div');
	    $('body').prepend(modalCont);

	    ReactDOM.render(WelcomeModal({
	        startTour: startTour
	    }), modalCont);

	    $('#welcome-modal').modal();

	    appStorage.set('welcomed', true);
	}

	function startTour() {
	    PbxObject.tours.dashboard.start();
	}

	function createWidget() {

		wgSteps = [
			{
				component: "AddExtensions",
			    name: "addExtensions",
			    icon: "fa fa-users",
			    title: "Add extensions",
			    desc: "Add extensions for company eployees",
			    done: filterKinds(objects, 'users').length > 0 || filterKinds(objects, 'equipment').length > 0
			}, {
				component: "AddCallGroup",
			    name: "addCallGroup",
			    icon: "icon-headset_mic",
			    title: "Create call group",
			    desc: "Call groups defines how incomming calls would be handled and by whom",
			    done: filterKinds(objects, 'icd').length > 0 || filterKinds(objects, 'hunting').length > 0
			}, {
				component: "AddTrunk",
			    name: "addTrunk",
			    icon: "fa fa-cloud",
			    title: "Create trunk",
			    desc: "Connect trunk to make and recieve calls from the outside world",
			    done: filterKinds(objects, 'trunk').length > 0
			}
		];

		ReactDOM.render(GsWidget({
		    steps: wgSteps
		}), document.getElementById('get-started-cont'));
	}

	function filterKinds(array, kind, out) {
		return array.filter(function(item) {
			return out ? item.kind !== kind : item.kind === kind;
		});
	}
		
}