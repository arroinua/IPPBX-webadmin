function load_dashboard(){

    var params = {
        frases: PbxObject.frases,
        options: PbxObject.options,
        profile: PbxObject.profile,
        fetchData: fetchData,
        fetchSubscription: fetchSubscription,
        fetchCallingCredits: fetchCallingCredits
    };
    
    init();

    function init(pickerEl) {
        renderComponent(params);
    }

    function renderComponent(params) {
        ReactDOM.render(DashboardComponent(params), document.getElementById('el-loaded-content'));

        show_content();
        set_page();
    }

    function fetchData(method, params, callback) {
        json_rpc_async(method, params, callback);
    }

    function fetchSubscription(callback) {
        BillingApi.getSubscription(callback);
    }

    function fetchCallingCredits(callback) {
        BillingApi.getCredits(callback);   
    }

}