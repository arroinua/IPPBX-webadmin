PbxObject.tours = PbxObject.tours || [];

PbxObject.tours.equipment = function(params){

    var frases = params.frases;

    return {
        storage: window.localStorage,
        backdrop: false,
        steps: [
            {
                placement: 'bottom',
                element: "#objname",
                title: 'Group name',
                content: 'Enter a group name'
            }, {
                backdrop: true,
                backdropPadding: { bottom: 10 },
                placement: 'top',
                element: "#equipment-group-setts",
                title: 'Group settings',
                content: 'Select the signaling <b>protocol</b> for devices to connect with. <b>Device type</b> is basicaly the type of devices that would be connected to the server.'
            }, {
                reflex: true,
                placement: 'top',
                element: "#add-newuser-btn",
                title: 'Creating new extensions',
                content: 'Click this button to open the <b>Create extensions</b> form',
                onHidden: function() {
                    $('#new-user-form').collapse('show');
                }
            }, {
                backdrop: true,
                backdropPadding: { bottom: 10 },
                reflex: 'users.create',
                placement: 'top',
                element: "#new-user-form",
                title: 'Creating new extensions',
                content: 'To create a new extension, fill in the form with the extension\'s data and then click <b>Create</b> button. After creating a first extension, the equipment group will be created also (<br/> Make sure to fill in the <b>Group name</b> field above). <br/> Click <b>Clear</b> button to clear the form.'
            }, {
                backdrop: true,
                backdropPadding: { bottom: 10 },
                placement: 'top',
                element: "#group-extensions",
                title: 'Extensions list',
                content: 'All extensions that were added to the group are listed here with the real-time updates of the extensions statuses'
            }, {
                placement: 'top',
                element: "#ext-features-panel",
                title: 'Extension features',
                content: 'Select which of the features of IP PBX would be available to the extensions of current group',
                onShow: function() {
                    $('#ext-features-panel').removeClass('minimized');
                }
            }, {
                placement: 'bottom',
                element: "#el-set-object",
                title: 'Saving changes',
                content: 'Click <b>Save</b> button to save changes'
            }
        ]
    }
}