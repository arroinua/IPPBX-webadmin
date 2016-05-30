function load_routes(result){
    // console.log(result);
    
    PbxObject.oid = result.oid;
    // PbxObject.kind = 'routes';
    PbxObject.routepriorities = [
        "Max. prefix length",
        "Least cost routing",
        "Load balancing",
        "Answer seizure ratio",
        "Average call duration",
        "Most idle gateway",
        "Least utilised gateway",
        "Max. priority (status)"    
    ];
    PbxObject.name = result.name;
    if(result.name) {
        document.getElementById('objname').value = result.name;
    }
    
    document.getElementById('enabled').checked = result.enabled;
    
    var i, table = document.getElementById('rtable'),
        ul = document.getElementById('priorities'),
        priorities = result.priorities;
    for(i=0; i<priorities.length; i++){
        var li = document.createElement('li');
        li.setAttribute('data-routepriority', priorities[i]);
        li.innerHTML = PbxObject.routepriorities[priorities[i]];
        ul.appendChild(li);
    }

    var transforms = result.anumbertransforms;
    if(transforms.length) {
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms1', transforms[i]);
        }
    } else { 
        append_transform(null, 'transforms1');
    }

    transforms = result.bnumbertransforms;
    if(transforms.length){
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms2', transforms[i]);
        }
    } else{
        append_transform(null, 'transforms2');
    }
    
    if(result.routes != undefined){
        build_routes_table(result.routes);
    } else{
        show_content();
    }
    
    TableSortable.sortables_init();
    set_page();
}

function set_routes(){
        
    var name = document.getElementById('objname').value;
    if(name)
        var jprms = '\"name\":\"'+name+'\",';
    else{
        alert(PbxObject.frases.MISSEDNAMEFIELD);
        return false;
    }
    show_loading_panel();
    
    var handler;
    if(PbxObject.name) {
        handler = set_object_success;
    } else {
        PbxObject.name = name;
        // handler = set_new_object;
        handler = null;
    }
    
    if(PbxObject.oid) jprms += '\"oid\":\"'+PbxObject.oid+'\",';
    jprms += '\"kind\":\"routes\",';
    jprms += '\"enabled\":'+document.getElementById('enabled').checked+',';
 
    jprms += '\"priorities\":[';
    var ul = document.getElementById('priorities');
    var i, j;
    for(i=0; i<ul.children.length; i++){
        jprms += ul.children[i].getAttribute('data-routepriority')+',';
    }
    
    jprms += '],';
    jprms += '\"anumbertransforms\":[';
    jprms += encode_transforms('transforms1');
    jprms += '],';
    jprms += '\"bnumbertransforms\":[';
    jprms += encode_transforms('transforms2');
    jprms += '],';
    
    jprms += '\"routes\":[';
    var str, row, table = document.getElementById('rtable'); 
    for(i=1; i<table.rows.length; i++){
        row = table.rows[i];
        if(row.className == 'route-on-edit') continue;
        str = '';
        str += '"number":"'+row.cells[0].textContent+'",';
        str += '"description":"'+row.cells[1].textContent+'",';
        str += '"target":{"oid":"'+row.cells[2].getAttribute('data-gid')+'"},';
        str += '"priority":'+parseInt(row.cells[3].getAttribute('data-priority'))+',';
        str += '"cost":'+parseFloat(row.cells[4].textContent)+',';
        if(str != '') jprms += '{'+str+'},';
    }
    jprms += ']';
    // console.log(jprms);
    json_rpc_async('setObject', jprms, handler);
}

function build_routes_table(routes){
    var result, fragment,
    tbody = document.getElementById("rtable").getElementsByTagName('tbody')[0];

    getAllowedObjects('routes', function(result) {
        if(!routes.length && result.length) tbody.appendChild(build_route_row(null, result));
        else {
            sortByKey(routes, 'number');
            fragment = document.createDocumentFragment();
            for(var i=0; i<routes.length; i++){
                fragment.appendChild(add_route_row(routes[i], result));
            }
            tbody.appendChild(fragment);
        }    
        show_content();
    }); 
}

function editRow(row, route) {
    getAllowedObjects('routes', function(result) {
        var newroute = build_route_row(route, result);
        row.parentNode.insertBefore(newroute, row);
        row.style.display = 'none';
    });
}

function add_new_route(e){
    var e = e || window.event;
    if(e) e.preventDefault();

    getAllowedObjects('routes', function(result) {
        var tbody = document.getElementById("rtable").getElementsByTagName('tbody')[0];
        tbody.insertBefore(build_route_row(null, result), tbody.children[0]);
    });

}

function add_route_row(route, objects){
    var row, cell;
    row = document.createElement('tr');
    cell = row.insertCell(0);
    cell.textContent = route.number;

    cell = row.insertCell(1);
    cell.textContent = route.description;
    cell.className = 'nowrap';
    cell.title = route.description || '';

    cell = row.insertCell(2);
    var obj = {};
    for(i=0; i<objects.length; i++){
        if(objects[i].oid == route.target.oid){
            obj = objects[i];
            cell.setAttribute('data-gid', route.target.oid);
            cell.setAttribute('data-gname', obj.name);
            cell.innerHTML = '<a href="#'+obj.kind+'?'+obj.oid+'">'+obj.name+'</a>';
        }
    }

    cell = row.insertCell(3);
    cell.setAttribute('data-priority', route.priority);
    cell.textContent = route.priority == 0 ? 'OFF' : route.priority == 10 ? 'EXV' : route.priority;

    cell = row.insertCell(4);
    cell.textContent = parseFloat(route.cost).toFixed(2);

    cell = row.insertCell(5);
    button = document.createElement('button');
    button.className = 'btn btn-primary btn-sm';
    button.innerHTML = '<i class="fa fa-edit"></i>';
    addEvent(button, 'click', function(){
        editRow(row, route);
        // var newroute = build_route_row(route, objects);
        // row.parentNode.insertBefore(newroute, row);
        // row.style.display = 'none';
    });
    cell.appendChild(button);

    cell = row.insertCell(6);
    button = document.createElement('button');
    button.className = 'btn btn-danger btn-sm';
    button.innerHTML = '<i class="fa fa-trash"></i>';
    addEvent(button, 'click', function(e){
        var c = confirm(PbxObject.frases.DELETE+' '+PbxObject.frases.ROUTE.toLowerCase()+'?');
        if(c) {
            deleteRoute(route.oid);
            remove_row(e);
            // set_routes();
        } else {
            return false;
        }
    });
    cell.appendChild(button);

    return row;
}

function build_route_row(route, objects){
    var rowData = {},
        tr = document.createElement('tr'),
        td = document.createElement('td'),
        div = document.createElement('div'),
        number = document.createElement('input'),
        optgroups = {}, optgroup, option, kind, oid;

    tr.className = "route-on-edit";
    div.className = 'form-group';
    number.className = 'form-control';
    number.setAttribute('type', 'text');
    number.setAttribute('name', 'number');
    number.setAttribute('size', '12');
    if(route != null) {
        number.value = route.number;
        rowData.oid = route.oid;
    }
    rowData.number = number.value.trim();
    number.onchange = function(){ rowData.number = number.value.trim() };
    div.appendChild(number);
    td.appendChild(div);
    tr.appendChild(td);

    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    descr = document.createElement('input');
    descr.className = 'form-control';
    descr.setAttribute('type', 'text');
    descr.setAttribute('name', 'description');
    if(route != null) {
        descr.value = route.description;
    }
    rowData.description = descr.value;
    descr.onchange = function(){ rowData.description = descr.value };
    div.appendChild(descr);
    td.appendChild(div);
    tr.appendChild(td);

    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    target = document.createElement('select');
    target.className = 'form-control';
    target.setAttribute('name', 'target');
    for(var i=0; i<objects.length; i++){
        kind = objects[i].kind;
        if(optgroups[kind]){
            optgroup = optgroups[kind];
        } else {
            optgroup = document.createElement('optgroup');
            optgroup.setAttribute('label', PbxObject.frases.KINDS[kind]);
            optgroups[kind] = optgroup;
            target.appendChild(optgroup)
        }
        // if(kind == 'equipment' || kind == 'cli' || kind == 'timer' || kind == 'routes' || kind == 'users' || kind == 'pickup') {
        //     continue;
        // }
        oid = objects[i].oid;
        option = document.createElement('option');
        option.setAttribute('value', oid);
        option.innerHTML = objects[i].name;
        if(route != null && oid == route.target.oid){
            option.setAttribute('selected', '');
        }
        optgroup.appendChild(option);
        // target.appendChild(option);
    }
    if(objects.length){
        rowData.target = {oid: target.options[target.selectedIndex].value, name: target.options[target.selectedIndex].textContent};
        target.onchange = function(){ rowData.target = {oid: target.options[target.selectedIndex].value, name: target.options[target.selectedIndex].textContent} };
    }
    div.appendChild(target);
    td.appendChild(div);
    tr.appendChild(td);
    
    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    priority = document.createElement('select');
    priority.className = 'form-control';
    priority.setAttribute('name', 'priority');
    for(var i=0; i<=10; i++){
        var option = document.createElement('option');
        option.value = i;
        if(route != null && i == route.priority){
            option.setAttribute('selected', '');
        }
        if(i == 0) {
            option.innerHTML = 'OFF';
        }
        else if(i == 10) {
            option.innerHTML = 'EXV';
        }
        else option.innerHTML = i;
        priority.appendChild(option);        
    }
    if(!route) priority.selectedIndex = 1;
    div.appendChild(priority);
    rowData.priority = priority.options[priority.selectedIndex].value;
    priority.onchange = function(){ rowData.priority = priority.options[priority.selectedIndex].value };
    td.appendChild(div);
    tr.appendChild(td);
    
    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    cost = document.createElement('input');
    cost.className = 'form-control';
    cost.setAttribute('type', 'text');
    cost.setAttribute('name', 'cost');
    cost.setAttribute('size', '2');
    if(route != null) {
        cost.setAttribute('value', parseFloat(route.cost).toFixed(2));
    } else {
        cost.value = parseFloat(0).toFixed(2);
    }
    rowData.cost = parseFloat(cost.value).toFixed(2);
    cost.onchange = function(){ rowData.cost = parseFloat(cost.value).toFixed(2) };
    div.appendChild(cost);
    td.appendChild(div);
    tr.appendChild(td);

    td = document.createElement('td');
    button = document.createElement('button');
    button.className = 'btn btn-default btn-sm';
    button.innerHTML = '<i class="fa fa-chevron-left"></i>';
    addEvent(button, 'click', function(){
        var row = tr.nextSibling;
        if(row && row.nodeName == 'TR' && row.style.display == 'none') {
            row.style.display = 'table-row';
        }
        tr.parentNode.removeChild(tr);
    });
    td.appendChild(button);
    tr.appendChild(td);

    td = document.createElement('td');
    button = document.createElement('button');
    button.className = 'btn btn-success btn-sm';
    button.innerHTML = '<i class="fa fa-check"></i>';
    addEvent(button, 'click', function(){
        var name = document.getElementById('objname').value;
        if(!name) {
            alert(PbxObject.frases.MISSEDNAMEFIELD);
            return;
        }
        if(!rowData.number) {
            alert(PbxObject.frases.MISSED_ROUTE_NUMBER);
            return;
        }
        var row = tr.nextSibling;
        var newrow = add_route_row(rowData, objects);
        tr.parentNode.insertBefore(newrow, tr);
        if(row && row.nodeName == 'TR' && row.style.display == 'none') {
            row.parentNode.removeChild(row);
        }
        tr.parentNode.removeChild(tr);
        setRoute(rowData, set_object_success);
    });
    td.appendChild(button);
    tr.appendChild(td);
        
    return tr;
}

function setRoute(data, callback){
    var jprms = '',
        cb = callback || null;
    if(data.oid) jprms += '\"oid\":\"'+data.oid+'\",';
    jprms += '\"groupid\":\"'+PbxObject.oid+'\",';
    jprms += '"number":"'+data.number+'",';
    jprms += '"description":"'+data.description+'",';
    jprms += '"target":{"oid":"'+data.target.oid+'", "name":"'+data.target.name+'"},';
    jprms += '"priority":'+data.priority+',';
    jprms += '"cost":'+data.cost+',';
    
    // console.log(jprms);
    json_rpc_async('setRoute', jprms, cb);
}

function deleteRoute(routeOid){
    var jprms = '\"oid\":\"'+routeOid+'\"';
    // console.log(jprms);
    json_rpc_async('deleteRoute', jprms, set_object_success);
}