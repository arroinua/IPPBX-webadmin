PbxObject.tours = PbxObject.tours || [];

PbxObject.tours.dashboard = function() {
    return {
        steps: [
            {
                // orphan: true,
                backdropPadding: { top: 10 },
                placement: 'top',
                element: "#dash-tour-cont",
                title: PbxObject.frases.TOURS.DASHBOARD.A.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.A.BODY
            }, {
                backdropPadding: { top: 10 },
                element: "#dash-graph-cont",
                title: PbxObject.frases.TOURS.DASHBOARD.B.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.B.BODY,
                placement: "bottom"
            }, {
                backdropPadding: { top: 10 },
                element: "#dash-monitor-cont",
                title: PbxObject.frases.TOURS.DASHBOARD.C.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.C.BODY,
                placement: "top"
            }, {
                element: "#dash-trstate-cont",
                title: PbxObject.frases.TOURS.DASHBOARD.D.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.D.BODY,
                placement: "top"
            }, {
                element: "#dash-callmonitor-cont",
                title: PbxObject.frases.TOURS.DASHBOARD.E.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.E.BODY,
                placement: "top"
            }, {
                element: "#home-btn",
                content: PbxObject.frases.TOURS.DASHBOARD.F.BODY,
                placement: "bottom"
            }, {
                element: "#pbxmenu",
                title: PbxObject.frases.TOURS.DASHBOARD.G.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.G.BODY,
                placement: "right"
            }, {
                element: "#history-dropdown-cont .dropdown-menu",
                title: PbxObject.frases.TOURS.DASHBOARD.H.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.H.BODY,
                placement: "left",
                onShow: function() {
                	$('#history-dropdown-cont').addClass('open');
                },
                onShown: function() {
                	$('#history-dropdown-cont .tour-step-backdrop').css('position', 'absolute');
                },
                onHide: function() {
                	$('#history-dropdown-cont').removeClass('open');
                }
            }, {
                reflex: true,
                element: "#open-opts-btn",
                content: PbxObject.frases.TOURS.DASHBOARD.I.BODY,
                placement: "left"
            }, {
                element: "#pbxoptions",
                title: PbxObject.frases.TOURS.DASHBOARD.J.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.J.BODY,
                placement: "left",
                onShow: function() {
                    if(!isOptionsOpened()) open_options();
                },
                onHide: function() {
                	if(isOptionsOpened()) close_options();
                }
            }, {
                element: "#get-started-cont",
                title: PbxObject.frases.TOURS.DASHBOARD.K.TITLE,
                content: PbxObject.frases.TOURS.DASHBOARD.K.BODY,
                placement: "bottom"
            }
        ]
    }
}