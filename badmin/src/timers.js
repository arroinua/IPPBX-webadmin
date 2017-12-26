function load_timer(result){
    // console.log(result);
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;
    // PbxObject.kind = 'timer';

    var date = new Date();
    var yeardays = [];
    var pickr;
    var enabled = document.getElementById('enabled');
    var name = document.getElementById('objname');
    
    if(result.name){
        name.value = result.name;
    }

    if(enabled) {
        enabled.checked = result.enabled;
        addEvent(enabled, 'change', function(){
            setObjectState(result.oid, this.checked, function(result) {
                if(!result) enabled.checked = !enabled.checked;
            });
        });
    }

    var i;
    var hours = document.getElementById('hh');
    for(i=0;i<24;i++){
        var opt = document.createElement('option');
        if(i<10)
            var value = '0'+i;
        else
            value = i;
        opt.value = value;
        opt.innerHTML = value;
        hours.appendChild(opt);
        if(value == result.hour) {
            hours.selectedIndex = i;
        }
    }
    var minutes = document.getElementById('mm');
    for(i=0;i<=55;i+=5){
        var opt = document.createElement('option');
        if(i<10)
            var value = '0'+i;
        else
            value = i;
        opt.value = value;
        opt.innerHTML = value;
        minutes.appendChild(opt);
        if(value == result.minute) {
            minutes.selectedIndex = i/5;
        }
    }
    for(i=0; i<result.weekdays.length; i++){
        var day = document.getElementById('t-d'+result.weekdays[i]);
        day.checked = true;
        if(day.parentNode.nodeName === 'LABEL') day.parentNode.classList.add('active');
    }
    
    fill_timer_targets('objects');
    setTimezones(
        document.getElementById('timer_timezone'), 
        (result.timezone || PbxObject.options.timezone)
    );

    var targets = document.getElementById('targets').getElementsByTagName('tbody')[0];
    for(i=0; i < result.targets.length; i++){
        targets.appendChild(timer_target_row(result.targets[i].oid, result.targets[i].name, result.targets[i].action));
    }
    
    show_content();
    set_page();

    var add = document.getElementById('add-timer-target');
    add.onclick = function(){
        add_timer_target();
    };
    
    var trange = document.getElementById('timer-range');
    addEvent(trange, 'click', check_days);

    var calendarWrapper = document.createElement('div');
    calendarWrapper.className = "timer-dates-wrapper no-weekdays no-years";
    document.body.appendChild(calendarWrapper);

    // init yeardates picker
    pickr = flatpickr('#timer-dates', {
        locale: PbxObject.language || 'en',
        mode: 'multiple',
        dateFormat: 'd F',
        appendTo: calendarWrapper,
        minDate: new Date(2017, 0, 1), // not a leap year
        maxDate: new Date(2017, 11, 31), // not a leap year
        onChange: function(selectedDates, dateStr){
            setTempParams({ selectedDates: selectedDates });
        }
    });

    // format yeardates and set them in picker
    if(result.yeardays) {
        result.yeardays.forEach(function(item){
            yeardays.push(moment().dayOfYear(item).format());
        })
        
        pickr.setDate(yeardays);
    }
}

function setTimezones(cont, selected) {
    var tzones = moment.tz.names() || [];
    var fragment = document.createDocumentFragment();
    var option = null;

    tzones.map(function(item) {
        option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        if(item === selected) option.selected = true;

        fragment.appendChild(option);
        return item;
    });

    cont.appendChild(fragment);
}

function set_timer(){
        
    var jprms, 
        name = document.getElementById('objname').value,
        timezone = document.getElementById('timer_timezone');

    if(name)
        jprms = '\"name\":\"'+name+'\",';
    else{
        alert(PbxObject.frases.MISSEDNAMEFIELD);
        return false;
    }
    
    show_loading_panel();
    
    var handler;
    if(PbxObject.name) {
        handler = set_object_success;
    }
    else{
        PbxObject.name = name;
        // handler = set_new_object;
        handler = null;
    }
    
    if(PbxObject.oid != null) {
        jprms += '\"oid\":\"'+PbxObject.oid+'\",';
    }
    jprms += '\"kind\":\"timer\",';
    var enabled = document.getElementById('enabled');
    if(enabled != null) {
        jprms += '\"enabled\":'+enabled.checked+',';
    }
    var h = document.getElementById('hh');
    var m = document.getElementById('mm');
    jprms += '\"hour\":\"'+h.options[h.selectedIndex].value+'\",';
    jprms += '\"minute\":\"'+m.options[m.selectedIndex].value+'\",';

    if(timezone.value || PbxObject.options.timezone)
        jprms += '\"timezone\":\"'+ (timezone.value || PbxObject.options.timezone) +'\",';

    jprms += '\"weekdays\":[';
    var i;
    for(i=0; i<7; i++){
        if(document.getElementById('t-d'+i).checked){
            jprms += i+',';
        }
    }
    jprms += '],';

    // Set yeardays
    if(PbxObject.currentObj && PbxObject.currentObj.selectedDates) {
        jprms += '\"yeardays\":[';
        PbxObject.currentObj.selectedDates.forEach(function(item){
            jprms += (moment(item).dayOfYear() + ',');
        });
        jprms += '],';
    }
        


    var targets = document.getElementById('targets').getElementsByTagName('tbody')[0];
    
    jprms += '\"targets\":[';
    for(i=0; i < targets.children.length; i++){
        var tr = targets.children[i];
        if(tr.id != undefined && tr.id != ''){
            jprms += '{\"oid\":\"'+targets.children[i].id+'\",\"action\":\"'+(tr.children[0].getAttribute('data-action'))+'\"},';
        }
    }
    jprms += ']';
    
    json_rpc_async('setObject', jprms, handler); 
}

function timer_target_row(oid, name, action){
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    var a = document.createElement('a');
    var straction = action == "Enable" ? PbxObject.frases.ENABLE : PbxObject.frases.DISABLE;

    td.textContent = straction;
    td.setAttribute('data-action', action);
    tr.appendChild(td);

    td = document.createElement('td');
    tr.id = oid;
    a.href = '#';
    a.onclick = function(e){
        get_object_link(oid);
        e.preventDefault();
    };
    a.innerHTML = name;
    td.appendChild(a);
    tr.appendChild(td);
    
    td = document.createElement('td');
    var button = document.createElement('button');
    button.className = 'btn btn-danger btn-sm';
    button.innerHTML = '<i class="fa fa-minus"></i>';
    button.onclick = function(){
        remove_listener(oid);
    };
    td.appendChild(button);
    tr.appendChild(td);
    return tr;
}

function add_timer_target() {
    var table = document.getElementsByTagName('tbody')[0];
    var select = document.getElementById('objects');
    var action = document.getElementById('actions');
    var opt = select.options[select.selectedIndex];
    table.appendChild(timer_target_row(opt.value, opt.innerHTML, action.value));
}

function remove_listener(oid){
    var targets = document.getElementById('targets').getElementsByTagName('tbody')[0];
    var i;
    for(i=0; i < targets.children.length; i++){
        if(targets.children[i].id == oid){
            targets.removeChild(targets.children[i]);
        }
    }    
}

function fill_timer_targets(id){
    var objects = document.getElementById(id),
        optgroups = {}, optgroup, option, kind, oid,
        result;
    if(typeof PbxObject.objects === 'object') {
        result = PbxObject.objects;
    } else {
        result = json_rpc('getObjects', '\"kind\":\"all\"');
        sortByKey(result, 'name');
        PbxObject.objects = result;
    }
    // var result = json_rpc('getObjects', '\"kind\":\"all\"');
    for(var i=0; i<result.length; i++){
        kind = result[i].kind;
        if(kind == 'equipment' || kind == 'cli' || kind == 'timer' || kind == 'users') {
            continue;
        }
        if(optgroups[kind]){
            optgroup = optgroups[kind];
        } else {
            optgroup = document.createElement('optgroup');
            optgroup.setAttribute('label', PbxObject.frases.KINDS[kind]);
            optgroups[kind] = optgroup;
            objects.appendChild(optgroup);    
        }
        oid = result[i].oid;
        option = document.createElement('option');
        option.value = oid;
        option.innerHTML = result[i].name;
        optgroup.appendChild(option);
        // objects.appendChild(option);
    }
}

function check_days(e){
    var e = e || window.event,
        targ = e.target,
        filter = targ.getAttribute('data-filter'), day;

    e.preventDefault();

    for(var i=0; i<7; i++){
        day = document.getElementById('t-d'+i);
        if((filter === 'timer-workdays' && (i===5 || i===6)) || (filter === 'timer-holidays' && i<5)){
            if(day.checked) day.checked = false;
            if(day.parentNode.nodeName === 'LABEL') day.parentNode.classList.remove('active');
            continue;
        }
        day.checked = true;
        if(day.parentNode.nodeName === 'LABEL') day.parentNode.classList.add('active');
    }
}