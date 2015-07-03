function Wizzard(opts){

	var options = {
		id: 'wizzard-el',
		greets: false,
		frases: {},
		wizzards: [],
		lang: 'en',
		callback: '',
		template: ''
	}

	var element = null;
	var wizzs = [];
	var currWizz = 0;
	var Configuration = {};

	function extend( a, b ) {
        for( var key in b ) {
            if( b.hasOwnProperty( key ) ) {
                a[key] = b[key];
            }
        }
        return a;
    }

    function init(){
    	extend(options, opts);
    	getTemplate();
    	// show_loading_panel();
    }

    function initWizzard(){
    	element = $('#'+options.id);
    	tabs = [].slice.call(document.querySelectorAll('#wizz-tabs form'));

    	$('#el-prev').click(prevWizz);
    	$('#el-next').click(nextWizz);

        remove_loading_panel();
    	element.modal();
    }

    function showWizz(ind){
    	var index;
    	if(ind < 0)
    		index = 0;
    	else if(ind > tabs.length-1)
    		index = tabs.length-1;
    	else
    		index = ind;

    	if(ind === currWizz)
    		return false;

    	tabs[currWizz].classList.remove('active');
    	tabs[index].classList.add('active');

    	currWizz = index;
    }

    function nextWizz(){
    	showWizz(currWizz+1);
    }

    function prevWizz(){
    	showWizz(currWizz-1);
    }

    function getTemplate(){
    	var temp = PbxObject.templates[options.id];
    	if(temp){
    		renderTemp(temp);
    	} else {
    		$.get('/badmin/views/wizzards/'+options.template+'.html', function(template){
                PbxObject.templates = PbxObject.templates || {};
                PbxObject.templates[options.id] = template;
    		    renderTemp(template);
    		});
    	}
    }

    function renderTemp(template){
    	// var data = {};
    	// data.frases = options.frases;
        var cont = document.getElementById('wizz-cont');
        if(!cont){
            cont = document.createElement('div');
            cont.id = 'wizz-cont';
            $('body').prepend(cont);
        }
    	options.template = Mustache.render(template, options);
    	$(cont).html(options.template);

    	initWizzard();
    }
    
    init();
}