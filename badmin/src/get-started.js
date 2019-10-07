function GetStarted(container) {
	var extensions = [],
		objects = PbxObject.objects
		// welcomeModal = 'welcome-modal',
		// wgSteps = [],
		// dashTour = {};

	var modalCont = document.getElementById('modals-cont');
	if(!modalCont) {
		modalCont = document.createElement('div');
		modalCont.id = "gs-modal-cont";
		document.body.appendChild(modalCont);
	}

	this.init = function() {
		// createTour();

		// Get initial data for the Widget
		// if(typeof objects === 'object') {
			// createWidget();
		// } else {

			getExtensions(function(exts) {
			    extensions = exts;

			    // getObjects(null, function(objs) {
			    	// objects = objs;


			    	// createWidget();

			    	if(doWelcomeModalNeeded()) {
			    		initGetStarted();
			    		appStorage.set('welcomed', true);
			    	}

					createGSButton();

			    	// if(doWelcomeModalNeeded())
			    	// 	loadWelcomeModal();
			    // });

			});
		// }		
	};

	function doWelcomeModalNeeded() {
		// var noRoutesObjs = filterKinds(objects, 'routes', true);
		return !appStorage.get('welcomed') && (!extensions.length || extensions.length < 2);
	}

	// function loadWelcomeModal() {
	//     var modalCont = document.createElement('div');
	//     $('body').prepend(modalCont);

	//     ReactDOM.render(WelcomeModal({
	//         startTour: startTour,
	//         frases: PbxObject.frases
	//     }), modalCont);

	//     $('#welcome-modal').modal();

	//     appStorage.set('welcomed', true);
	// }

	// function startTour() {
	//     dashTour.start();
	// }

	// function createWidget() {

	// 	var allDone = true;

	// 	wgSteps = [
	// 		{
	// 			component: "AddExtensions",
	// 		    name: "addExtensions",
	// 		    icon: "fa fa-users",
	// 		    title: PbxObject.frases.GET_STARTED.STEPS.A.TITLE,
	// 		    desc: PbxObject.frases.GET_STARTED.STEPS.A.BODY,
	// 		    done: filterKinds(objects, 'users').length > 0 || filterKinds(objects, 'equipment').length > 0
	// 		}, {
	// 			component: "AddServiceGroup",
	// 		    name: "addServiceGroup",
	// 		    icon: "icon-headset_mic",
	// 		    title: PbxObject.frases.GET_STARTED.STEPS.B.TITLE,
	// 		    desc: PbxObject.frases.GET_STARTED.STEPS.B.BODY,
	// 		    done: filterKinds(objects, ['hunting','icd','chatchannel']).length > 0
	// 		}, {
	// 			component: "AddChannel",
	// 		    name: "addChannel",
	// 		    icon: "fa fa-whatsapp",
	// 		    title: PbxObject.frases.GET_STARTED.STEPS.B.TITLE,
	// 		    desc: PbxObject.frases.GET_STARTED.STEPS.B.BODY,
	// 		    done: filterKinds(objects, ['chattrunk']).length > 0
	// 		}
	// 		// {
	// 		// 	// component: "AddTrunk",
	// 		//     name: "addAttendant",
	// 		//     icon: "icon-room_service",
	// 		//     title: PbxObject.frases.GET_STARTED.STEPS.C.TITLE,
	// 		//     desc: PbxObject.frases.GET_STARTED.STEPS.C.BODY,
	// 		//     done: filterKinds(objects, 'attendant').length > 0,
	// 		//     onClick: function() {
	// 		//     	window.location.hash = '#attendant/attendant';
	// 		//     }
	// 		// }, 
	// 		// {
	// 		// 	// component: "AddTrunk",
	// 		//     name: "addTrunk",
	// 		//     icon: "fa fa-cloud",
	// 		//     title: PbxObject.frases.GET_STARTED.STEPS.D.TITLE,
	// 		//     desc: PbxObject.frases.GET_STARTED.STEPS.D.BODY,
	// 		//     done: filterKinds(objects, 'trunk').length > 0,
	// 		//     onClick: function() {
	// 		//     	window.location.hash = '#trunk/trunk';
	// 		//     }
	// 		// }
	// 	];

	// 	wgSteps.forEach(function(item) {
	// 		if(!item.done) allDone = false;
	// 	});

	// 	ReactDOM.render(GsWidget({
	// 	    steps: wgSteps,
	// 	    frases: PbxObject.frases
	// 	}), document.getElementById('get-started-cont'));

	// 	if(allDone) setAllDone();
	// }

	function initGetStarted() {
		var initialStep = extensions.length < 2 ? 0 : 2;
		// var initialStep = 0;

		ReactDOM.render(GSModalComponent({
		    frases: PbxObject.frases,
		    initialStep: initialStep,
		    profile: PbxObject.profile,
		    options: PbxObject.options,
		    objects: PbxObject.objects,
		    onClose: onClose,
		    sendLinks: sendLinks
		}), modalCont);

	}

	function sendLinks(email) {
		
	}

	function onClose(init) {
		PbxObject.tourStarted = init ? true : false;
	}

	function createGSButton() {
		var ul = document.createElement('ul');
		var li = document.createElement('li');
		var cont = document.querySelector('#pbxmenu');
		var child = document.querySelector('#pbxmenu .nav-list');

		ul.className = 'nav-list';
		ul.appendChild(li);
		cont.insertBefore(ul, child);

		ReactDOM.render(InitGSButtonComponent({
		    frases: PbxObject.frases,
		    onClick: initGetStarted
		}), li);
	}

	// function createTour() {
	// 	dashTour = MyTour('dashboard', PbxObject.tours.dashboard());
 //    }

    // function setAllDone() {
    // 	var panelEl = document.querySelector('#get-started-panel');
    // 	panelEl.classList.add('minimized');
    // 	panelEl.classList.add('all-done');
    // }

	function filterKinds(array, kinds, reverse) {
		return array.filter(function(item) {
			return reverse ? (Array.isArray(kinds) ? kinds.indexOf(item.kind) === -1 : item.kind !== kinds) : (Array.isArray(kinds) ? kinds.indexOf(item.kind) !== -1 : item.kind === kinds);
		});
	}
		
}