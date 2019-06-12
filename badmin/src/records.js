function load_records(){
    //     start = new Date(picker.date.start).getTime(),
    //     end = new Date(picker.date.end).getTime(),
    //     interval = picker.interval,
    //     params = '\"begin\":'+start+', \"end\":'+end;

    // json_rpc_async('getCallStatisticsGraph', params, function(result){
    //     self.createGraph(result);
    // });

    PbxObject.Pagination = new Pagination();
    PbxObject.recPicker = new Picker('recs-date-picker', {submitFunction: getRecParams, actionButton: false, buttonSize: 'md'});

    var methods = {
        playRecord: playRecord,
        getQos: getQos,
        toggleRecQoS: toggleRecQoS
    };

    var elmode = [].slice.call(document.querySelectorAll('.init-mode'));
    elmode.forEach(function(item){
        if(item.value === "0") item.checked = true;
    });

    function handleTableClick(e) {
        // if(!e.target.hasAttribute('download')) e.preventDefault();

        var target = e.target.nodeName === 'I' ? e.target.parentNode : e.target;
        var method = target.getAttribute('data-method');
        var param = target.getAttribute('data-param');

        if(methods[method])
            methods[method](param, target, e);
        
    }

    json_rpc_async('getObjects', '\"kind\":\"trunk\"', function(result){
        // var trunks = document.getElementById('searchtrunk');
        // var opt = document.createElement('option');
        // opt.value = PbxObject.frases.ALL;
        // opt.textContent = PbxObject.frases.ALL;
        // trunks.appendChild(opt);
        result.unshift({oid:PbxObject.frases.ALL, name: PbxObject.frases.ALL});
        fill_select_items('searchtrunk', result);
    });
    $('#getcalls-btn').click(function(e){
        getRecParams(e);
    });
    $('#sample-data').hide();
    $('#search-calls .panel-body').slideToggle();
    $('#extendedsearch').click(function(e){
        e.preventDefault();
        var $panel = $(this).closest('.panel'),
            $el = $panel.find('.panel-body');

        if(($el).is(':visible')){
            $(this).text(PbxObject.frases.MORE);
        }
        else{
            $(this).text(PbxObject.frases.LESS);
        }

        $el.slideToggle();
    });

    $('#records-table').click(handleTableClick);

    TableSortable.sortables_init();

    getRecords({
        begin: PbxObject.recPicker.date.start,
        end: PbxObject.recPicker.date.end
    }, showRecords);

    show_content();

}

function build_records_row(data, table){

    if(!data) return;
    var cell,
        textContent = '',
        lrow = table.rows.length,
        row = table.insertRow(lrow),
        time = data['td'],
        h, m, s;

    if(data['id'])
        row.id = data['id'];

    cell = row.insertCell(0);
    // date = day + '/' + month + '/' + date.getFullYear() + ' ' + hours + ':' + minutes;
    cell.textContent = formatDateString(data.ts);

    cell = row.insertCell(1);
    cell.className = 'nowrap';
    cell.textContent = data['na'];

    cell = row.insertCell(2);
    // cell.className = 'nowrap';
    textContent = (data['nc'] && data['nc'] !== data['nb'] ) ? (data['nb'] + ' (' + data['nc'] + ')') : data['nb'];
    cell.textContent = textContent
    cell.title = textContent;

    // cell = row.insertCell(3);
    // cell.textContent = data['nc'] || "";
    // cell.className = 'nowrap';
    // cell.title = data['nc'] || '';

    cell = row.insertCell(3);
    if(data['ta']) {
        textContent = (data['tb'] ) ? data['ta'] + ' (' + data['tb'] + ')' : data['ta'];
    } else {
        textContent = data['tb'];
    }
    cell.textContent = textContent;

    // cell = row.insertCell(4);
    // if(data['tb']) cell.textContent = data['tb'];

    cell = row.insertCell(4);
    cell.textContent = formatTimeString(time, 'hh:mm:ss');

    cell = row.insertCell(5);
    cell.textContent = getFriendlyCodeName(data['cs']);

    cell = row.insertCell(6);
    cell.textContent = parseFloat(data['tr']).toFixed(2);

    cell = row.insertCell(7);
    cell.textContent = parseFloat(data['ch']).toFixed(2);

    cell = row.insertCell(8);
    if(data['fi']){
        var a = document.createElement('a');
        a.href = '#';
        // a.setAttribute('data-src', data['fi']);
        a.setAttribute('data-method', 'playRecord');
        a.setAttribute('data-param', data['fi']);
        a.innerHTML = '<i class="fa fa-play fa-fw"></i>';
        // a.onclick = function(e){
        //     playRecord(e);
        // };
        cell.appendChild(a);
    }
    cell = row.insertCell(9);
    cell.innerHTML = data['fi'] ? '<a href="'+window.location.protocol+'//'+window.location.host+'/records/'+data['fi']+'" download="'+data['fi']+'" target="_blank"><i class="fa fa-fw fa-download"></i></a>' : '';
    // cell.innerHTML = data['fi'] ? '<a href="#" onclick="playRecord(e)" data-src="'+data['fi']+'"><i class="fa fa-play fa-fw"></i></a>' : '';

    cell = row.insertCell(10);
    cell.innerHTML = '<a href="#" data-method="getQos" data-param="'+ data.id +'"><i class="fa fa-fw fa-info"></i></a>';
}

function getRecParams(e){

    show_loading_panel(e.target);
    
    // var from = PbxObject.Picker.date.from,
    //     to = PbxObject.Picker.date.to,
    //     dbegin = new Date(from.year, from.month - 1, from.day, from.hours, from.minutes),
    //     dend = new Date(to.year, to.month - 1, to.day, to.hours, to.minutes),
    // var date = PbxObject.Picker.getDate(),
    var elorder = document.querySelectorAll('.init-order'),
        elmode = document.querySelectorAll('.init-mode'),
        number = document.getElementById('searchnum'),
        trunk = document.getElementById('searchtrunk'),
        order, mode, i;

    for(i=0; i<elorder.length; i++){
        if(elorder[i].checked)
            order = elorder[i].value;
    }
    for(i=0; i<elmode.length; i++){
        if(elmode[i].checked)
            mode = elmode[i].value;
    }
    
    // if(date.begin > date.end){
    //     alert(PbxObject.frases.PICKERROR2);
    //     return;
    // }
    
    // var params = '';
    // params += '"begin": ' + PbxObject.recPicker.date.start;
    // params += ', "end": ' + PbxObject.recPicker.date.end;
    // if(number.value)
    //     params += ', "number": "' + number.value + '"';
    // if(trunk.value !== PbxObject.frases.ALL)
    //     params += ', "trunk": "' + trunk.options[trunk.selectedIndex].textContent + '"';    
    // if(mode)
    //     params += ', "mode": ' + mode;
    // if(order)
    //     params += ', "order": ' + order;

    var params = {
        begin: PbxObject.recPicker.date.start,
        end: PbxObject.recPicker.date.end
    };

    if(number.value) params.number = number.value;
    if(trunk.value !== PbxObject.frases.ALL) 
        params.trunk = trunk.options[trunk.selectedIndex].textContent;
    if(mode) params.mode = parseInt(mode, 10);
    if(order) params.order = parseInt(order, 10);

    getRecords(params, showRecords);

}

function getRecords(params, cb) {
    json_rpc_async('getCalls', params, cb);
}

function showRecords(result){
    // console.log(result);
    show_content();

    var table = document.getElementById('records-table').querySelector('tbody');
    var rows = document.getElementById('searchrows');
    if(!rows.value && result.length > 20) rows.value = 20; //if result is bigger than 20 records then "max rows" is set to 20
    var rlength = rows.value ? parseInt(rows.value) : result.length, //the amount of rows on page is set based of the "max rows" parameter or is equal result.length
        pagnum = result.length > rlength ? Math.ceil(result.length / rlength) : 1; //if the number rows is less "than max rows" then the number of pages is equal 1

    var key, cost = 0;
    for (var i = 0; i < result.length; i++) {
        for(key in result[i]){
            if(key == 'ch'){
                cost += parseFloat(result[i][key]);
            }
        }
    }
    cost = cost.toFixed(2);

    $('#sample-data').show();
    $('#sample-length').text(result.length);
    $('#sample-cost').text(cost);

    PbxObject.Pagination.options = {
        table: table,
        page: 1,
        maxpagins: 5,
        rows: rlength,
        records: result,
        pagnum: pagnum,
        buildTableFunction: build_records_row
    };
    PbxObject.Pagination.createPagination();
    PbxObject.Pagination.selectPage(1);
}

function getQos(recid, targ, e) {
    e.preventDefault();
    console.log('getQos: ', recid, targ);
    if(!recid) return;
    // var targInitHtml = targ.innerHTML;
    var targInitHtml = targ.innerHTML;
    var targMethod = targ.getAttribute('data-method');

    targ.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
    targ.setAttribute('data-method', '');

    getRecords({
        begin: PbxObject.recPicker.date.start,
        end: PbxObject.recPicker.date.end,
        qos: true,
        id: recid
    }, function(result) {
        console.log('getQos result: ', result);
        targ.innerHTML = targInitHtml;
        targ.setAttribute('data-method', 'toggleRecQoS');
        showRecQoS(recid, result);
    });
}

function toggleRecQoS(recid) {
    console.log('toggleRecQoS: ', recid);
    $('#'+recid+'-qos').collapse('toggle');
}

function showRecQoS(recid, data) {

    var row = document.createElement('tr');
    var cell = document.createElement('td');
    var contEl = document.createElement('div');

    contEl.id = recid + '-qos';
    contEl.className = "collapse";
    cell.colSpan = '11';
    cell.style.padding = '0';
    cell.style.borderTop = 'none';
    cell.appendChild(contEl);
    row.appendChild(cell);

    $(row).insertAfter('#'+recid);


    ReactDOM.render(
        RecQosTable({
            frases: PbxObject.frases,
            data: data[0],
            utils: {
                formatTimeString: formatTimeString
            }
        }),
        contEl
    );

    $(contEl).collapse();
}

function playRecord(src, targ, e){
    // if(!e) e = window.event;
    e.preventDefault();
    // var player
        // targ = e.currentTarget,
        // src = targ.getAttribute('data-src');

    PbxObject.Player = PbxObject.Player || new Player();
    var player = PbxObject.Player;
    if(player.lastEl !== null && player.lastEl != targ){
        player.lastEl.innerHTML = '<i class="fa fa-fw fa-play"></i>';
    }
    player.lastEl = targ;
    player.audioFile = src;
    player.audioURL = window.location.protocol+'//'+window.location.host+'/records/'+src;
    player.playAudio();
}