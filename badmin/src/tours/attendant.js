PbxObject.tours = PbxObject.tours || [];

PbxObject.tours.attendant = function(){

    var frases = PbxObject.frases;

    return {
        storage: window.localStorage,
        backdrop: false,
        steps: [
            {
                placement: 'bottom',
                element: "#objname",
                title: frases.TOURS.ATTENDANT.A.TITLE,
                content: frases.TOURS.ATTENDANT.A.BODY
            }, {
                placement: 'bottom',
                element: "#object-route-cont",
                title: frases.TOURS.ATTENDANT.B.TITLE,
                content: frases.TOURS.ATTENDANT.B.BODY
            }, {
                placement: 'left',
                element: "#enabled-cont",
                title: frases.TOURS.ATTENDANT.C.TITLE,
                content: frases.TOURS.ATTENDANT.C.BODY
            }, {
                placement: 'right',
                element: "#attGreetings",
                title: frases.TOURS.ATTENDANT.D.TITLE,
                content: frases.TOURS.ATTENDANT.D.BODY
            }, {
                placement: 'right',
                element: "#att-email-setts",
                title: frases.TOURS.ATTENDANT.E.TITLE,
                content: frases.TOURS.ATTENDANT.E.BODY
            }, {
                placement: 'right',
                element: "#attconnectors",
                title: frases.TOURS.ATTENDANT.F.TITLE,
                content: frases.TOURS.ATTENDANT.F.BODY
            }, {
                reflex: true,
                placement: 'bottom',
                element: "#att-obj-types",
                title: frases.TOURS.ATTENDANT.G.TITLE,
                content: frases.TOURS.ATTENDANT.G.BODY,
                onShow: function() {
                    $('#att-container .att-init-button').removeClass('open');
                },
                onHidden: function() {
                    $('#att-container .att-init-button').addClass('open');
                }
            }, {
                reflex: true,
                backdrop: true,
                placement: 'bottom',
                element: "#att-obj-types + .dropdown-menu",
                title: frases.TOURS.ATTENDANT.H.TITLE,
                content: frases.TOURS.ATTENDANT.H.BODY,
                onHidden: function() {
                    $('#att-container .att-init-button').removeClass('open');
                }
            }
        ]
    }
}