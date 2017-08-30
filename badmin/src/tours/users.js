PbxObject.tours = PbxObject.tours || [];

PbxObject.tours.users = function(params){

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
                reflex: true,
                placement: 'top',
                element: "#add-newuser-btn",
                title: 'Creating new users',
                content: 'Click this button to open the <b>Create users</b> form',
                onHidden: function() {
                    $('#new-user-form').collapse('show');
                }
            }, {
                backdrop: true,
                backdropPadding: { bottom: 10 },
                reflex: 'users.create',
                placement: 'top',
                element: "#new-user-form",
                title: 'Creating new users',
                content: 'To create a new user, fill in the form with the user\'s data and then click <b>Create</b> button. After creating a first user, the users group will be created also (<br/> Make sure to fill in the <b>Group name</b> field above). <br/> Click <b>Clear</b> button to clear the form.'
            }, {
                backdrop: true,
                backdropPadding: { bottom: 10 },
                placement: 'top',
                element: "#group-extensions",
                title: 'Users list',
                content: 'All users that were added to the group are listed here with the real-time updates of the users statuses'
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