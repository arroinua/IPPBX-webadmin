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

    var elmode = [].slice.call(document.querySelectorAll('.init-mode'));
    elmode.forEach(function(item){
        if(item.value === "0") item.checked = true;
    });
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
    TableSortable.sortables_init();

    getRecords({
        begin: PbxObject.recPicker.date.start,
        end: PbxObject.recPicker.date.end
    });

    show_content();

}

function build_records_row(data, table){

    if(!data) return;
    var cell,
        lrow = table.rows.length,
        row = table.insertRow(lrow),
        // ts = parseInt(data['ts']),
        // date = new Date(ts),
        // day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
        // month = (date.getMonth()+1) < 10 ? '0' + (date.getMonth()+1) : date.getMonth()+1,
        // hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
        // minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
        time = data['td'], h, m, s;

    cell = row.insertCell(0);
    // date = day + '/' + month + '/' + date.getFullYear() + ' ' + hours + ':' + minutes;
    cell.textContent = formatDateString(data.ts);

    cell = row.insertCell(1);
    cell.className = 'nowrap';
    cell.textContent = data['na'];

    cell = row.insertCell(2);
    cell.className = 'nowrap';
    cell.textContent = data['nb'];

    cell = row.insertCell(3);
    cell.textContent = data['nc'] || "";
    cell.className = 'nowrap';
    cell.title = data['nc'] || '';

    cell = row.insertCell(4);
    if(data['ta']) cell.textContent = data['ta'];

    cell = row.insertCell(5);
    if(data['tb']) cell.textContent = data['tb'];

    cell = row.insertCell(6);
    cell.textContent = formatTimeString(time, 'hh:mm:ss');

    cell = row.insertCell(7);
    cell.textContent = getFriendlyCodeName(data['cs']);

    cell = row.insertCell(8);
    cell.textContent = parseFloat(data['tr']).toFixed(2);

    cell = row.insertCell(9);
    cell.textContent = parseFloat(data['ch']).toFixed(2);

    cell = row.insertCell(10);
    if(data['fi']){
        var a = document.createElement('a');
        a.href = '#';
        a.setAttribute('data-src', data['fi']);
        a.innerHTML = '<i class="fa fa-play fa-fw"></i>';
        a.onclick = function(e){
            playRecord(e);
        };
        cell.appendChild(a);
    }
    cell = row.insertCell(11);
    cell.innerHTML = data['fi'] ? '<a href="'+window.location.protocol+'//'+window.location.host+'/records/'+data['fi']+'" download="'+data['fi']+'"><i class="fa fa-fw fa-download"></i></a>' : '';
    // cell.innerHTML = data['fi'] ? '<a href="#" onclick="playRecord(e)" data-src="'+data['fi']+'"><i class="fa fa-play fa-fw"></i></a>' : '';
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
    }
    if(number.value) params.number = number.value;
    if(trunk.value !== PbxObject.frases.ALL) 
        params.trunk = trunk.options[trunk.selectedIndex].textContent;
    if(mode) params.mode = parseInt(mode, 10);
    if(order) params.order = parseInt(order, 10);

    getRecords(params);

}

function getRecords(params) {
    json_rpc_async('getCalls', params, showRecords);
}

function showRecords(result){
    // console.log(result);
    show_content();

    var table = document.getElementById('records-table').querySelector('tbody');
    var rows = document.getElementById('searchrows');
    if(!rows.value && result.length > 20) rows.value = 20; //if result is bigger than 20 records then "max rows" is set to 20
    var rlength = rows.value ? parseInt(rows.value) : result.length, //the amount of rows on page is set based of the "max rows" parameter or is equal result.length
        pagnum = result.length > rlength ? Math.ceil(result.length / rlength) : 1; //if the number rows is less "than max rows" then the number of pages is equal 1

    // pagnum = pagnum > this.maxpagins ? this.maxpagins : pagnum;

    // this.rowsOnPage = rlength;
    // this.records = result;

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

function playRecord(e){
    if(!e) e = window.event;
    e.preventDefault();
    var player,
        targ = e.currentTarget,
        src = targ.getAttribute('data-src');

    PbxObject.Player = PbxObject.Player || new Player();
    player = PbxObject.Player;
    if(player.lastEl !== null && player.lastEl != targ){
        player.lastEl.innerHTML = '<i class="fa fa-fw fa-play"></i>';
    }
    player.lastEl = targ;
    player.audioFile = src;
    player.audioURL = window.location.protocol+'//'+window.location.host+'/records/'+src;
    player.playAudio();
}