function GetStarted(container) {
	var extensions = [],
		trunks = [],
		objects = PbxObject.objects,
		icd = [],
		hunting = [],
		attendant = [],
		welcomeModal = 'welcome-modal',
		wgSteps = [],
		dashTour = {};

	this.init = function() {

		// createTour();

		// Get initial data for the Widget
		if(typeof objects === 'object') {
			createWidget();
		} else {

			json_rpc_async('getExtensions', null, function(exts) {
			    extensions = exts;
			    console.log('extensions:', extensions);

			    getObjects(null, function(objs) {
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
	        startTour: startTour,
	        frases: PbxObject.frases
	    }), modalCont);

	    $('#welcome-modal').modal();

	    appStorage.set('welcomed', true);
	}

	function startTour() {
	    dashTour.start();
	}

	function createWidget() {

		var allDone = true;

		wgSteps = [
			{
				component: "AddExtensions",
			    name: "addExtensions",
			    icon: "fa fa-users",
			    title: PbxObject.frases.GET_STARTED.STEPS.A.TITLE,
			    desc: PbxObject.frases.GET_STARTED.STEPS.A.BODY,
			    done: filterKinds(objects, 'users').length > 0 || filterKinds(objects, 'equipment').length > 0
			}, {
				component: "AddCallGroup",
			    name: "addCallGroup",
			    icon: "icon-headset_mic",
			    title: PbxObject.frases.GET_STARTED.STEPS.B.TITLE,
			    desc: PbxObject.frases.GET_STARTED.STEPS.B.BODY,
			    done: filterKinds(objects, 'icd').length > 0 || filterKinds(objects, 'hunting').length > 0
			}, {
				// component: "AddTrunk",
			    name: "addAttendant",
			    icon: "icon-room_service",
			    title: PbxObject.frases.GET_STARTED.STEPS.C.TITLE,
			    desc: PbxObject.frases.GET_STARTED.STEPS.C.BODY,
			    done: filterKinds(objects, 'attendant').length > 0,
			    onClick: function() {
			    	window.location.hash = '#attendant/attendant';
			    }
			}, {
				// component: "AddTrunk",
			    name: "addTrunk",
			    icon: "fa fa-cloud",
			    title: PbxObject.frases.GET_STARTED.STEPS.D.TITLE,
			    desc: PbxObject.frases.GET_STARTED.STEPS.D.BODY,
			    done: filterKinds(objects, 'trunk').length > 0,
			    onClick: function() {
			    	window.location.hash = '#trunk/trunk';
			    }
			}
		];

		wgSteps.forEach(function(item) {
			if(!item.done) allDone = false;
		});

		ReactDOM.render(GsWidget({
		    steps: wgSteps,
		    frases: PbxObject.frases
		}), document.getElementById('get-started-cont'));

		if(allDone) setAllDone();
	}

	function createTour() {
		dashTour = MyTour('dashboard', PbxObject.tours.dashboard());

        // dashTour = MyTour('dashboard', {
        //     steps: [
        //         {
        //             // orphan: true,
        //             backdropPadding: { top: 10 },
        //             placement: 'top',
        //             element: "#dash-tour-cont",
        //             title: PbxObject.frases.TOURS.DASHBOARD.A.TITLE,
        //             content: PbxObject.frases.TOURS.DASHBOARD.A.BODY
        //         }, {
        //             backdropPadding: { top: 10 },
        //             element: "#dash-graph-cont",
        //             title: PbxObject.frases.TOURS.DASHBOARD.B.TITLE,
        //             content: PbxObject.frases.TOURS.DASHBOARD.B.BODY,
        //             placement: "bottom"
        //         }, {
        //             backdropPadding: { top: 10 },
        //             element: "#dash-monitor-cont",
        //             title: PbxObject.frases.TOURS.DASHBOARD.C.TITLE,
        //             content: PbxObject.frases.TOURS.DASHBOARD.C.BODY,
        //             placement: "top"
        //         }, {
        //             element: "#dash-trstate-cont",
        //             title: PbxObject.frases.TOURS.DASHBOARD.D.TITLE,
        //             content: PbxObject.frases.TOURS.DASHBOARD.D.BODY,
        //             placement: "top"
        //         }, {
        //             element: "#dash-callmonitor-cont",
        //             title: PbxObject.frases.TOURS.DASHBOARD.E.TITLE,
        //             content: PbxObject.frases.TOURS.DASHBOARD.E.BODY,
        //             placement: "top"
        //         }, {
        //             element: "#home-btn",
        //             content: PbxObject.frases.TOURS.DASHBOARD.F.BODY,
        //             placement: "bottom"
        //         }, {
        //             element: "#pbxmenu",
        //             title: PbxObject.frases.TOURS.DASHBOARD.G.TITLE,
        //             content: PbxObject.frases.TOURS.DASHBOARD.G.BODY,
        //             placement: "right"
        //         }, {
        //             element: "#history-dropdown-cont .dropdown-menu",
        //             title: PbxObject.frases.TOURS.DASHBOARD.H.TITLE,
        //             content: PbxObject.frases.TOURS.DASHBOARD.H.BODY,
        //             placement: "left",
        //             onShow: function() {
        //             	$('#history-dropdown-cont').addClass('open');
        //             },
        //             onShown: function() {
        //             	$('#history-dropdown-cont .tour-step-backdrop').css('position', 'absolute');
        //             },
        //             onHide: function() {
        //             	$('#history-dropdown-cont').removeClass('open');
        //             }
        //         }, {
        //             reflex: true,
        //             element: "#open-opts-btn",
        //             content: PbxObject.frases.TOURS.DASHBOARD.I.BODY,
        //             placement: "left"
        //         }, {
        //             element: "#pbxoptions",
        //             title: PbxObject.frases.TOURS.DASHBOARD.J.TITLE,
        //             content: PbxObject.frases.TOURS.DASHBOARD.J.BODY,
        //             placement: "left",
        //             onShow: function() {
        //                 if(!isOptionsOpened()) open_options();
        //             },
        //             onHide: function() {
        //             	if(isOptionsOpened()) close_options();
        //             }
        //         }, {
        //             element: "#get-started-cont",
        //             title: PbxObject.frases.TOURS.DASHBOARD.K.TITLE,
        //             content: PbxObject.frases.TOURS.DASHBOARD.K.BODY,
        //             placement: "bottom"
        //         }
        //     ]
        // });
        // console.log('dashTour: ', dashTour);
    }

    function setAllDone() {
    	var panelEl = document.querySelector('#get-started-panel');
    	panelEl.classList.add('minimized');
    	panelEl.classList.add('all-done');
    }

	function filterKinds(array, kind, out) {
		return array.filter(function(item) {
			return out ? item.kind !== kind : item.kind === kind;
		});
	}
		
}