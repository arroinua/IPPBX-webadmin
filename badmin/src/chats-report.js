function load_chats_report(){

	init();
	show_content();
    set_page();

    // function formatTimeString(time, format){
    //     var h, m, s, newtime;
    //     h = Math.floor(time / 3600);
    //     time = time - h * 3600;
    //     m = Math.floor(time / 60);
    //     s = Math.floor(time - m * 60);

    //     newtime = (h < 10 ? '0'+h : h) + ':' + (m < 10 ? '0'+m : m);
    //     if(!format || format == 'hh:mm:ss'){
    //         newtime += ':' + (s < 10 ? '0'+s : s);
    //     }
    //     return newtime;
    // }

    // function formatIndex(value, format) {
    // 	var result = value;
    // 	if(format === 'ms') result = this._formatTimeString(result / 1000);

    // 	return result;
    // }

    // function getIndexFormat(index) {
    // 	var durations = /art|atfr|atrm|atta/;
    // 	if(index.match(durations)) {
    // 		return 'duration';
    // 	}

    // 	return 'number';
    // }

	function init(params){
		console.log('load_chats_report params: ', params);

		var componentParams = {
			frases: PbxObject.frases
		};

		ReactDOM.render(AnalyticsComponent(componentParams), document.getElementById('el-loaded-content'));
	}

}