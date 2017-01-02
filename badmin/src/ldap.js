function Ldap(options){
    var options = options || {},
    available = [],
    ldapUsers = [],
    selectedUsers = [],
    modal = null;

    console.log('new LDAP: ', options);

    var prevValue, newValue, userIndex, obj = {};

    function getUsers(authData, cb){
        json_rpc_async('getDirectoryUsers', authData, function(result) {
            console.log('getDirectoryUsers result: ', result);
            if(cb) cb(result);
        });
    }

    function getExternalUsers(authData, cb){
        var params = {
            url: '/services/'+options.service_id+'/Users'
        };
        if(authData) {
            params.method = 'POST';
            params.data = 'username='+authData.username+'&password='+authData.password;
        }
        $.ajax(params).then(function(data){
            console.log('getExternalUsers: ', data);
            if(cb) cb(data.result);
            else showUsers(data.result);

        }, function(err){
            console.log('getExternalUsers error: ', err);
            if(err.responseJSON && err.responseJSON.error.code === 401) {
                options.external = true;
                openAuthModal();
            } else {
                var loc = window.location,
                newhref = loc.origin + loc.pathname + (loc.search ? loc.search : '?') + '&service_id='+options.service_id+'&service_type='+options.service_type + loc.hash;
                window.sessionStorage.setItem('lastURL', newhref);
                window.location = loc.origin + '/services/'+options.service_id+'/Users';
            }
        });
    }

    function setUsers(data, cb){
        console.log('setDirectoryUsers: ', data);
        json_rpc_async('setDirectoryUsers', data, function(result) {
            console.log('setDirectoryUsers result: ', result);
            if(cb) cb(result);
        });
    }

    function setExternalUsers(data, cb){
        console.log('setExternalUsers: ', data);
        json_rpc_async('setExternalUsers', data, function(result) {
            console.log('setExternalUsers result: ', result);
            if(cb) cb(result);
        });
    }

    function openAuthModal(params){
        if(params) {
            getUsers(params, function(result) {
                if(result) showUsers(result);
            });
        } else {
            showModal('ldap_auth', {service_id: options.service_id, domains: options.domains}, ldapAuth);
        }
    }

    function ldapAuth(data, modalObject){
        console.log('ldapLogin: ', data, modalObject);
        var btn = modalObject.querySelector('button[data-type="submit"]'),
            prevhtml = btn.innerHTML;
        
        modal = modalObject;
        btn = $(btn);
        btn.prop('disabled', true);
        btn.html('<i class="fa fa-fw fa-spinner fa-spin"></i>');
        
        options.auth = data;

        if(options.external) {
            getExternalUsers(data, function(result){
                console.log('getExternalUsers login result: ', result);
                btn.prop('disabled', false);
                btn.html(prevhtml);

                if(result) {
                    $(modalObject).modal('hide');
                    showUsers(result);
                }
            });
        } else {
            getUsers(data, function(result) {
                console.log('ldapLogin result: ', result);
                btn.prop('disabled', false);
                btn.html(prevhtml);

                if(result) {
                    $(modalObject).modal('hide');
                    showUsers(result);
                }
            });
        }
    }

    function showUsers(users){
        var usersArray = users.map(function(item, index) {
            item.index = index;
            return item;
        });
        
        ldapUsers = users;
        available = options.available.map(function(item, index){
            return {
                id: index+1,
                text: item
            };
        });
        available.unshift({ id: 0, text: '----------' });

        console.log('showModal: ', PbxObject.available, options.available, available);

        showModal('ldap_users', {
            users: usersArray,
        }, addLdapUsers, onLdapModalOpen, onLdapModalClose);
    }

    function addLdapUsers(data, modalObject){
        console.log('addLdapUsers: ', selectedUsers);

        function hasExt(item){
            return item.hasOwnProperty('ext');
        }

        modal = modalObject;

        options.onaddusers(selectedUsers.filter(hasExt));
    }

    function onLdapModalOpen(modalObject){
            
        $(modalObject).on('click', function(e){
            e.preventDefault();
            var targ = e.target;
            if(targ.name !== 'add-ldap-user') targ = targ.parentNode;
            if(targ.name === 'add-ldap-user') addExtSelection(targ);
        });

        modal = modalObject;

        TableSortable.sortables_init();
    }

    function addExtSelection(el){
        var id,
            $select,
            $el = $(el),
            $cont = $el.next();

        userIndex = parseInt(el.getAttribute('data-index'), 10);
        prevValue = $el.data('data-selected');

        $cont.html('<select style="width: 100%;"></select>');
        $select = $cont.children(':first');
        
        $el.hide();
        $select.select2({
            data: sortByKey(available, 'id')
        });

        console.log('available: ', available);

        $select.on('select2:open', onSelectOpen);
        $select.on('select2:close', onSelectSelected);
        $select.on('select2:close', function(){
            if(newValue && newValue.id !== 0) {
                $el.text(newValue.text);
                id = newValue.id;
            } else if(newValue && newValue.id === 0){
                $el.html('<i class="fa fa-plus-circle fa-fw fa-lg"></i>');
                id = newValue.id;
            } else {
                $el.text(prevValue.text);
                id = prevValue.id;
            }
            $el.data('data-selected', id);
            $el.show();
            $cont.hide();
        });

        $cont.show();
        if(prevValue) $select.val(prevValue).trigger('change');
        $select.select2('open');

    }

    function onSelectOpen(e){
        prevValue = available[parseInt(this.value, 10)];
        newValue = null;
    }

    function onSelectSelected(e){
        newValue = available[parseInt(this.value, 10)];

        if(prevValue.id !== newValue.id) {
            if(prevValue.id !== 0) {
                prevValue.disabled = false;

                selectedUsers.splice(selectedUsers.indexOf(userIndex), 1);
            }
            if(newValue.id !== 0) {
                newValue.disabled = true;

                obj = ldapUsers[userIndex];
                obj.ext = newValue.text;
                delete obj.index;
                
                selectedUsers.push(obj);
            }
        }

        $(this).off('select2:open', onSelectOpen);
        $(this).off('select2:close', onSelectSelected);
        // destroy select element
        $(this).select2('destroy');
    }

    function onLdapModalClose(modalObject){
        console.log('LDAP modal closed');
        available = [];
        ldapUsers = [];
        selectedUsers = [];
    }

    function closeModal(){
        $(modal).modal('hide');
    }

    return {
        options: options,
        getUsers: getUsers,
        getExternalUsers: getExternalUsers,
        setUsers: setUsers,
        setExternalUsers: setExternalUsers,
        showUsers: showUsers,
        auth: openAuthModal,
        close: closeModal
    };
}