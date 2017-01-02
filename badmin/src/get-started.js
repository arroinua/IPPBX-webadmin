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
		
		json_rpc_async('getExtensions', null, function(result) {
		    extensions = result;
		    console.log('extensions:', extensions);
		});

		if(typeof objects === 'object') {
			createWidget();
		} else {
			json_rpc_async('getObjects', {kind: 'all'}, function(result) {
				objects = PbxObject.objects = result;

				console.log('objects:', objects);
				createWidget();
			});
		}

		loadWelcomeModal();
		createTour();
		

		// $('#init-wizard-btn').click(openWizard);
	};

	function startTour() {
		tour.start();
	}

	function createTour() {
		tour = new Tour({
			name: "get-started",
			backdrop: true,
			backdropContainer: "#pagecontent",
			storage: false,
			steps: [
				{
					element: "#pbxmenu",
					title: "Navigation",
					content: "Navigate to the object of your Ringotel cloud using navigation menu."
				}, {
					element: "#el-slidemenu",
					title: "Reports and Statistics",
					content: "Watch reports and statistics, and monitor call records.",
					placement: "left"
				}, {
					element: "#get-started-cont",
					title: "Get Started",
					content: "User Get Started guide to set up you cloud.",
					placement: "bottom"
				}
			]
		});
		tour.init();
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

	function createExtGroup(params) {
		console.log('createExtGroup', params);
	}

	function addExtension(params) {
		console.log('addExtension: ', params);
	}

	function loadWelcomeModal() {
		var modalCont = document.createElement('div');
		$('body').prepend(modalCont);

		ReactDOM.render(WelcomeModal({
		    startTour: startTour
		}), modalCont);

		openModal('welcome-modal');

		// getPartial('welcome-modal', function(template) {
		// 	var data = {};
		// 	data.frases = PbxObject.frases;
		// 	rendered = Mustache.render(template, data);
		// 	$('body').prepend(rendered);
		// 	openModal('welcome-modal');
		// });
	}

	function openModal(modalName, onShow) {
		$('#'+modalName).modal();
		if(onShow) 
			$('#'+modalName).on('shown.bs.modal', onShow);
	}

	function filterKinds(array, kind) {
		return array.filter(function(item) {
			return item.kind === kind;
		});
	}
		
}