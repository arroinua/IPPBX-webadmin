function load_realtime(){
    
    var realTimeInterval = null;
    // var statInterval = null;
    var data = {
        extensions: [],
        state: {
            inc: 0,
            out: 0,
            conn: 0,
            load: 0
        },
        trunks: [],
        calls: []
        // graph: [],
        // channels: []
    };

    init();

    function init() {

        getExtensions(function(result) {
            data.extensions = result;

            realTimeInterval = setInterval(fetchRealTimeData, 1000);
            // statInterval = setInterval(fetchStatistics, 1800*1000);
            addEvent(window, 'hashchange', stopUpdate);

            renderComponent();
            show_content();
            set_page();
        });
    }

    function renderComponent() {
        ReactDOM.render(RealtimeDashboardComponent({
            frases: PbxObject.frases,
            data: data
        }), document.getElementById('el-loaded-content'));
    }

    function fetchRealTimeData() {
        // sendData('getCurrentState', null, 6);
        // sendData('getCurrentCalls', null, 5);

        json_rpc_async('getCurrentCalls', null, setCurrentCalls);
        json_rpc_async('getCurrentState', null, setCurrentState);
    }

    function setCurrentState(result) {
        data.state = result;
        data.trunks = result.trunks;
        renderComponent(data);
        // var trunks = result.trunks;
        // var inc = result.in;
        // var out = result.out;
        // var conn = result.conn;
        // var load = result.load;
        
    }

    function setCurrentCalls(result) { // time, caller, called
        if(!result) return;
        data.calls = result;
        renderComponent(data);

    }

    function stopUpdate(){
        clearInterval(realTimeInterval);
        // clearInterval(statInterval);
        removeEvent(window, 'hashchange', stopUpdate);

    }

}