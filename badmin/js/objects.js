
window.onerror = function(msg, url, linenumber) {
     console.error('Error message: '+msg+'\nURL: '+url+'\nLine number: '+linenumber);
 };


/*
*
* Statistics UI
*
*/

function load_statistics(){
    new Statistics();
}

function Statistics(){

    var picker,
        trtable = document.getElementById('trunks-statistics-table'),
        exttable = document.getElementById('ext-statistics-table'),
        extStatBtn = document.getElementById('ext-stats-btn'),
        btnGroup = document.getElementById('ext-stat-kind'),
        cont = document.getElementById('dcontainer'),
        inc = [].slice.call(cont.querySelectorAll('.data-model')),
        extStatKind = 'inbound',
        oid = PbxObject.oid,
        start, end, params,
        renewStat = true,
        self = this;

    this._init = function(){
        picker = new Picker('statistics-date-picker', {submitFunction: self.getStatisticsData, buttonSize: 'md'});
        start = new Date(picker.date.start).getTime();
        end = new Date(picker.date.end).getTime();
        params = '\"begin\":'+start+', \"end\":'+end;
            
        json_rpc_async('getCallStatistics', params, self._setStatistics);

        extStatBtn.onclick = function(){
            if(extStatBtn.getAttribute('data-state') !== 'shown'){
                extStatBtn.setAttribute('data-state', 'shown');
                self._getExtStatisticsData();
            } else {
                extStatBtn.setAttribute('data-state', 'hidden');
            }
        };
        btnGroup.onclick = function(e){
            var e = e || window.event;
            var target = e.target;
            if(target.nodeName === 'LABEL'){
                extStatKind = target.children[0].getAttribute('data-kind');
                renewStat = true;
                self._getExtStatisticsData();
            }
        };

        switch_presentation(oid);
        set_page();
    };

    this.getStatisticsData = function(){
        start = new Date(picker.date.start).getTime();
        end = new Date(picker.date.end).getTime();
        params = '\"begin\":'+start+', \"end\":'+end;

        json_rpc_async('getCallStatistics', params, self._setStatistics);

        renewStat = true;
        if(extStatBtn.getAttribute('data-state') == 'shown')
            self._getExtStatisticsData();
        
    };

    this._getExtStatisticsData = function(){
        if(!renewStat) return;
        renewStat = false;

        start = new Date(picker.date.start).getTime();
        end = new Date(picker.date.end).getTime();
        params = '\"begin\":'+start+', \"end\":'+end+', \"kind\":"'+extStatKind+'"';
        console.log(params);
        json_rpc_async('getCallStatisticsExt', params, self._setExtStatistics);
    };

    this._setStatistics = function(data) {
        var attr, value, chartData,
            newdata = data;

        newdata.inbounds.duration = formatTimeString(newdata.inbounds.duration, 'hh:mm:ss');
        newdata.outbounds.duration = formatTimeString(newdata.outbounds.duration, 'hh:mm:ss');
        newdata.internals.duration = formatTimeString(newdata.internals.duration, 'hh:mm:ss');
        if(newdata.outbounds.cost) newdata.outbounds.cost = newdata.outbounds.cost.toFixed(2);

        inc.forEach(function(item){
            attr = item.getAttribute('data-model');
            if(attr == 'inbounds.lost'){
                if(newdata.inbounds.lost === 0) item.classList.remove('negtv-col');
                else item.classList.add('negtv-col');
            }
            var value = attr.split('.').reduce(objFromString, newdata);
            item.textContent = value;
        });

        // chartData = [{
        //     color: "#337ab7",
        //     label: PbxObject.frases.TOTALCALLS,
        //     data: [[4, data.inbounds.total]],
        //     bars: {
        //         show: true,
        //         align: "center",
        //         fill: true,
        //         barWidth: 2,
        //         lineWidth: 1,
        //         fillColor: "#337ab7"
        //         // order: 1
        //     }
        // }, {
        //     color: "#d9534f",
        //     label: PbxObject.frases.LOSTCALLS,
        //     data: [[6, data.inbounds.lost]],
        //     bars: {
        //         show: true,
        //         align: "center",
        //         fill: true,
        //         barWidth: 2,
        //         lineWidth: 1,
        //         fillColor: "#d9534f"
        //         // order: 2
        //     }
        // }];
        // $.plot($("#incalls-chart"), chartData, {
        //     grid: {
        //         borderWidth: 1
        //     },
        //     xaxis: {
        //         show: false,
        //         min: 0,
        //         max: 10
        //     }
        // });
        console.log(newdata.trunks);
        self._build_trunks_statistics(newdata.trunks);
        show_content();
    };

    this._setExtStatistics = function(data) {
        clearColumns(exttable);
        for(var i=0; i<data.length; i++){
            self._buildExtStatColumn(data[i]);
        }
        // build_ext_statistics(data);
    };

    this._build_trunks_statistics = function(data){
        var table = trtable.querySelector('tbody');
        clearTable(table);
        for (var i = 0; i < data.length; i++) {
            row = table.insertRow(i);
            
            cell = row.insertCell(0);
            cell.textContent = data[i].trunk !== undefined ? data[i].trunk : '';

            cell = row.insertCell(1);
            cell.textContent = data[i].in !== undefined ? data[i].in : '';

            cell = row.insertCell(2);
            cell.textContent = data[i].insec !== undefined ? formatTimeString(data[i].insec, 'hh:mm:ss') : '';

            cell = row.insertCell(3);
            cell.textContent = data[i].out !== undefined ? data[i].out : '';

            cell = row.insertCell(4);
            cell.textContent = data[i].outsec !== undefined ? formatTimeString(data[i].outsec, 'hh:mm:ss') : '';

            cell = row.insertCell(5);
            cell.textContent = data[i].cost !== undefined ? data[i].cost.toFixed(2) : '';
        }
    };

    this._buildExtStatColumn = function(data){
        // var table = document.getElementById('ext-statistics-table'),
        var thead = exttable.querySelector('thead'),
            tbody = exttable.querySelector('tbody'),
            newTH, newCell, param;

        for (var h=0; h<thead.rows.length; h++) {
            newTH = document.createElement('th');
            thead.rows[h].appendChild(newTH);
            newTH.innerHTML = data.ext;
        }
        for (var i=0; i<tbody.rows.length; i++) {
            newCell = tbody.rows[i].insertCell(-1);
            switch(i){
                case 0: param='total';break;
                case 1: param='connected';break;
                case 2: param='duration';break;
                case 3: param='cost';break;
            }
            newCell.innerHTML = data[param] !== undefined ? (param === 'duration' ? formatTimeString(data[param], 'hh:mm:ss') : data[param]) : '';
        }
    };

    this._init();
}

/*
*
* Dashboard UI
*
*/

function CallsBoard(){
    var loaded = false,
        inc = document.querySelectorAll('.calls-incoming'),
        out = document.querySelectorAll('.calls-outgoing'),
        conn = document.querySelectorAll('.calls-connected'),
        load = document.querySelectorAll('.calls-load'),
        ttrunks = document.getElementById('calls-trunks').querySelector('tbody'),
        tcalls = document.getElementById('calls-table').querySelector('tbody'),
        lrow = ttrunks.rows.length,
        self = this,
        row, cell, a, picker;

    this.init = function(){
        var start, end;

        picker = new Picker('calls-date-picker', {submitFunction: self.getStatistics, interval: true, buttonSize: 'md'});
        start = new Date(picker.date.start).getTime();
        end = new Date(picker.date.end).getTime();
        interval = picker.interval;
        params = '\"begin\":'+start+', \"end\":'+end+', \"interval\":'+interval;

        json_rpc_async('getCallStatisticsGraph', params, function(result){
            self.createGraph(result);
        });
        this.update = setInterval(this.checkStates.bind(this), 1000);
        addEvent(window, 'hashchange', this.stopUpdate.bind(this));

    };

    this.checkStates = function(){
        sendData('getCurrentCalls', null, 5);
        sendData('getCurrentState', null, 6);
        // json_rpc_async('getCurrentCalls', null, this.setCurrentCalls.bind(this));
        // json_rpc_async('getCurrentState', null, this.setCurrentState.bind(this));

        // console.log('update');
    };

    this.getStatistics = function(){
        var start = new Date(picker.date.start).getTime(),
            end = new Date(picker.date.end).getTime(),
            interval = picker.interval;
        params = '\"begin\":'+start+', \"end\":'+end+', \"interval\":'+interval;
        json_rpc_async('getCallStatisticsGraph', params, function(result){
            self.createGraph(result);
        });
    };

    this.setCurrentState = function(result){

        if(loaded === false){
            loaded = true;
            show_content();
        }

        var i, trunks = result.trunks;

        for (i = 0; i < inc.length; i++) {
            if(inc[i].textContent != result.in) inc[i].textContent = result.in;
        }
        for (i = 0; i < out.length; i++) {
            if(out[i].textContent != result.out) out[i].textContent = result.out;
        }
        for (i = 0; i < conn.length; i++) {
            if(conn[i].textContent != result.conn) conn[i].textContent = result.conn;
        }
        for (i = 0; i < load.length; i++) {
            // load[i].textContent = Math.round(result.load) + '%';
            load[i].textContent = parseFloat(result.load).toFixed(1) + '%';
        }

        for (i = 0; i < trunks.length; i++) {
            
            var className = trunks[i].enabled ? 'success' : 'danger';
            if(ttrunks.rows[i]){
                ttrunks.rows[i].cells[0].className = className;
                if(ttrunks.rows[i].cells[1].firstChild.textContent != trunks[i].name)
                    ttrunks.rows[i].cells[1].firstChild.textContent = trunks[i].name;
                if(ttrunks.rows[i].cells[2].textContent != trunks[i].in)
                    ttrunks.rows[i].cells[2].textContent = trunks[i].in;
                if(ttrunks.rows[i].cells[3].textContent != trunks[i].out)
                    ttrunks.rows[i].cells[3].textContent = trunks[i].out;
                ttrunks.rows[i].cells[4].textContent = parseFloat(trunks[i].load).toFixed(1) + '%';
            } else{
                row = ttrunks.insertRow(i);
                
                cell = row.insertCell(0);
                cell.className = className;

                cell = row.insertCell(1);
                a = document.createElement('a');
                a.href = '#trunk?'+trunks[i].oid;
                a.textContent = trunks[i].name;
                cell.appendChild(a);

                cell = row.insertCell(2);
                cell.textContent = trunks[i].in;

                cell = row.insertCell(3);
                cell.textContent = trunks[i].out;

                cell = row.insertCell(4);
                cell.textContent = parseFloat(trunks[i].load).toFixed(1) + '%';
            }

        }
        
    };

    this.setCurrentCalls = function(result){
        if(!result) return;
        if(tcalls.rows.length > result.length) {
            this.clearTable(tcalls, result.length);
        }

        for (var i = 0; i < result.length; i++) {

            if(tcalls.rows[i]){
                tcalls.rows[i].cells[0].textContent = result[i].caller;
                tcalls.rows[i].cells[1].textContent = result[i].called;
                if(result[i].time)
                    tcalls.rows[i].cells[2].textContent = result[i].time;
            }
            else{
                row = tcalls.insertRow(i);
                
                cell = row.insertCell(0);
                cell.textContent = result[i].caller;

                cell = row.insertCell(1);
                cell.textContent = result[i].called;

                cell = row.insertCell(2);
                cell.textContent = result[i].time;
            }

        }

    };

    this.clearTable = function(table, rows){

        row = rows - 1;
        while(table.rows.length != rows){

            table.deleteRow(row);
            row = row - 1;

        }

    };

    this.stopUpdate = function(){
        // console.log('update removed');
        clearInterval(this.update);
        removeEvent(window, 'hashchange', this.stopUpdate.bind(this));

    };

    this.createGraph = function(data){
        var insData = [], outsData = [], intsData = [], time, item, chartData, chartOpts;
        var timeFormat = (function(intr){
            if(isSmallScreen()){
                return '';
            } else {
                return (intr == 'hour' ? "%H:%M" : (intr == 'day') ? "%d/%m" : "%d/%m");
            }
        })(picker.intervalString);
        for(var i=0, length = data.length; i<length; i++){
            item = data[i];
            time = item.t;
            insData.push([time, item.i]);
            outsData.push([time, item.o]);
            intsData.push([time, item.l]);
        }
        chartData = [{
            label: PbxObject.frases.SETTINGS.INCALLS,
            data: insData
        }, {
            label: PbxObject.frases.SETTINGS.INTCALLS,
            data: intsData
        }, {
            label: PbxObject.frases.SETTINGS.OUTCALLS,
            data: outsData
        }];
        chartOpts = {
            series: {
                bars: {
                    show: true,
                    barWidth: picker.interval/4,
                    lineWidth: 0,
                    order: 1,
                    fillColor: {
                        colors: [{
                            opacity: 1
                        }, {
                            opacity: 0.7
                        }]
                    }
                }
            },
            xaxis: {
                // min: new Date(picker.date.start).getTime(),
                // max: new Date(picker.date.end).getTime(),
                mode: "time",
                timeformat: timeFormat,
                timezone: 'browser',
                tickSize: [1, picker.intervalString],
                // monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                tickLength: 0, // hide gridlines
                // axisLabel: "hours",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
                axisLabelPadding: 15
            },
            yaxes: {
                position: 0,
                tickFormatter: function (val) {
                    return val.toFixed();
                },
                min: 0,
                axisLabel: PbxObject.frases.KINDS.calls,
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
                axisLabelPadding: 5
            },
            grid: {
                hoverable: true,
                borderWidth: 1
            },
            legend: {
                labelBoxBorderColor: "none",
                noColumns: 3,
                position: "ne",
                margin: [0, 10],
                container: $('#calls-graph-labels')
            },
            tooltip: true,
            tooltipOpts: {
                content: '%s: %y.0',
                yDateFormat: timeFormat
            },
            colors: ["#4572A7", "#BADABA", "#AA4643"]
        };
        $.plot($("#calls-graph"), chartData, chartOpts);
        console.log(chartData);

        addEvent(window, 'resize', function(){
            $.plot($("#calls-graph"), chartData, chartOpts);
        });
    };

    this.init();

}

function load_calls(){
    PbxObject.CallsBoard = new CallsBoard();
}

function Picker(pickrElement, defaults){

    var pickr = document.getElementById(pickrElement),
        frases = PbxObject.frases,
        rangeEl,
        button,
        fields,
        options,
        customRange = false,
        self = this;

    this.defaults = {
        defaultOption: 'today',
        interval: false,
        actionButton: true,
        buttonSize: 'sm',
        buttonColor: 'default'
    };
    this.defaults = extend( {}, this.defaults );
    extend( this.defaults, defaults );

    this.date = {};
    this.interval = this.defaults.interval ? 3600*1000 : null;
    this.intervalString = 'hour';
    this.fields = {};

    function extend( a, b ) {
        for( var key in b ) {
            if( b.hasOwnProperty( key ) ) {
                a[key] = b[key];
            }
        }
        return a;
    }

    this._pickerHandler = function(e){
        var target = e.target,
            range, interval;
        if(target.nodeName === 'LABEL'){
            range = target.children[0].getAttribute('data-range');
            if(range){
                self._setCurrentRange(range);
                if(range === 'custom') {
                    customRange = true; //if custom range option is selected
                    rangeEl.classList.remove('hidden');
                } else {
                    customRange = false;
                    rangeEl.classList.add('hidden');
                }
            } else{
                interval = target.children[0].getAttribute('data-interval');
                if(interval){
                    if(interval === 'hour') this.interval = 60*60*1000;
                    else if(interval === 'day') this.interval = 24*60*60*1000;
                    else if(interval === 'month') this.interval = 12*24*60*60*1000;
                    this.intervalString = interval;
                }
            }
        } else if(target.nodeName === 'BUTTON'){
            if(target.name === "submitButton"){
                if(customRange) self._rangeToString(); //if custom range option is selected
                if(self.defaults.submitFunction) self.defaults.submitFunction();
            } else if(target.name === "selectButton"){
                if(customRange) self._rangeToString();
            }
            pickr.classList.toggle('open');
        }
    };
    
    this._init = function(){
        var type, field,
        template = this.template();
        pickr.innerHTML = template;

        dropdown = pickr.querySelector('.dropdown-menu');
        options = [].slice.call(pickr.querySelectorAll('input[name="options"]'));
        fields = [].slice.call(pickr.querySelectorAll('.date-field'));
        button = pickr.querySelector('.dropdown-button');
        btnText = button.querySelector('.btn-text');
        rangeEl = pickr.querySelector('.custom-range');

        fields.forEach(function(item){
            type = item.name;
            field = item.getAttribute('data-field');
            self.fields[type] = self.fields[type] || {};
            self.fields[type][field] = item;
        });

        button.onclick = function(){
            pickr.classList.toggle('open');
        };
        dropdown.onclick = function(e){
            self._pickerHandler(e);
        };

        this._setCurrentRange(this.defaults.defaultOption);
    };

    this._setCurrentRange = function(option){
        if(option === 'today'){
            this.date.start = this.formatDate(new Date());
            this.date.end = new Date().getTime() + 24*60*60*1000;
            this.date.end = this.formatDate(new Date(this.date.end));
        } else if(option === 'yesterday'){
            this.date.end = this.today();
            this.date.start = new Date().getTime() - 24*60*60*1000;
            this.date.start = this.formatDate(new Date(this.date.start));
        } else if(option === 'week'){
            this.date.end = new Date().getTime() + 24*60*60*1000;
            this.date.start = this.date.end - 7*24*60*60*1000;
            this.date.end = this.formatDate(new Date(this.date.end));
            this.date.start = this.formatDate(new Date(this.date.start));
        } else if(option === 'month'){
            var curr_date = new Date();
            var first_day = new Date(curr_date.getFullYear(), curr_date.getMonth()-1, 1);
            var last_day = new Date(curr_date.getFullYear(), curr_date.getMonth(), 0);
            var month_start_date = this.formatDate(first_day);
            var month_end_date = this.formatDate(last_day);
            
            this.date.start = month_start_date;
            this.date.end = month_end_date;
        } else if(option === 'custom'){
            this._setCustomRange();
        }
        this._setButtonText();
    };

    this._rangeToString = function(){
        var startFields = this.fields.start;
        var endFields = this.fields.end;
        var start = new Date(startFields.year.value, startFields.month.value-1, startFields.day.value);
        var end = new Date(endFields.year.value, endFields.month.value-1, endFields.day.value);

        start = this.formatDate(start);
        end = this.formatDate(end);
        this.date.start = start;
        this.date.end = end;

        this._setButtonText();
    };

    this.formatDate = function(date){
        var m = ("0"+ (date.getMonth()+1)).slice(-2); // in javascript month start from 0.
        var d = ("0"+ date.getDate()).slice(-2); // add leading zero 
        var y = date.getFullYear();
        return  m +'/'+d+'/'+y;
    };

    this._setCustomRange = function(date){
        var start = new Date(this.date.start);
        var end = new Date(this.date.end);
        var startFields = this.fields.start;
        var endFields = this.fields.end;

        startFields.day.value = start.getDate();
        startFields.month.value = start.getMonth()+1;
        startFields.year.value = start.getFullYear();

        endFields.day.value = end.getDate();
        endFields.month.value = end.getMonth()+1;
        endFields.year.value = end.getFullYear();
    };

    this._setButtonText = function(){
        btnText.innerHTML = this.date.start + '-' + this.date.end;
    };

    this._closeDropdowns = function(){
        pickr.classList.toggle('open');
        removeEvent(document, 'click', this._closeDropdowns);
    };

    this.today = function(){
        var today = new Date();
        return this.formatDate(today);
    };

    this.template = function(){
        return (
        '<button type="button" class="btn btn-'+this.defaults.buttonColor+' btn-'+this.defaults.buttonSize+' btn-block dropdown-button" aria-expanded="true">'+
            '<span class="btn-text" style="margin-right:5px"></span>'+
            '<span class="caret"></span>'+
        '</button>'+
        '<div class="dropdown-menu">'+
            '<div class="col-xs-12 btn-group btn-group-vertical" data-toggle="buttons">'+
                '<label class="btn btn-default active">'+
                    '<input type="radio" name="options" data-range="today"autocomplete="on" checked>'+frases.DATE_PICKER.TODAY+''+
                '</label>'+
                '<label class="btn btn-default">'+
                    '<input type="radio" name="options" data-range="yesterday" autocomplete="off" checked>'+frases.DATE_PICKER.YESTERDAY+''+
                '</label>'+
                '<label class="btn btn-default">'+
                    '<input type="radio" name="options" data-range="week" autocomplete="off">'+frases.DATE_PICKER.LAST_7_DAYS+''+
                '</label>'+
                '<label class="btn btn-default">'+
                    '<input type="radio" name="options" data-range="month" autocomplete="off">'+frases.DATE_PICKER.LAST_MONTH+''+
                '</label>'+
                '<label class="btn btn-default">'+
                    '<input type="radio" name="options" data-range="custom" autocomplete="off">'+frases.DATE_PICKER.CUSTOM_RANGE+''+
                '</label>'+
            '</div>'+
            '<div class="col-xs-12 custom-range hidden">'+
                '<br>'+
                '<div class="form-group">'+
                    '<div class="col-xs-4">'+
                        '<input type="number" min="1" max="31" name="start" class="form-control date-field" data-field="day"></input>'+
                    '</div>'+
                    '<div class="col-xs-4">'+
                        '<input type="number" min="1" max="12" name="start" class="form-control date-field" data-field="month"></input>'+
                    '</div>'+
                    '<div class="col-xs-4">'+
                        '<input type="number" min="2000" name="start" class="form-control date-field" data-field="year"></input>'+
                    '</div>'+
                '</div>'+
                '<br><br>'+
                '<div class="form-group">'+
                    '<div class="col-xs-4">'+
                        '<input type="number" min="1" max="31" name="end" class="form-control date-field" data-field="day"></input>'+
                    '</div>'+
                    '<div class="col-xs-4">'+
                        '<input type="number" min="1" max="12" name="end" class="form-control date-field" data-field="month"></input>'+
                    '</div>'+
                    '<div class="col-xs-4">'+
                        '<input type="number" min="2000" name="end" class="form-control date-field" data-field="year"></input>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            (this.defaults.interval ? '<div class="col-xs-12 custom-interval">'+
                '<hr>'+
                    '<p>'+frases.DATE_PICKER.INTERVAL+'</p>'+
                '<div class="btn-group btn-group-justified" data-toggle="buttons">'+
                    '<label class="btn btn-default active">'+
                        '<input type="radio" name="options" data-interval="hour" autocomplete="off" checked>'+frases.HOUR+
                    '</label>'+
                    '<label class="btn btn-default">'+
                        '<input type="radio" name="options" data-interval="day" autocomplete="off">'+frases.DAY+
                    '</label>'+
                    '<label class="btn btn-default">'+
                        '<input type="radio" name="options" data-interval="month" autocomplete="off">'+frases.MONTH+
                    '</label>'+
                '</div>'+
            '</div>' : '')+
            '<div class="col-xs-12">'+
            '<hr>'+
            (this.defaults.actionButton ?
                '<button type="button" name="submitButton" class="btn btn-primary btn-md btn-block">'+frases.SEARCH+'</button>' :
                '<button type="button" name="selectButton" class="btn btn-primary btn-md btn-block">'+frases.SELECT+'</button>')+
            '</div>'+
        '</div>'
        );
    };

    this._init();

 }

function Pagination(options){

    // this.records = {};
    // this.pagins = null;

    this.options = options;

    // pagnum = pagnum > this.maxpagins ? this.maxpagins : pagnum;


    this.createPagination = function(start, end){

        if(this.pagin) {
            clearTable(this.options.table);
            // this._destroyPagination();
        }
        this.currentRange = []; //the currentRange array is needed to trach the current range of pages in pagination element
        if(this.options.pagnum <= 1) return; //if the number of pages is more than 1, then create Pagination            

        var ul, li, a;
        var start = start || this.options.page;
        var end = end || (this.options.pagnum > this.options.maxpagins ? this.options.maxpagins : this.options.pagnum);
        var container = document.querySelector('.pagination-container');
        var pagin = document.createElement('ul');
        var info = document.createElement('p');

        pagin.className = 'pagination custom-pagination';
        li = document.createElement('li');
        li.innerHTML = '<a href="#" class="first">&laquo;</a>';
        pagin.appendChild(li);
        li = document.createElement('li');
        li.innerHTML = '<a href="#" class="prev">-</a>';
        pagin.appendChild(li);
        for (var i = start; i <= end; i++) {

            li = document.createElement('li');
            li.innerHTML = '<a href="#" data-page="'+i+'">'+i+'</a>';
            pagin.appendChild(li);

            if(i==end) this.lastPage = li;
            this.currentRange.push(i);

        }
        li = document.createElement('li');
        li.innerHTML = '<a href="#" class="next">+</a>';
        pagin.appendChild(li);
        li = document.createElement('li');
        li.innerHTML = '<a href="#" class="last">&raquo;</a>';
        pagin.appendChild(li);

        this.pagin = pagin;
        this.paginInfo = info;
        while(container.hasChildNodes()) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(pagin);
        container.appendChild(info);

        pagin.onclick = this._getSelectedPage.bind(this);
        // this.selectPage(this.options.page);
    };

    this._getSelectedPage = function(e){
        e.preventDefault();
        var target = e.target;
        var page = this._isPagin(target); //if element has data-page attribute
        if(!page) {
            if(target.className == 'next') {
                page = this.currentPage+1;
            } else if(target.className == 'prev') {
                page = this.currentPage-1;
            } else if(target.className == 'first') {
                page = 1;
                if(this.options.pagnum >= this.options.maxpagins) {
                    // this._destroyPagination();
                    this.createPagination(1, this.options.maxpagins);
                }
            } else if(target.className == 'last') {
                page = this.options.pagnum;
                if(page >= this.options.maxpagins) {
                    // console.log(page-this.options.maxpagins+1, page);
                    // this._destroyPagination();
                    this.createPagination(page-this.options.maxpagins+1, page);
                }
            }
        }
        if(page > this.options.pagnum || page < 1) return;
        this.selectPage(page);
    };

    this.selectPage = function(page){
        var page = parseInt(page);
        var ind = parseInt(page) * parseInt(this.options.rows) - parseInt(this.options.rows); //starting row, based on the page number
        var len = page * parseInt(this.options.rows); //index of the last row on the page, based on the page number
        len = len < this.options.records.length ? len : this.options.records.length; //if index of the last row is more than total length of result, then index is equal to result.length

        this.currentPage = page;
        clearTable(this.options.table);

        for (var i = ind; i < len; i++) {
            build_records_row(this.options.records[i], this.options.table);
        }

        if(this.currentRange.length) { //if number of pages is greater than 1
            if(this.currentRange.indexOf(page) == this.currentRange.length-1 || this.currentRange.indexOf(page) == this.currentRange.length-2) {
                this._appendPage();
            } else if(this.currentRange.indexOf(page) == 0 || this.currentRange.indexOf(page) == 1) {
                this._prependPage();
            }
            var currentLi = this.pagin.querySelector('li.active');
            if(currentLi) currentLi.classList.remove('active');
            this.pagin.querySelector('a[data-page="'+page+'"]').parentNode.classList.add('active');
        }

        if(this.paginInfo) 
            this.paginInfo.innerHTML = PbxObject.frases.FROM.toLowerCase() + ' ' +
                                    ind + ' ' +
                                    PbxObject.frases.TO.toLowerCase() + ' ' +
                                    len + ' ' +
                                    PbxObject.frases.RECORDS.REC.toLowerCase();
    };

    this._appendPage = function(){
        var nextpage = this.currentRange[this.currentRange.length-1]+1;
        if(nextpage > this.options.pagnum) return;
        var lastPageElement = this.pagin.querySelector('a[data-page="'+this.currentRange[this.currentRange.length-1]+'"]').parentNode;
        var firstPageElement = this.pagin.querySelector('a[data-page="'+this.currentRange[0]+'"]').parentNode;
        var li = document.createElement('li');
        li.innerHTML = '<a href="#" data-page="'+nextpage+'">'+nextpage+'</a>';
        this.pagin.insertBefore(li, lastPageElement.nextSibling);
        this.pagin.removeChild(firstPageElement);

        this.currentRange.push(nextpage);
        this.currentRange.shift();
    };

    this._prependPage = function() {
        var prevpage = this.currentRange[0]-1;
        if(prevpage < 1) return;
        var lastPageElement = this.pagin.querySelector('a[data-page="'+this.currentRange[this.currentRange.length-1]+'"]').parentNode;
        var firstPageElement = this.pagin.querySelector('a[data-page="'+this.currentRange[0]+'"]').parentNode;
        var li = document.createElement('li');
        li.innerHTML = '<a href="#" data-page="'+prevpage+'">'+prevpage+'</a>';
        this.pagin.insertBefore(li, firstPageElement);
        this.pagin.removeChild(lastPageElement);

        this.currentRange.unshift(prevpage);
        this.currentRange.pop();
    };

    this._destroyPagination = function(){
        while (this.pagin && this.pagin.hasChildNodes()) {
            this.pagin.removeChild(this.pagin.firstChild);
        }
    };

    this._isPagin = function(element){
        return element.getAttribute('data-page');
    };
}

function load_records(){
    //     start = new Date(picker.date.start).getTime(),
    //     end = new Date(picker.date.end).getTime(),
    //     interval = picker.interval,
    //     params = '\"begin\":'+start+', \"end\":'+end;

    // json_rpc_async('getCallStatisticsGraph', params, function(result){
    //     self.createGraph(result);
    // });

    PbxObject.Pagination = new Pagination();
    PbxObject.recPicker = new Picker('recs-date-picker', {submitFunction: getRecords, actionButton: false, buttonSize: 'md'}),

    $('#getcalls-btn').click(function(e){
        getRecords(e);
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
    show_content();

}

function build_records_row(data, table){

    if(!data) return;
    var cell,
        lrow = table.rows.length,
        row = table.insertRow(lrow),
        ts = parseInt(data['ts']),
        date = new Date(ts),
        day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
        month = (date.getMonth()+1) < 10 ? '0' + (date.getMonth()+1) : date.getMonth()+1,
        hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours(),
        minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
        time = data['td'], h, m, s;

    cell = row.insertCell(0);
    date = day + '/' + month + '/' + date.getFullYear() + ' ' + hours + ':' + minutes;
    cell.textContent = date;

    cell = row.insertCell(1);
    cell.textContent = data['na'];

    cell = row.insertCell(2);
    cell.textContent = data['nb'];

    cell = row.insertCell(3);
    cell.textContent = data['nc'];

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
    cell.innerHTML = data['fi'] ? '<a href="'+window.location.protocol+'//'+window.location.host+'/records/'+data['fi']+'"><i class="fa fa-fw fa-download"></i></a>' : '';
    // cell.innerHTML = data['fi'] ? '<a href="#" onclick="playRecord(e)" data-src="'+data['fi']+'"><i class="fa fa-play fa-fw"></i></a>' : '';
}

function getFriendlyCodeName(code){

    var name = '';
    switch(code){
        case '1':
            name = PbxObject.frases.CODES.one;
            break;
        case '3':
            name = PbxObject.frases.CODES.three;
            break;
        case '16':
            name = PbxObject.frases.CODES.sixteen;
            break;
        case '17':
            name = PbxObject.frases.CODES.seventeen;
            break;
        case '18':
            name = PbxObject.frases.CODES.eighteen;
            break;
        case '19':
            name = PbxObject.frases.CODES.nineteen;
            break;
        case '21':
            name = PbxObject.frases.CODES.twentyone;
            break;
        case '22':
            name = PbxObject.frases.CODES.twentytwo;
            break;
        case '28':
            name = PbxObject.frases.CODES.twentyeight;
            break;
        default:
            name = code;
    }
    return name;

}

function getRecords(e){

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
    var params = '';
    params += '"begin": ' + new Date(PbxObject.recPicker.date.start).getTime();
    params += ', "end": ' + new Date(PbxObject.recPicker.date.end).getTime();
    if(number.value)
        params += ', "number": "' + number.value + '"';
    if(trunk.value)
        params += ', "trunk": "' + trunk.value + '"';
    // if(rows.value)
    //     params += ', "limit": ' + parseInt(rows.value);
    if(mode)
        params += ', "mode": ' + mode;
    if(order)
        params += ', "order": ' + order;

    // params = JSON.stringify(params);
    // console.log(params);

    json_rpc_async('getCalls', params, showRecords);

}

function showRecords(result){
    console.log(result);
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
    player.audioURL = window.location.protocol+'//'+window.location.host+'/records/'+src;
    player.playAudio();
}

function Player(){
    var player,
        seek,
        time,
        play,
        dur,
        link,
        oAudio,
        shown = false,
        currentFile = "",
    //display and update progress bar

    init = function(){
        console.log('init');
        var temp = template();
        player = document.createElement('div');
        player.id = 'rec-player';
        player.className = 'pl-cont';
        player.innerHTML = temp;
        document.querySelector('body').appendChild(player);

        seek = document.getElementById('pl-seek');
        time = document.getElementById('pl-time');
        play = document.getElementById('pl-play');
        dur = document.getElementById('pl-duration');
        link = document.getElementById('pl-download');
        oAudio = document.getElementById('audio-rec');

        initEvents();
    },
    //added events
    initEvents = function(){
        addEvent(player, 'click', function(e){
            clickHandler(e);
        });
        //set up event to toggle play button to pause when playing
        addEvent(oAudio, "playing", function() {
            play.innerHTML = '<i class="fa fa-fw fa-pause"></i>';
            global.lastEl.innerHTML = '<i class="fa fa-fw fa-pause"></i>';
        }, true);

        addEvent(oAudio, 'loadedmetadata', function() {
            dur.textContent = formatTimeString(parseInt(oAudio.duration), 'hh:mm:ss');
        });

        // //set up event to toggle play button to play when paused
        addEvent(oAudio, "pause", function() {
            play.innerHTML = '<i class="fa fa-fw fa-play"></i>';
            global.lastEl.innerHTML = '<i class="fa fa-fw fa-play"></i>';
        }, true);
        //set up event to update the progress bar
        addEvent(oAudio, "timeupdate", progressBar, true);
        //set up mouse click to control position of audio
        addEvent(seek, "click", function(e) {
            if (!e) e = window.event;
            oAudio.currentTime = (oAudio.duration * ((e.offsetX || e.layerX) / seek.clientWidth)).toFixed(2);
            console.log('currentTime: '+oAudio.currentTime);
        }, true);
    },

    progressBar = function() {
        var percent = Math.floor((100 / oAudio.duration) * oAudio.currentTime);
        time.textContent = formatTimeString(parseInt(oAudio.currentTime), 'hh:mm:ss');
        seek.value = percent;
    },

    clickHandler = function(e){
        if(!e) e = window.event;
        var targ = e.target;
        if(targ.nodeName == 'I') targ = targ.parentNode;
        console.log(targ);
        if(targ.id == 'pl-play') global.playAudio();
        if(targ.id == 'pl-stop') global.stopAudio();
        if(targ.id == 'pl-close') close();
    },

    show = function(){
        player.classList.add('shown');
        shown = true;
    },

    close = function(){
        player.classList.remove('shown');
        shown = false;
    },

    template = function(){
        return (
            '<audio id="audio-rec" type="audio/x-wav; codecs=\'1\'"></audio>'+
            '<div class="pl-controls">'+
                '<a href="#" class="pl-control bg-success pull-left" id="pl-download"><i class="fa fa-download"></i></a>'+
                '<button class="pl-control bg-primary pull-left" id="pl-play"><i class="fa fa-fw fa-play"></i></button>'+
                '<div class="pl-time"><span id="pl-time"></span>/<span id="pl-duration"></span></div>'+
                '<progress id="pl-seek" max="100" value="0" class-"pl-seek-bar"></progress>'+
                '<button class="pl-control bg-danger pull-right" id="pl-close"><i class="fa fa-fw fa-close"></i></button>'+
                '<button class="pl-control bg-primary pull-right" id="pl-stop"><i class="fa fa-fw fa-stop"></i></button>'+
            '</div>'
        );
    },

    global = {
        audioURL: '',
        audio: oAudio,
        lastEl: null,
        playAudio: function() {
            if(shown === false)
                show();
            //Skip loading if current file hasn't changed.
            if (this.audioURL !== currentFile) {
                oAudio.src = this.audioURL;
                link.href = this.audioURL;
                currentFile = this.audioURL;
            }

            //Tests the paused attribute and set state. 
            if (oAudio.paused) {
                oAudio.play();
            } else {
                oAudio.pause();
            }
        },
        stopAudio: function() {
            oAudio.pause();
            oAudio.currentTime = 0;
        }
    };

    init();
    return global;
}

/* 
 * Setting ui for PBX group
 */

function load_bgroup(result){
    console.log(result);
    switch_presentation(result.kind);
    // switch_tab(result.kind);
    var i, cl;
    var d = document;
    var kind = result.kind;
    var members = result.members;
    var cont = d.getElementById('dcontainer');
    var options = d.getElementById('options');
    var enabled = document.getElementById('enabled');
    var users = result.available.concat(result.members).sort();

    PbxObject.oid = result.oid;
    PbxObject.name = result.name;

    if(result.name) {
        d.getElementById('objname').value = result.name;
    }
    
    if(enabled) {
        enabled.checked = result.enabled;
        if(result.name) {
            addEvent(enabled, 'change', function(){
                console.log(result.oid+' '+this.checked);
                json_rpc_async('setObjectState', '\"oid\":\"'+result.oid+'\", \"enabled\":'+this.checked+'', null);
            });
        }
    }
    if(kind == 'users') {
        var table = document.getElementById('group-extensions').querySelector('tbody');
        var types = [].slice.call(cont.querySelectorAll('input[name="userType"]'));
        var available = document.getElementById('available-users');
        var form = document.getElementById('new-user-form');
        // var formclone = form.cloneNode(true);
        var clear = document.getElementById('clear-input');
        var add = document.getElementById('add-user');
        var type;
        types.forEach(function(item){
            if(item.value == 'local') {
                item.checked = true;
                type = item.value;
            }
            addEvent(item, 'change', function(){
                changeGroupType(item.value);
                type = item.value;
            });
        });
        if(result.available && result.available.length) { //if users available for this group to add
            result.available.sort().forEach(function(item){
                var option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                available.appendChild(option);
            });
        } else {
            add.setAttribute('disabled', 'disabled'); // disable "add user" button
        }
        
        addEvent(add, 'click', function(){
            addUser(type);
            // cleanForm();
        });
        addEvent(clear, 'click', function(){
            cleanForm();
        });

        var num;
        sortByKey(members, 'number');
        members.forEach(function(item){
            table.appendChild(addMembersRow(item));
        });
        
        PbxObject.members = members || [];

        changeGroupType(type);

    } else {
        add_search_handler();
        $('.selectable-cont').click(function(e){
            if(e.target.getAttribute('data-value')) {
                move_list_item(e);
            } else if(e.target.classList.contains('assign-all')) {
                move_list('members', 'available');
            } else if(e.target.classList.contains('unassign-all')) {
                move_list('available', 'members');
            }
        });
        if(result.available) fill_list_items('available', result.available);
        if(members) fill_list_items('members', members.sort());
    }

    if(result.options){
        if(kind == 'equipment'){
            var devselect = document.getElementById('devtype');
            var eqtype = result.options.kind || 'ipphones';
            devselect.value = eqtype;
            switch_options_tab('tab-'+eqtype);
            devselect.onchange = function(){
                switch_options_tab('tab-'+this.options[this.selectedIndex].value);
            }
            if(result.options.kind == 'gateway'){
                d.getElementById('regname').value = result.options.regname || '';
                d.getElementById('regpass').value = result.options.regpass || '';
            }
            else if(result.options.kind == 'trunk'){
                d.getElementById('username').value = result.options.regname || '';
                d.getElementById('password').value = result.options.regpass || '';
                d.getElementById('address').value = result.options.address || '';
            }
            d.getElementById('phonelines').value = result.options.phonelines || '1';
            if(result.options.starflash != undefined){
                d.getElementById('starflash').checked = result.options.starflash;
            }
        } else if(kind == 'unit'){
            d.getElementById("groupno1").value = result.options.groupno || '';
            d.getElementById("timeout1").value = result.options.timeout || '';
            if(result.options.huntmode)
                d.getElementById("huntmode1").selectedIndex = result.options.huntmode;
            if(result.options.huntfwd)
                d.getElementById("huntfwd1").checked = result.options.huntfwd;
        } else if(kind == 'hunting'){
            if(result.options.timeout)
                d.getElementById("timeout2").value = result.options.timeout;
            if(result.options.huntmode)
                d.getElementById("huntmode2").selectedIndex = result.options.huntmode;
            if(result.options.huntfwd)
                d.getElementById("huntfwd2").checked = result.options.huntfwd;
        } else if(kind == 'pickup'){
            d.getElementById("groupno2").value = result.options.groupno || '';
        } else if(kind == 'icd'){
            d.getElementById("groupno").value = result.options.groupno || '';
            d.getElementById("maxlines").value = result.options.maxlines || '';
            d.getElementById("priority").value = result.options.priority || '';
            d.getElementById("canpickup").checked = result.options.canpickup;
            d.getElementById("autologin").checked = result.options.autologin;
            d.getElementById("method").selectedIndex = result.options.method;
            d.getElementById("natimeout").value = result.options.natimeout || '';
            d.getElementById("resumetime").value = result.options.resumetime || '';
            d.getElementById("queuelen").value = result.options.queuelen || '';
            d.getElementById("maxqwait").value = result.options.maxqwait || '';
            d.getElementById("overflowredirect").value = result.options.overflowredirect || '';
            d.getElementById("overtimeredirect").value = result.options.overtimeredirect || '';
            d.getElementById("indicationmode").value = result.options.indicationmode || '';
            d.getElementById("indicationtime").value = result.options.indicationtime || '';
            
            //customizing upload element
            customize_upload('greeting', result.options.greeting);
        } else if(kind == 'conference' || kind == 'channel' || kind == 'selector'){

            var formats = [ "OFF", "320x240", "352x288", "640x360", "640x480", "704x576", "1024x768", "1280x720", "1920x1080" ];
            var initmode = document.getElementById('initmode');
            if(initmode) {
                initmode.onchange = function(){
                    if(initmode.options[initmode.selectedIndex].value == 2) {
                        document.getElementById('conf-greetfile').style.display = 'block';
                    } else {
                        document.getElementById('conf-greetfile').style.display = 'none'    ;
                    }
                }
            }
            PbxObject.videomax = result.options.maxvideomode;
            //customizing upload element
            customize_upload('onhold2', null);
            customize_upload('greeting2', null);
            
            if(kind == 'channel') {
                var type, types = [].slice.call(cont.querySelectorAll('input[name="objectType"]')),
                    external = document.getElementById('out-number');
                    video = document.getElementById('video');
                types.forEach(function(item){
                    if(result.external) {
                        if(item.value == 'global') {
                            item.checked = true;
                            type = item.value;
                        }
                        external.value = result.external;
                    } else {
                        if(item.value == 'local') {
                            item.checked = true;
                            type = item.value;
                        }
                    }
                    addEvent(item, 'change', function(){
                        changeGroupType(item.value);
                    });
                });

                if(video) {
                    if(result.options.videomode !== "OFF")
                        video.checked = true;
                    else
                        video.checked = false;
                }

                if(initmode) initmode.value = result.options.initmode;

                changeGroupType(type);
            } else if(kind == 'selector') {
                var owner = result.owner;
                var elowner = document.getElementById('owner');
                if(initmode) initmode.value = result.options.initmode;
                if(result.options.initmode == 2) {
                    document.getElementById('conf-greetfile').style.display = 'block';
                } else {
                    document.getElementById('conf-greetfile').style.display = 'none'    ;
                }

                initcalls.checked = result.options.initcalls;

                users.forEach(function(item){
                    if(owner && item == owner) {
                        elowner.innerHTML += '<option value="'+item+'" selected>'+item+'</option>';
                    } else {
                        elowner.innerHTML += '<option value="'+item+'">'+item+'</option>';
                    }
                    
                });
            }

            d.getElementById("dialuptt").value = result.options.dialtimeout || '';
            d.getElementById("autoredial").checked = result.options.autoredial;
            if(kind !== 'channel') d.getElementById("confrecord").checked = result.options.recording;
            var greet = d.getElementById("playgreet");
            greet.checked = result.options.greeting;
            if(greet.checked) 
                greet.checked = result.options.greetingfile ? true : false;
                
            // var modes = cont.querySelectorAll('.init-mode');
            // if(modes.length) {
            //     for(i=0;i<modes.length;i++){
            //         if(result.options.initmode == modes[i].value){
            //             modes[i].checked = true;
            //         }
            //     }
            // }
            var select = d.getElementById("videoform");
            if(select) {
                for(i=0;i<formats.length;i++){
                    var op = d.createElement('option');
                    op.value = formats[i];
                    op.innerHTML = formats[i];
                    select.appendChild(op);
                    if(formats[i] == result.options.videomode) {
                        select.selectedIndex = i;
                    }
                    if(formats[i] == result.options.maxvideomode) {
                        break;
                    }
                }
            }
        }
    }

    if(result.profile != undefined){
        d.getElementById('hold').checked = result.profile.hold;
        d.getElementById('forwarding').checked = result.profile.forwarding;
        d.getElementById('callpickup').checked = result.profile.callpickup;
        d.getElementById('dndover').checked = result.profile.dndover;
        d.getElementById('busyover').checked = result.profile.busyover;
        d.getElementById('monitor').checked = result.profile.monitor;
        d.getElementById('dnd').checked = result.profile.dnd;
        d.getElementById('clir').checked = result.profile.clir;
        d.getElementById('pickupdeny').checked = result.profile.pickupdeny;
        d.getElementById('busyoverdeny').checked = result.profile.busyoverdeny;
        d.getElementById('monitordeny').checked = result.profile.monitordeny;
        d.getElementById('callwaiting').checked = result.profile.callwaiting;
        d.getElementById('outcallbarring').checked = result.profile.outcallbarring;
        d.getElementById('costroutebarring').checked = result.profile.costroutebarring;
        d.getElementById('hold').checked = result.profile.hold;

        var transforms = result.profile.bnumbertransforms;
        if(transforms.length != 0){
            for(i=0; i<transforms.length; i++){
                append_transform(null, 'transforms', transforms[i]);
            }
        }
        else {
            append_transform(null, 'transforms');
        }

    }

    show_content();
    set_page();
}

function set_bgroup(param, callback){
    var jprms;
    var handler;
    var d = document;
    var oid = PbxObject.oid;
    var kind = PbxObject.kind;
    var members = d.getElementById('members');
    var profile = d.getElementById('profile');
    var greet = d.getElementById("playgreet");
    var name = d.getElementById('objname').value;
    var type, types = [].slice.call(document.querySelectorAll('input[name="objectType"]'));

    if(name)
        jprms = '"name":"'+name+'",';
    else{
        alert(PbxObject.frases.MISSEDNAMEFIELD);
        return;
    }
    
    show_loading_panel();
    
    if(PbxObject.name) {
        handler = set_object_success;
    }
    else{
        PbxObject.name = name;
        // handler = set_new_object;
        handler = null;
    }

    if(oid) jprms += '"oid":"'+oid+'",';
    if(kind) jprms += '"kind":"'+kind+'",';

    jprms += '\"enabled\":'+document.getElementById('enabled').checked+',';

    if(kind != 'users'){
        jprms += '"members":[';
        for(var i=0; i<members.children.length; i++){
            jprms += '"'+members.children[i].innerHTML+'",';
        }
        jprms += '],';
    }
    if(kind == 'users') {
        jprms += '"members":[';
        for(var i=0; i<PbxObject.members.length; i++) {
            jprms += '"' + PbxObject.members[i].number + '",';
        }
        jprms += '],';
    }
    if(kind == 'channel') {
        types.forEach(function(item){
            if(item.checked) {
                type = item.value;
            }
        });
        if(type == 'global') {
            greet.checked = false;
            var outnum = document.getElementById('out-number');
            jprms += '"external":"'+outnum.value+'",';
        } else if(type == 'local') {

        }
    } else if(kind == 'selector') {
        var owner = document.getElementById('owner').options[document.getElementById('owner').selectedIndex].value;
        jprms += '"owner":"'+owner+'",';
    } else if(kind == 'users' || kind == 'unit' || kind == 'equipment') {
        if(profile){
            jprms += '"profile":{';
            if(d.getElementById("hold") != null){
                jprms += '"hold":'+d.getElementById("hold").checked+",";
            }
            if(d.getElementById("forwarding") != null){
                jprms += '"forwarding":'+d.getElementById("forwarding").checked+",";
            }
            if(d.getElementById("callpickup") != null){
                jprms += '"callpickup":'+d.getElementById("callpickup").checked+",";
            }
            if(d.getElementById("dndover") != null){
                jprms += '"dndover":'+d.getElementById("dndover").checked+",";
            }
            if(d.getElementById("busyover") != null){
                jprms += '"busyover":'+d.getElementById("busyover").checked+",";
            }
            if(d.getElementById("monitor") != null){
                jprms += '"monitor":'+d.getElementById("monitor").checked+",";
            }
            if(d.getElementById("dnd") != null){
                jprms += '"dnd":'+d.getElementById("dnd").checked+",";
            }
            if(d.getElementById("clir") != null){
                jprms += '"clir":'+d.getElementById("clir").checked+",";
            }
            if(d.getElementById("callwaiting") != null){
                jprms += '"callwaiting":'+d.getElementById("callwaiting").checked+",";
            }
            if(d.getElementById("pickupdeny") != null){
                jprms += '"pickupdeny":'+d.getElementById("pickupdeny").checked+",";
            }
            if(d.getElementById("monitordeny") != null){
                jprms += '"monitordeny":'+d.getElementById("monitordeny").checked+",";
            }
            if(d.getElementById("busyoverdeny") != null){
                jprms += '"busyoverdeny":'+d.getElementById("busyoverdeny").checked+",";
            }
            if(d.getElementById("recording") != null){
                jprms += '"recording":'+d.getElementById("recording").checked+",";
            }
            if(d.getElementById("voicemail") != null){
                jprms += '"voicemail":'+d.getElementById("voicemail").checked+",";
            }
            if(d.getElementById("outcallbarring") != null){
                jprms += '"outcallbarring":'+d.getElementById("outcallbarring").checked+",";
            }
            if(d.getElementById("costroutebarring") != null){
                jprms += '"costroutebarring":'+d.getElementById("costroutebarring").checked+",";
            }

            var table = d.getElementById('transforms').getElementsByTagName('tbody')[0];
            if(table){          
                jprms += '"bnumbertransforms":[';
                jprms += encode_transforms('transforms');
                jprms += ']';
            }

            jprms += '},';
        }
    }

    jprms += '"options":{';
    if(kind == 'equipment'){
        var devselect = document.getElementById('devtype');
        var devtype = devselect.options[devselect.selectedIndex].value;
        if(devtype == "ipphones"){
            jprms += '"kind":"ipphones",';
        } else if(devtype == "gateway"){
            jprms += '"kind":"gateway",';
            jprms += '"regname":"'+d.getElementById("regname").value+'",';
            jprms += '"regpass":"'+d.getElementById("regpass").value+'",';
        } else if(devtype == "trunk"){
            jprms += '"kind":"trunk",';
            jprms += '"address":"'+d.getElementById("address").value+'",';
            jprms += '"regname":"'+d.getElementById("username").value+'",';
            jprms += '"regpass":"'+d.getElementById("password").value+'",';
        }
        if(d.getElementById("phonelines") != null){
            jprms += '"phonelines":'+d.getElementById("phonelines").value+',';
        }
        if(d.getElementById("starflash") != null){
            jprms += '"starflash":'+d.getElementById("starflash").checked+',';
        }
    } else if(kind == 'unit'){
        jprms += '"groupno":"'+d.getElementById("groupno1").value+'",';
        jprms += '"timeout":'+d.getElementById("timeout1").value+',';
        jprms += '"huntmode":'+d.getElementById("huntmode1").value+',';
        jprms += '"huntfwd":'+d.getElementById("huntfwd1").checked+',';
    } else if(kind == 'hunting'){
        jprms += '"timeout":'+d.getElementById("timeout2").value+',';
        jprms += '"huntmode":'+d.getElementById("huntmode2").value+',';
        jprms += '"huntfwd":'+d.getElementById("huntfwd2").checked+',';
    } else if(kind == 'pickup'){
        jprms += '"groupno":"'+d.getElementById("groupno2").value+'",';
    } else if(kind == 'icd'){
        jprms += '"groupno":"'+d.getElementById("groupno").value+'",';
        jprms += '"maxlines":'+d.getElementById("maxlines").value+',';
        jprms += '"priority":'+d.getElementById("priority").value+',';
        jprms += '"canpickup":'+d.getElementById("canpickup").checked+',';
        jprms += '"autologin":'+d.getElementById("autologin").checked+',';
        jprms += '"method":'+d.getElementById("method").value+',';
        jprms += '"natimeout":'+d.getElementById("natimeout").value+',';
        jprms += '"resumetime":'+d.getElementById("resumetime").value+',';
        jprms += '"queuelen":'+d.getElementById("queuelen").value+',';
        jprms += '"overflowredirect":"'+d.getElementById("overflowredirect").value+'",';
        jprms += '"maxqwait":'+d.getElementById("maxqwait").value+',';
        jprms += '"overtimeredirect":"'+d.getElementById("overtimeredirect").value+'",';
        jprms += '"indicationmode":'+d.getElementById("indicationmode").value+',';
        jprms += '"indicationtime":'+d.getElementById("indicationtime").value+',';
        var file = document.getElementById("greeting");
        if(file.value){
            jprms += '"greeting":"'+file.files[0].name+'",';
            upload('greeting');
        }
    } else if(kind == 'conference' || kind == 'channel' || kind == 'selector'){
        var initmodes = document.getElementById('initmode');
        var initmode = initmodes.options[initmodes.selectedIndex].value;
        var greet = d.getElementById("playgreet");
        file = document.getElementById("greeting2");

        jprms += '"autoredial":'+d.getElementById("autoredial").checked+',';
        if(kind !== 'channel') jprms += '"recording":'+d.getElementById("confrecord").checked+',';
        jprms += '"greeting\":'+greet.checked+',';

        if(greet.checked && file.value){
            jprms += '"greetingfile":"'+file.files[0].name+'",';
            upload('greeting2');
        }
        if(kind != 'channel') {
            jprms += '"dialtimeout":'+d.getElementById("dialuptt").value+',';
            jprms += '"videomode":"'+d.getElementById("videoform").value+'",';
        }
        if(kind == 'selector') {
            var initcalls = document.getElementById('initcalls');
            jprms += '"initcalls":'+initcalls.checked+',';
            if(initmode == 2) {
                file = document.getElementById("onhold2");
                if(file.value){
                    jprms += '"onholdfile":"'+file.files[0].name+'",';
                    upload('onhold2');
                }
            }
            // var modes = d.querySelectorAll('.init-mode');
            // for(i=0;i<modes.length;i++){
            //     if(modes[i].checked) {
            //         jprms += '"initmode":'+modes[i].value+',';
            //         if(modes[i].value == 2) {
            //             file = document.getElementById("onhold2");
            //             if(file.value){
            //                 jprms += '"onholdfile":"'+file.files[0].name+'",';
            //                 upload('onhold2');
            //             }
            //         }
            //     }
            // }
        }
        if(kind == 'channel') {
            var video = document.getElementById('video');
            if(video.checked) jprms += '"videomode":"640x480",';
            else jprms += '"videomode":"OFF",';

            // jprms += '"initmode":'+initmode+',';
        }
        jprms += '"initmode":'+initmode+',';
    }
    jprms += '}';
    console.log(jprms);
    json_rpc_async('setObject', jprms, function(){
        if(typeof handler === 'function') handler();
        if(typeof callback === 'function') callback(param);
    }); 
}

function addMembersRow(data){

    var row, cell, a;
    row = document.createElement('tr');
    row.id = data.oid;
    cell = row.insertCell(0);
    if(data.oid) {
        row.setAttribute('data-ext', data.number);
        a = document.createElement('a');
        a.textContent = data.number;
        a.href = '#';
        addEvent(a, 'click', get_extension);
        cell.appendChild(a);
    } else {
        cell.textContent = data.number;
    }

    cell = row.insertCell(1);
    cell.textContent = data.name || "";

    cell = row.insertCell(2);
    cell.textContent = data.display || "";

    cell = row.insertCell(3);
    cell.textContent = data.followme || "";

    cell = row.insertCell(4);
    button = document.createElement('button');
    button.className = 'btn btn-danger btn-sm';
    button.innerHTML = '<i class="fa fa-trash"></i>';
    addEvent(button, 'click', delete_extension);
    cell.appendChild(button);

    return row;
}

function fill_list_items(listid, items){
    if(listid == 'available' || (PbxObject.kind != 'hunting' && PbxObject.kind != 'icd' && PbxObject.kind != 'unit')) {
        items.sort();
    }
    var list = document.getElementById(listid);
    for(var i=0; i<items.length; i++){
        var item = document.createElement('li');
        // addEvent(item, 'click', move_list_item);
        item.setAttribute('data-value', items[i]);
        item.innerHTML = items[i];
        list.appendChild(item);
    }
}

function move_list_item(e){
    var li = e.target;
    var parent = li.parentNode;
    if(parent.id == 'available'){
        parent.removeChild(li);
        document.getElementById('members').appendChild(li);
    }
    else{
        parent.removeChild(li);
        document.getElementById('available').appendChild(li);
    }
}

function move_list(to, from){
    var to = document.getElementById(to),
        from = document.getElementById(from),
        fromList = [].slice.call(from.querySelectorAll('li'));

    fromList.forEach(function(item){
        to.appendChild(item);
    });
}

function changeGroupType(grouptype){
    console.log(grouptype);
    var elements = [].slice.call(document.querySelectorAll('.object-type'));
    elements.forEach(function(el){
        if(el.classList.contains(grouptype)) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

function addUser(type){
    var e = e || window.event;
    var table = document.getElementById('group-extensions').querySelector('tbody'),
        available = document.getElementById('available-users'),
        ext = available.options[available.selectedIndex].value,
        name = document.getElementById('user-name'),
        alias = document.getElementById('user-alias'),
        followme = document.getElementById('user-num'),
        // login = document.getElementById('user-login'),
        pass = document.getElementById('user-pass');

    // if(!available.options.length) return;
    console.log(PbxObject.name);
    if(!PbxObject.name) {
        set_bgroup(type, addUser);
        return;
    }
    var jprms = '"kind":"user",';
    jprms += '"groupid":"'+PbxObject.oid+'",';
    jprms += '"number":"'+ext+'",';
    jprms += '"name":"'+name.value+'",';
    jprms += '"display":"'+alias.value+'",';

    var data = {
        kind: 'user',
        groupid: PbxObject.oid,
        number: ext,
        name: name.value,
        display: alias.value
    };
    if(type == 'global') {
        data.followme = followme.value;
        jprms += '"followme":"'+followme.value+'",';
    } else if(type == 'local') {
        // data.localgin = login.value;
        data.password = pass.value;
        // jprms += '"localgin":"'+login.value+'",';
        jprms += '"password":"'+pass.value+'"';
    }
    // var stringdata = JSON.stringify(data);
    var result = json_rpc('setObject', jprms);

    if(result) {
        data.oid = result;
        var newrow = addMembersRow(data);
        var rows = table.rows;
        // if(!rows.length || ext > rows[rows.length-1].getAttribute('data-ext')) {
        if(!rows.length) {
            table.appendChild(newrow);
        } else {
            // for(var i=0, nextrow = 0; i<rows.length-1; i++){
            //     if(rows[i].id > ext) {
            //         nextrow = rows[i].id;

            //         // nextrow > rows[i].id ? nextrow : rows[i].id;
            //     } 
            // }
            // console.log(nextrow);
            // table.insertBefore(newrow, document.getElementById(nextrow));
            table.insertBefore(newrow, table.firstChild);
        }
        // table.appendChild(newrow);
        PbxObject.members.push(data);
            
        var options = [].slice.call(available.options);
        for(var i=0; i<available.options.length; i++) {
            if(available.options[i].value === ext) {
                available.removeChild(available.options[i]);
            }
        }
        if(!available.options.length) {
            var add = document.getElementById('add-user');
            add.setAttribute('disabled', 'disabled');
        }

        cleanForm();
    }
}

function cleanForm(){
    var name = document.getElementById('user-name').value = "",
        alias = document.getElementById('user-alias').value = "",
        followme = document.getElementById('user-num').value ="",
        // login = document.getElementById('user-login').value = "",
        pass = document.getElementById('user-pass').value = "";
}

function newInput(data){
    var div = document.createElement('div');
        div.className = 'form-group';
    if(data.label) {
        var label = '<label for="'+data.id+'">'+data.label+'</label>';
        div.innerHTML += label;
    }
    var input = '<input type="'+(data.type || 'text')+'" class="form-control" id="'+(data.id || '')+'" value="'+(data.value || '')+'">';
    div.innerHTML += input;
    return div;
}

/* 
 * UI for PBX applications
 */

function load_application(result){
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;    
    if(result.name){
        document.getElementById('objname').value = result.name;
    }
    if(enabled) {
        enabled.checked = result.enabled;
        if(result.name) {
            addEvent(enabled, 'change', function(){
                console.log(result.oid+' '+this.checked);
                json_rpc_async('setObjectState', '\"oid\":\"'+result.oid+'\", \"enabled\":'+this.checked+'', null); 
            });
        }
    }
    // if(result.enabled)
    //     document.getElementById('enabled').checked = result.enabled;
    if(result.debug)
        document.getElementById('debug').checked = result.debug;
    // if(result.status)
    //     document.getElementById('status').innerHTML = result.status;
    if(result.dbconnection){
        var db = result.dbconnection;
        if(db.driver == 'sun.jdbc.odbc.JdbcOdbcDriver'){
            document.getElementById('odbc').checked = true;
            if(db.url)
                document.getElementById('odbcurl').value = db.url;
        }
        else if(db.driver){
            document.getElementById('jdbc').checked = true;
            document.getElementById('jdbcdriver').value = db.driver;
            if(db.url)
                document.getElementById('jdbcurl').value = db.url;
        }
        if(db.schema)
            document.getElementById('dbowner').value = db.schema;
        if(db.username)
            document.getElementById('dbuser').value = db.username;
        if(db.password)
            document.getElementById('dbpass').value = db.password;
    }
    
    var vars = result.parameters;
    if(vars.length){
        for(var i=0; i<vars.length; i++){
            add_app_row(vars[i]);
        }
    }
    else{
        add_app_row();
    }
    
    show_content();
    set_page();
}

function set_application(){
    show_loading_panel();
    
    if(PbxObject.oid) jprms += '"oid":"'+PbxObject.oid+'",';
    var jprms = '\"name\":\"'+document.getElementById('objname').value+'\",';
    jprms += '"enabled":'+document.getElementById('enabled').checked+',';
    if(PbxObject.oid) jprms += '\"oid\":\"'+PbxObject.oid+'\",';
    
    var tbody = document.getElementById('appvariables').getElementsByTagName('tbody')[0];
    jprms += '\"parameters\":[';
    var i, j;
    for(i=0; i<tbody.children.length; i++){
        var tr = tbody.children[i];
        var inputs = tr.getElementsByTagName('input');
        var str = '';
        for(j=0;j<inputs.length;j++){
            if(inputs[j].name == 'variable'){
                str += '"key":"'+inputs[j].value+'",';
            }
            else if(inputs[j].name == 'value') {
                str += '"value":"'+inputs[j].value+'",';
            }
            else 
                continue;
        }
        if(str != '') {
            jprms += '{'+str+'},';
        }
    }
    jprms += '],';
    jprms += '"debug":'+document.getElementById('debug').checked+',';
    jprms += '"dbconnection":{';
    var driver, url;
    if(document.getElementById('odbc').checked){
        driver = 'sun.jdbc.odbc.JdbcOdbcDriver';
        url = document.getElementById('odbcurl').value;
    }
    else{
        driver = document.getElementById('jdbcdriver').value;
        url = document.getElementById('jdbcurl').value;
    }
    jprms += '"driver":"'+driver+'",';
    jprms += '"url":"'+url+'",';
    
    if(document.getElementById('dbowner'))
        jprms += '"schema":"'+document.getElementById('dbowner').value+'",';
    if(document.getElementById('dbuser'))
        jprms += '"username":"'+document.getElementById('dbuser').value+'",';
    if(document.getElementById('dbpass'))
        jprms += '"password":"'+document.getElementById('dbpass').value+'",';
    jprms += '},';
    
    json_rpc_async('setObject', jprms, set_object_success);
}

function add_app_row(object){
    
    var table = document.getElementById('appvariables').getElementsByTagName('tbody')[0];
    var tr = document.createElement('tr');
    
    var td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    var cell = document.createElement('input');
    cell.className = 'form-control';
    cell.setAttribute('type', 'text');
    cell.setAttribute('name', 'variable');
    cell.setAttribute('disabled', 'disabled');
    if(object && object.key) cell.value = object.key;
    div.appendChild(cell);
    td.appendChild(div);
    tr.appendChild(td);
    table.appendChild(tr);
    
    td = document.createElement('td');
    div = document.createElement('div');
    div.className = 'form-group';
    cell = document.createElement('input');
    cell.className = 'form-control';
    cell.setAttribute('name', 'value');
    if(object && object.value) cell.value = object.value;
    div.appendChild(cell);
    td.appendChild(div);
    tr.appendChild(td);
    table.appendChild(tr);
    
    table.appendChild(tr);
}

/* 
 * UI from CLI group
 */

//function load_object(result){
function load_cli(result){
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;
    // PbxObject.kind = 'cli';
    if(result.name) {
        document.getElementById('objname').value = result.name;
    }
    
    document.getElementById('enabled').checked = result.enabled;
    
    var transforms = result.bnumbertransforms;
    if(transforms.length) {
        for(var i=0; i<transforms.length; i++){
            append_transform(null, 'transforms1', transforms[i]);
        }
    }
    else { 
        append_transform(null, 'transforms1');
    }
    
    var numbers = result.numbers;
    if(numbers.length){
        for(i=0; i<numbers.length; i++){
            add_cli_row(numbers[i]);
        }
    }
    else{
        add_cli_row();
    }

    show_content();
    set_page();
}

function set_cli(){
        
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
    }
    else{
        PbxObject.name = name;
        // handler = set_new_object;
        handler = null;
    }
    
    if(PbxObject.oid) jprms += '\"oid\":\"'+PbxObject.oid+'\",';
    jprms += '\"kind\":\"cligroup\",';
    jprms += '\"enabled\":'+document.getElementById('enabled').checked+',';
    
    jprms += '\"bnumbertransforms\":[';
    jprms += encode_transforms('transforms1');
    jprms += '],';
    
    jprms += '\"numbers\":[';
    var i, tbody = document.getElementById('clinumbers').getElementsByTagName('tbody')[0];
    for(i=0; i<tbody.children.length; i++){
        var tr = tbody.children[i];
        var str = '';
        
        var inp = tr.getElementsByTagName('input')[0];
        if(inp && inp.name == 'number') {
            str += '"number":"'+inp.value+'",';
        }
        var ta = tr.getElementsByTagName('textarea')[0];
        if(ta && ta.name == 'description') {
            str += '"description":"'+ta.value+'",';
        }
        
        if(str != '') {
            jprms += '{'+str+'},';
        }
    }
    jprms += ']';
        
    json_rpc_async('setObject', jprms, handler);     
}

function add_cli_row(object){
    
    var e = e || window.event;
    if(e && e.type == 'click')
        e.preventDefault();

    var table = document.getElementById('clinumbers').getElementsByTagName('tbody')[0],
        lrow = table.rows.length,
        row = table.insertRow(lrow),
        cell, div, inp;
    // var tr = document.createElement('tr');
    
    // var td = document.createElement('td');
    cell = row.insertCell(0);
    div = document.createElement('div');
    div.className = 'form-group';
    inp = document.createElement('input');
    inp.className = 'form-control';
    inp.setAttribute('type', 'text');
    inp.setAttribute('name', 'number');
    if(object && object.number) inp.value = object.number;
    div.appendChild(inp);
    cell.appendChild(div);
    // tr.appendChild(td);
    // table.appendChild(tr);
    
    // td = document.createElement('td');
    cell = row.insertCell(1);
    div = document.createElement('div');
//    div.className = 'col-xs-6';
    div.className = 'form-group';
    inp = document.createElement('textarea');
    inp.className = 'form-control y-resizable';
    inp.setAttribute('rows', '3');
//    cell.setAttribute('type', 'text');
    inp.setAttribute('name', 'description');
    if(object && object.description) inp.value = object.description;
    div.appendChild(inp);
    cell.appendChild(div);
    // tr.appendChild(td);
    // table.appendChild(tr);
    
    // td = document.createElement('td');
    cell = row.insertCell(2);
    div = document.createElement('div');
    div.className = 'form-group';
//    div.className = 'col-xs-2';
    inp = document.createElement('a');
    inp.href = '#';
    // cell.setAttribute('type', 'checkbox');
    inp.className = 'remove-clr';
    inp.innerHTML = '<i class="fa fa-close"></i>';
    addEvent(inp, 'click', remove_row);
    div.appendChild(inp);
    cell.appendChild(div);
    // tr.appendChild(td);
    // table.appendChild(tr);
}

/* 
 * UI for PBX extensions
 */

function getInfoFromState(state, group){

    if(state == 0) {
        status = 'Idle';
        className = 'success';
    } else if(state == 3) {
        status = 'Talking';
        className = 'connected';
    } else if(state == 6) {
        status = 'Forwarding';
        className = 'warning';
    } else if(state == 5 || (state == -1 && group)) {
        status = '';
        className = '';
    } else if(state == 4) {
        status = 'DND';
        className = 'danger';
    } else if(state == 1 || state == 2) {
        status = state == 1 ? 'Dialing' : 'Ringing';
        className = 'info';
    } else {
        status = '';
        className = 'active';
    }

    return {
        rstatus: status,
        rclass: className
    }

}

function createExtRow(data){

    var row = document.createElement('tr'),
        info = getInfoFromState(data.state, data.group),
        status = info.rstatus,
        classname = info.rclass,
        cell, a, newkind;

    cell = row.insertCell(0);
    if(data.oid && data.kind){
        a = document.createElement('a');
        if(data.kind == 'user' || data.kind == 'phone') {
            a.href = '#';
            addEvent(a, 'click', get_extension);
        } else {
            a.href = '#' + data.kind + '?' + data.oid;
        }
        a.textContent = data.ext;
        cell.appendChild(a);
    } else {
        cell.textContent = data.ext;
    }
    
    cell = row.insertCell(1);
    cell.textContent = data.name || "";

    cell = row.insertCell(2);
    cell.textContent = data.group || "";
    
    cell = row.insertCell(3);
    cell.textContent = data.reg || "";

    cell = row.insertCell(4);
    cell.textContent = data.kind || "";

    cell = row.insertCell(5);
    cell.textContent = status || "";

    cell = row.insertCell(6);
    if(data.kind) {
        if(data.kind == 'user' || data.kind == 'phone') {
            button = document.createElement('button');
            button.className = 'btn btn-primary btn-sm';
            button.innerHTML = '<i class="fa fa-edit"></i>';
            addEvent(button, 'click', editExtension);
            cell.appendChild(button);
        }    
    }
    cell = row.insertCell(7);
    if(data.oid) {
        button = document.createElement('button');
        button.className = 'btn btn-danger btn-sm';
        button.innerHTML = '<i class="fa fa-trash"></i>';
        addEvent(button, 'click', delete_extension);
        cell.appendChild(button);
    }

    // row.id = data.ext;
    row.id = data.oid;
    row.setAttribute('data-ext', data.ext);
    row.className = classname;

    return row;

}

function load_extensions(result) {
    // console.log(result);
    var row,
        table = document.getElementById('extensions').getElementsByTagName('tbody')[0],
        passReveal = [].slice.call(document.querySelectorAll('.password-reveal')),
        fragment = document.createDocumentFragment();

    PbxObject.extensions = result;

    for(var i=0; i<result.length; i++){

        // if(!result[i].oid) continue;

        row = createExtRow(result[i]);
        fragment.appendChild(row);

    }
        
    table.appendChild(fragment);
    
    if(passReveal.length) {
        passReveal.forEach(function(item){
            addEvent(item, 'click', revealPassword);
        });
    }

    var $modal = $('#el-extension');
    $($modal).insertBefore('#pagecontainer');

    add_search_handler();
    show_content();

}

function updateExtension(data){

    console.log(data);

    var row = document.getElementById(data.oid);
    var state = data.state;
    var info = getInfoFromState(state, data.group);
    var table = document.getElementById('extensions');

    // if(!row) return;
    
    // var state = data.state,
    //     cells = row.cells,
    //     info = getInfoFromState(state, data.group),
    //     status = info.rstatus,
    //     className = info.rclass;
    
    if(table) {
        table = table.querySelector('tbody');
        if(row) {
            var cells = row.cells,
                status = info.rstatus,
                className = info.rclass;

            row.className = className;

            if(data.name){
                cells[1].innerHTML = data.name;
            }
            if(data.hasOwnProperty('group')){
                cells[2].innerHTML = data.group;
            }
            // else{
            //     cells[2].innerHTML = "";   
            // }
            if(data.hasOwnProperty('reg')){
                cells[3].innerHTML = data.reg;
            }
            // else{
            //     cells[3].innerHTML = "";
            // }
            cells[5].innerHTML = status;
        }
            
    }
    // for(var ext in PbxObject.extensions){

    //     if(PbxObject.extensions[ext].oid === data.oid || PbxObject.extensions[ext].ext === data.ext){
    //         var ext = PbxObject.extensions[ext];
    //         if(ext.state) ext.state = data.state;
    //         if(ext.name) ext.name = data.name;
    //         if(ext.group) ext.group = data.group;
    //         if(ext.reg) ext.reg = data.reg;
    //     }

    // }

}

function get_extension(e){
    var e = e || window.event;
    if(e.type == 'click')
        e.preventDefault();

    var oid = getClosest(e.target, 'tr').id;

    if(oid){
        if(!PbxObject.templates.extension){
            $.get('/badmin/views/extension.html', function(template){
                PbxObject.templates = PbxObject.templates || {};
                PbxObject.templates.extension = template;
            });
        }

        show_loading_panel();
        json_rpc_async('getObject', '\"oid\":\"'+oid+'\"', load_extension);
    }
    
}

function editExtension(e){

    var row = getClosest(e.target, 'tr'),
        table = row.parentNode,
        tr = document.createElement('tr'),
        // tr = row.cloneNode(false),
        cells = row.cells,
        name = cells[1].textContent,
        group = cells[2].textContent,
        reg = cells[3].textContent,
        kind = cells[4].textContent,
        status = cells[5].textContent,
        cell, div, inp, sel, button;

    tr.setAttribute('data-oid', row.id);
    cell = tr.insertCell(0);
    cell.innerHTML = cells[0].innerHTML;

    cell = tr.insertCell(1);
    cell.innerHTML = '<input class="form-control extname" value="'+name+'">';

    cell = tr.insertCell(2);
    if(kind == 'user' || kind == 'phone'){
        var newkind = kind == 'user' ? 'users':'unit';
        // div = document.createElement('div');
        // div.className = 'form-group';
        sel = document.createElement('select');
        sel.className = 'form-control extgroup';
        fill_group_choice(newkind, group, sel);
        // div.appendChild(sel);
        cell.appendChild(sel);
    } else {
        cell.textContent = group;
    }

    cell = tr.insertCell(3);
    // div = document.createElement('div');
    // div.className = 'form-group';
    if(kind == 'phone' || reg.indexOf('.') != -1) {
        cell.textContent = reg;
    } else {
        cell.innerHTML = '<input class="form-control extreg" value="'+reg+'">';
    }

    cell = tr.insertCell(4);
    cell.textContent = kind;
    cell = tr.insertCell(5);
    cell.textContent = status;

    cell = tr.insertCell(6);
    button = document.createElement('button');
    button.className = 'btn btn-default btn-sm';
    button.innerHTML = '<i class="fa fa-chevron-left"></i>';
    addEvent(button, 'click', function(){
        row.style.display = 'table-row';
        table.removeChild(tr);
    });
    cell.appendChild(button);

    cell = tr.insertCell(7);
    button = document.createElement('button');
    button.className = 'btn btn-success btn-sm';
    button.innerHTML = '<i class="fa fa-check"></i>';
    addEvent(button, 'click', set_extension_update);
    cell.appendChild(button);

    table.insertBefore(tr, row);
    row.style.display = 'none';
    // table.removeChild(row);

}

function set_extension_update(e){

    var row = getClosest(e.target, 'tr'),
        oid = row.getAttribute('data-oid'),
        trow = document.getElementById(oid),
        name = row.querySelector('.extname').value,
        groups = row.querySelector('.extgroup'),
        groupid = groups.options[groups.selectedIndex].value,
        reg = row.querySelector('.extreg');

    // jprms = '{';
    var jprms = '\"oid\":\"'+oid+'\",';
    if(name) jprms += '\"name\":\"'+name+'\",';
    if(groupid) jprms += '\"groupid\":\"'+groupid+'\",';
    if(reg && reg.value) jprms += '\"followme\":\"'+reg.value+'\",';
    // jprms += '}';
    json_rpc('setObject', jprms); 
// console.log(jprms);
    row.parentNode.removeChild(row);
    trow.style.display = 'table-row';

}

function load_extension(result){

    var d = document,
    groupid = result.groupid,
    kind = result.kind == 'user' ? 'users':'unit';
    data = {
        data: result,
        frases: PbxObject.frases
    };
    console.log(data);

    PbxObject.oid = result.oid;
    
    var rendered = Mustache.render(PbxObject.templates.extension, data);
    var cont = document.createElement('div');
    cont.id = 'ext-cont';
    document.getElementById('dcontainer').appendChild(cont);
    $("#ext-cont").html(rendered);
    
    var tabs = document.getElementById('ext-tabs');
    if(groupid){
        fill_group_choice(kind, groupid);
    }

    if(kind !== 'users'){
        d.getElementById('el-followme').classList.add('hidden');
    }
    
    d.getElementById('extpassword').value = result.password;
    
    if(result.features){
        if(result.features.fwdall == undefined){
            tabs.querySelector('li a[href="#ext-forwarding"]').parentNode.className = 'hidden';
        }
        if(result.features.dnd == undefined){
            d.getElementById('ext-dnd').setAttribute('disabled','');
        }
        if(result.features.clir == undefined){
            d.getElementById('ext-clir').setAttribute('disabled','');
        }
        if(result.features.callwaiting == undefined){
            d.getElementById('ext-callwaiting').setAttribute('disabled','');
        }
        if(result.features.pickupdeny == undefined){
            d.getElementById('ext-pickupdeny').setAttribute('disabled','');
        }
        if(result.features.monitordeny == undefined){
            d.getElementById('ext-monitordeny').setAttribute('disabled','');
        }
        if(result.features.busyoverdeny == undefined){
            d.getElementById('ext-busyoverdeny').setAttribute('disabled','');
        }
        if(result.features.voicemail == undefined){
            d.getElementById('ext-voicemail').setAttribute('disabled','');
        }
        if(result.features.lock == undefined){
            d.getElementById('ext-plock').setAttribute('disabled','');
        }
    }
    
    $('#el-extension').modal();
    show_content();
    
    d.getElementById('el-set-extension').onclick = function(){
        set_extension(kind);
    };
}

function set_extension(kind){
    // var e = e || window.event;
    // if(e.type == 'click') e.preventDefault();
    var d = document,
    oid = PbxObject.oid;
        // kind = PbxObject.kind;

    var jprms = '\"oid\":\"'+oid+'\",';
    var group = d.getElementById("extgroup");
    if(group.options.length) var groupv = group.options[group.selectedIndex].value;
    
    if(groupv)
        jprms += '\"groupid\":\"'+groupv+'\",';
    if(kind == 'users'){
        jprms += '\"followme\":\"'+d.getElementById("followme").value+'\",';
    }
    jprms += '\"name\":\"'+d.getElementById("extname").value+'\",';
    jprms += '\"display\":\"'+d.getElementById("extdisplay").value+'\",';
    if(d.getElementById("extlogin").value) jprms += '\"login\":\"'+d.getElementById("extlogin").value+'\",';
    jprms += '\"password\":\"'+d.getElementById("extpassword").value+'\",';
    if(d.getElementById("extpin").value) jprms += '\"pin\":'+d.getElementById("extpin").value+',';
    jprms += '\"features\":{';
    if(d.getElementById("ext-fwdall") != null){
        jprms += '\"fwdall\":'+d.getElementById("ext-fwdall").checked+',';
        jprms += '\"fwdallnumber\":\"'+d.getElementById("ext-fwdallnumber").value+'\",';
    }
    if(d.getElementById("ext-fwdnregnumber") != null){   
        jprms += '\"fwdnreg\":'+d.getElementById("ext-fwdnreg").checked+',';
        jprms += '\"fwdnregnumber\":\"'+d.getElementById("ext-fwdnregnumber").value+'\",';
    }
    if(d.getElementById("ext-fwdbusynumber") != null){
        jprms += '\"fwdbusy\":'+d.getElementById("ext-fwdbusy").checked+',';
        jprms += '\"fwdbusynumber\":\"'+d.getElementById("ext-fwdbusynumber").value+'\",';
    }
    if(d.getElementById("ext-fwdnansnumber") != null){
        jprms += '\"fwdnans\":'+d.getElementById("ext-fwdnans").checked+',';
        jprms += '\"fwdnansnumber\":\"'+d.getElementById("ext-fwdnansnumber").value+'\",';
    }  
    if((d.getElementById("ext-fwdtimeout") != null) && d.getElementById("ext-fwdtimeout").value)
        jprms += '\"fwdtimeout\":'+d.getElementById("ext-fwdtimeout").value+',';
    if(d.getElementById("ext-plock").disabled == false)    
        jprms += '\"lock\":'+d.getElementById("ext-plock").checked+',';
    if(d.getElementById("ext-dnd").disabled == false)    
        jprms += '\"dnd\":'+d.getElementById("ext-dnd").checked+',';
    if(d.getElementById("ext-clir").disabled == false)    
        jprms += '\"clir\":'+d.getElementById("ext-clir").checked+',';
    if(d.getElementById("ext-callwaiting").disabled == false)
        jprms += '\"callwaiting\":'+d.getElementById("ext-callwaiting").checked+',';
    if(d.getElementById("ext-pickupdeny").disabled == false)    
        jprms += '\"pickupdeny\":'+d.getElementById("ext-pickupdeny").checked+',';
    if(d.getElementById("ext-monitordeny").disabled == false)    
        jprms += '\"monitordeny\":'+d.getElementById("ext-monitordeny").checked+',';
    if(d.getElementById("ext-busyoverdeny").disabled == false)    
        jprms += '\"busyoverdeny\":'+d.getElementById("ext-busyoverdeny").checked+',';
    // if(d.getElementById("recording").disabled == false)    
    //     jprms += '\"recording\":'+d.getElementById("recording").checked+',';
    if(d.getElementById("ext-voicemail").disabled == false)    
        jprms += '\"voicemail\":'+d.getElementById("ext-voicemail").checked+',';
    jprms += '}';  
    console.log(jprms);
    json_rpc('setObject', jprms);
    
    $('#el-extension').modal('hide');
    
    // update_extansions();
}

function fill_group_choice(kind, groupid, select){
    // var result = json_rpc('getObjects', '\"kind\":\"'+kind+'\"');
    var select = select || document.getElementById("extgroup");
    // for(var i=0;i<=select.options.length;i++){
    //     select.remove(select.selectedIndex[i]);
    // }
    while(select.firstChild) {
        select.removeChild(select.firstChild);
    }
    json_rpc_async('getObjects', '\"kind\":\"'+kind+'\"', function(result){
        var gid, name, option, i;
        if(select) {
            for(i=0; i<result.length; i++){
                gid = result[i].oid;
                name = result[i].name;
                option = document.createElement('option');
                option.setAttribute('value', gid);
                if(gid == groupid || name == groupid) {
                    option.selected = "true";
                }
                option.innerHTML = result[i].name;
                select.appendChild(option);
            }    
        }
    });
}

/* 
 * UI for PBX routing tables
 */

function load_routes(result){
    console.log(result);
    
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
        li.setAttribute('data-value', priorities[i]);
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

    set_page();
}

// function set_routes(){
        
//     var name = document.getElementById('objname').value;
//     if(name)
//         var jprms = '\"name\":\"'+name+'\",';
//     else{
//         alert(PbxObject.frases.MISSEDNAMEFIELD);
//         return false;
//     }
//     show_loading_panel();
    
//     var handler;
//     if(PbxObject.name) {
//         handler = set_object_success;
//     }
//     else{
//         PbxObject.name = name;
//         // handler = set_new_object;
//         handler = null;
//     }
    
//     if(PbxObject.oid) jprms += '\"oid\":\"'+PbxObject.oid+'\",';
//     jprms += '\"kind\":\"routes\",';
//     jprms += '\"enabled\":'+document.getElementById('enabled').checked+',';
 
//     jprms += '\"priorities\":[';
//     var ul = document.getElementById('priorities');
//     var i, j;
//     for(i=0; i<ul.children.length; i++){
//         jprms += ul.children[i].getAttribute('data-value')+',';
//     }
    
//     jprms += '],';
//     jprms += '\"anumbertransforms\":[';
//     jprms += encode_transforms('transforms1');
//     jprms += '],';
//     jprms += '\"bnumbertransforms\":[';
//     jprms += encode_transforms('transforms2');
//     jprms += '],';
    
//     jprms += '\"routes\":[';
//     var str, name, row, els, inp, table = document.getElementById('rtable'); 
//     for(i=1; i<table.rows.length; i++){
//         row = table.rows[i];
//         els = row.getElementsByClassName('form-group');
//         str = '';
//         for(j=0; j<els.length; j++){
//             inp = els[j].firstChild;
//             name = inp.getAttribute('name');
//             if(name == 'number'){
//                 if(inp.value)
//                     str += '"number":"'+inp.value+'",';
//                 else
//                     break;
//             }
//             else if(name == 'description'){
//                 str += '"description":"'+inp.value+'",';
//             }
//             else if(name == 'target'){
//                 str += '"target":{"oid":"'+inp.value+'"},';
//             }
//             else if(name == 'priority'){
//                 str += '"priority":'+parseInt(inp.value)+',';
//             }
//             else if(name == 'cost'){
//                 str += '"cost":'+inp.value+',';
//             }
//         }
//         if(str != '') jprms += '{'+str+'},';
//     }
//     jprms += ']';
//     json_rpc_async('setObject', jprms, handler);     
// }

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
        jprms += ul.children[i].getAttribute('data-value')+',';
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
    console.log(jprms);
    json_rpc_async('setObject', jprms, handler);
}

function build_routes_table(routes){
    var result, fragment,
    tbody = document.getElementById("rtable").getElementsByTagName('tbody')[0];

    if(typeof PbxObject.objects === 'object') {
        result = PbxObject.objects;
    } else {
        result = json_rpc('getObjects', '\"kind\":\"all\"');
        sortByKey(result, 'name');
        PbxObject.objects = result;
    }
    result = result.filter(function(obj){
        return (obj.kind !== 'equipment' && obj.kind !== 'cli' && obj.kind !== 'timer' && obj.kind !== 'routes' && obj.kind !== 'users' && obj.kind !== 'pickup');
    });

    if(!routes.length) tbody.appendChild(build_route_row(null, result));
    else {
        sortByKey(routes, 'number');
        fragment = document.createDocumentFragment();
        for(var i=0; i<routes.length; i++){
            fragment.appendChild(add_route_row(routes[i], result));
        }
        tbody.appendChild(fragment);
    }    
    show_content();
}

function add_new_route(e){
    var e = e || window.event;
    if(e) e.preventDefault();

    var objects = PbxObject.objects.filter(function(obj){
        return (obj.kind !== 'equipment' && obj.kind !== 'cli' && obj.kind !== 'timer' && obj.kind !== 'routes' && obj.kind !== 'users' && obj.kind !== 'pickup');
    });

    var tbody = document.getElementById("rtable").getElementsByTagName('tbody')[0];
    tbody.insertBefore(build_route_row(null, objects), tbody.children[0]);
}

function add_route_row(route, objects){
    var row, cell;
    row = document.createElement('tr');

    cell = row.insertCell(0);
    cell.textContent = route.number;

    cell = row.insertCell(1);
    cell.textContent = route.description;

    cell = row.insertCell(2);
    for(i=0; i<objects.length; i++){
        if(objects[i].oid == route.target.oid){
            cell.setAttribute('data-gid', route.target.oid);
            cell.textContent = objects[i].name;
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
        var newroute = build_route_row(route, objects);
        row.parentNode.insertBefore(newroute, row);
        row.style.display = 'none';
    });
    cell.appendChild(button);

    cell = row.insertCell(6);
    button = document.createElement('button');
    button.className = 'btn btn-danger btn-sm';
    button.innerHTML = '<i class="fa fa-trash"></i>';
    addEvent(button, 'click', function(e){
        var c = confirm(PbxObject.frases.DELETE+' '+PbxObject.frases.ROUTE.toLowerCase()+'?');
        if(c) {
            remove_row(e);
            set_routes();
        } else {
            return false;
        }
    });
    cell.appendChild(button);

    return row;
}

function build_route_row(route, objects){
    var rowData = {};
    var tr = document.createElement('tr');
    tr.className = "route-on-edit";
    var td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    var number = document.createElement('input');
    number.className = 'form-control';
    number.setAttribute('type', 'text');
    number.setAttribute('name', 'number');
    number.setAttribute('size', '12');
    if(route != null) {
        number.value = route.number;
    }
    rowData.number = number.value;
    number.onchange = function(){ rowData.number = number.value };
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
    for(i=0; i<objects.length; i++){
        // var kind = objects[i].kind;
        // if(kind == 'equipment' || kind == 'cli' || kind == 'timer' || kind == 'routes' || kind == 'users' || kind == 'pickup') {
        //     continue;
        // }
        var oid = objects[i].oid;
        var option = document.createElement('option');
        option.setAttribute('value', oid);
        option.innerHTML = objects[i].name;
        if(route != null && oid == route.target.oid){
            option.setAttribute('selected', '');
        }
        target.appendChild(option);
    }
    rowData.target = {oid: target.options[target.selectedIndex].value};
    target.onchange = function(){ rowData.target = {oid: target.options[target.selectedIndex].value} };
    div.appendChild(target);
    td.appendChild(div);
    tr.appendChild(td);
    
    td = document.createElement('td');
    var div = document.createElement('div');
    div.className = 'form-group';
    priority = document.createElement('select');
    priority.className = 'form-control';
    priority.setAttribute('name', 'priority');
    for(i=0; i<=10; i++){
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

    // if(route != null && route.huntstop != undefined){
    //     td = document.createElement('td');
    //     cell = document.createElement('input');
    //     cell.setAttribute('type', 'checkbox');
    //     cell.setAttribute('name', 'huntstop');
    //     if(route.huntstop) cell.setAttribute('checked', route.huntstop);
    //     td.appendChild(cell);
    //     tr.appendChild(td);
    // }
    
    // td = document.createElement('td');
    // cell = document.createElement('a');
    // cell.href = "#";
    // cell.className = 'remove-clr';
    // cell.innerHTML = '<i class="glyphicon glyphicon-remove"></i>';
    // addEvent(cell, 'click', remove_row);
    // td.appendChild(cell);
    // tr.appendChild(td);

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
        var row = tr.nextSibling;
        var newrow = add_route_row(rowData, objects);
        tr.parentNode.insertBefore(newrow, tr);
        if(row && row.nodeName == 'TR' && row.style.display == 'none') {
            row.parentNode.removeChild(row);
        }
        tr.parentNode.removeChild(tr);
        set_routes();
    });
    td.appendChild(button);
    tr.appendChild(td);
        
    return tr;
}

/* 
 * UI for PBX timers
 */

function load_timer(result){
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;
    // PbxObject.kind = 'timer';
    
    if(result.name){
        document.getElementById('objname').value = result.name;
    }
    document.getElementById('enabled').checked = result.enabled;
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
        document.getElementById('d'+result.weekdays[i]).checked = true;
    }
    
    fill_timer_targets('objects');
    
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
    
    var everyd = document.getElementById('timer-everyday');
    addEvent(everyd, 'click', check_days);
    var workd = document.getElementById('timer-workdays');
    addEvent(workd, 'click', check_days);
    var holid = document.getElementById('timer-holidays');
    addEvent(holid, 'click', check_days);
    
}

function set_timer(){
        
    var jprms, name = document.getElementById('objname').value;
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

    jprms += '\"weekdays\":[';
    var i;
    for(i=0; i<7; i++){
        if(document.getElementById('d'+i).checked){
            jprms += i+',';
        }
    }
    jprms += '],';

    var targets = document.getElementById('targets').getElementsByTagName('tbody')[0];
    
    jprms += '\"targets\":[';
    for(i=0; i < targets.children.length; i++){
        var tr = targets.children[i];
        if(tr.id != undefined && tr.id != ''){
            jprms += '{\"oid\":\"'+targets.children[i].id+'\",\"action\":\"'+tr.children[1].innerHTML+'\"},';
        }
    }
    jprms += ']';
    
    json_rpc_async('setObject', jprms, handler); 
}

function timer_target_row(oid, name, action){
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    var a = document.createElement('a');
    var action = action == "Enable" ? PbxObject.frases.ENABLE : PbxObject.frases.DISABLE;

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
    td.textContent = action;
    tr.appendChild(td);
    td = document.createElement('td');
    var button = document.createElement('button');
    button.className = 'btn btn-danger btn-sm';
    button.innerHTML = '<i class="fa fa-chevron-minus"></i>';
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
        var kind = result[i].kind;
        if(kind == 'equipment' || kind == 'cli' || kind == 'timer' || kind == 'users') {
            continue;
        }
        var oid = result[i].oid;
        var option = document.createElement('option');
        option.value = oid;
        option.innerHTML = result[i].name;
        objects.appendChild(option);
    }
}

function check_days(){
    var i, day, id = this.id;

    for(i=0;i<7;i++){
        day = document.getElementById('d'+i);
        if((id === 'timer-workdays' && (i===5 || i===6)) || (id === 'timer-holidays' && i<5)){
            if(day.checked) day.checked = false;
            continue;
        }
        day.checked = true;
    }
}

/* 
 * UI for PBX trunks
 */

function load_trunk(result){
    console.log(result);
    PbxObject.oid = result.oid;
    PbxObject.name = result.name;
    // PbxObject.kind = 'trunk';
    
    if(result.name)
        document.getElementById('objname').value = result.name;

    var enabled = document.getElementById('enabled');
    if(enabled) {
        enabled.checked = result.enabled;
        if(result.name) {
            addEvent(enabled, 'change', function(){
                console.log(result.oid+' '+this.checked);
                json_rpc_async('setObjectState', '\"oid\":\"'+result.oid+'\", \"enabled\":'+this.checked+'', null); 
            });
        }
    }
    if(result.status) {
        var el = document.getElementById('status');
        if(el) el.innerHTML = result.status;
    }
    if(result.protocol) {
        // document.getElementById('protocol').value = result.protocol;
        var option, protocols = document.getElementById('protocols');
        if(result.name) {
            option = document.createElement('option');
            option.value = result.protocol;
            option.textContent = result.protocol;
            protocols.appendChild(option);
        } else if(result.protocols) {
            result.protocols.forEach(function(proto){
                option = document.createElement('option');
                option.value = proto;
                option.textContent = proto;
                protocols.appendChild(option);
            });
            addEvent(protocols, 'change', change_protocol);
        }
        change_protocol();
    }
    if(result.domain)
        document.getElementById('domain').value = result.domain;
    document.getElementById('register').checked = result.register;
    if(result.user)
        document.getElementById('user').value = result.user;
    if(result.auth)
        document.getElementById('auth').value = result.auth;
    if(result.pass)
        document.getElementById('pass').value = result.pass;
    document.getElementById('regexpires').value = result.regexpires || 60;
    
    var radio = document.getElementById('proxy');
    addEvent(radio, 'change', function(){
        var inputs = document.getElementsByName('proxy');
        // if(this.checked) var disabled = false;
        // else disabled = true;
        for(var i=0;i<inputs.length;i++){
            inputs[i].disabled = !this.checked;
        }
    });
    radio.checked = result.proxy;
    var inputs = document.getElementsByName('proxy');
    for(var i=0;i<inputs.length;i++){
        inputs[i].disabled = !result.proxy;
    }
    if(result.paddr)
        document.getElementById('paddr').value = result.paddr;
    if(result.pauth)
        document.getElementById('pauth').value = result.pauth;
    if(result.ppass)
        document.getElementById('ppass').value = result.ppass;
    if(result.maxinbounds != undefined){
        document.getElementById('maxinbounds').value = result.maxinbounds;
        document.getElementById('inmode').checked = result.maxinbounds > 0;
    }
    if(result.maxoutbounds != undefined){
        document.getElementById('maxoutbounds').value = result.maxoutbounds;
        document.getElementById('outmode').checked = result.maxoutbounds > 0;
    }
    if(result.parameters != undefined){
        var codecs = result.parameters.codecs;       
        if(codecs != undefined){
            var c;
            for(var i=0; i<codecs.length; i++){
                c = document.getElementById('c'+i);    
                if(!c) break;
                c.value = codecs[i].codec;
                document.getElementById('f'+i).value = codecs[i].frame;
            }
        }
        else{
            for(i=0; i<4; i++){
                document.getElementById('c'+i).selectedIndex = 0;
                document.getElementById('f'+i).value = 0;
            }
        }
        if(result.parameters.t1) document.getElementById('t1').value = result.parameters.t1 || 5;
        if(result.parameters.t2) document.getElementById('t2').value = result.parameters.t2 || 15;
        if(result.parameters.t3) document.getElementById('t3').value = result.parameters.t3 || 5;
        if(result.parameters.t38fax) document.getElementById('t38fax').checked = result.parameters.t38fax;
        if(result.parameters.video) document.getElementById('video').checked = result.parameters.video;
        if(result.parameters.dtmfrelay) document.getElementById('dtmfrelay').checked = result.parameters.dtmfrelay;
        if(result.parameters.earlymedia) document.getElementById('earlymedia').checked = result.parameters.earlymedia;
        if(result.protocol == 'h323'){
            document.getElementById('sip').parentNode.style.display = 'none';
            if(result.parameters.dtmfmode) document.getElementById('dtmfh323').value = result.parameters.dtmfmode;
            if(result.parameters.faststart) document.getElementById('faststart').checked = result.parameters.faststart;
            if(result.parameters.h245tunneling) document.getElementById('h245tunneling').checked = result.parameters.h245tunneling;
            if(result.parameters.playringback) document.getElementById('playringback').checked = result.parameters.playringback;
        }
        else{
            document.getElementById('h323').parentNode.style.display = 'none';  
            if(result.parameters.dtmfmode) document.getElementById('dtmfsip').value = result.parameters.dtmfmode;
        }
    }

    var transforms = result.inboundanumbertransforms;
    if(transforms.length) {
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms1', transforms[i]);
        }
    }
    else { 
        append_transform(null, 'transforms1');
    }

    transforms = result.inboundbnumbertransforms;
    if(transforms.length){
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms2', transforms[i]);
        }
    }
    else{
        append_transform(null, 'transforms2');
    }

    transforms = result.outboundanumbertransforms;
    if(transforms.length){
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms3', transforms[i]);
        }
    }
    else{
        append_transform(null, 'transforms3');
    }
    transforms = result.outboundbnumbertransforms;
    if(transforms.length){
        for(i=0; i<transforms.length; i++){
            append_transform(null, 'transforms4', transforms[i]);
        }
    }
    else{
        append_transform(null, 'transforms4');
    }

    show_content();
    set_page();
    
}

function set_trunk(){
    var name = document.getElementById('objname').value;
    var jprms;
    if(name)
        jprms = '"name":"'+name+'",';
    else{
        alert(PbxObject.frases.MISSEDNAMEFIELD);
        return false;
    }
    
    show_loading_panel();

    var handler;
    if(PbxObject.oid) jprms += '"oid":"'+PbxObject.oid+'",';
    if(PbxObject.name) {
        handler = set_object_success;
    }
    else{
        PbxObject.name = name;
        // handler = set_new_object;
        handler = null;
    }
    
    jprms += '"kind":"trunk",';
    jprms += '"enabled":'+document.getElementById('enabled').checked+',';

    var protocol = document.getElementById('protocols').value;
    jprms += '"protocol":"'+protocol+'",';
    jprms += '"domain":"'+document.getElementById('domain').value+'",';
    jprms += '"register":'+document.getElementById('register').checked+',';
    jprms += '"user":"'+document.getElementById('user').value+'",';
    jprms += '"auth":"'+document.getElementById('auth').value+'",';
    jprms += '"pass":"'+document.getElementById('pass').value+'",';
    jprms += '"proxy":'+document.getElementById('proxy').checked+',';
    jprms += '"paddr":"'+document.getElementById('paddr').value+'",';
    jprms += '"pauth":"'+document.getElementById('pauth').value+'",';
    jprms += '"ppass":"'+document.getElementById('ppass').value+'",';

    if(document.getElementById('inmode').checked)
        jprms += '"maxinbounds":'+document.getElementById('maxinbounds').value+',';
    else
        jprms += '"maxinbounds":0,';
    if(document.getElementById('outmode').checked)
        jprms += '"maxoutbounds":'+document.getElementById('maxoutbounds').value+',';
    else
        jprms += '"maxoutbounds":0,';

    jprms += '"parameters":{';
    if(document.getElementById('codecs')){
        jprms += '"codecs":[';
        for(var i=0; i<4; i++){
            if(document.getElementById('c'+i).selectedIndex == 0) break;
            jprms += '{"codec":"'+document.getElementById('c'+i).value+'",';
            jprms += '"frame":'+document.getElementById('f'+i).value+'},';
        }
        jprms += '],';
    }
    if(document.getElementById('t1'))
        jprms += '"t1":'+document.getElementById('t1').value+',';
    if(document.getElementById('t2'))
        jprms += '"t2":'+document.getElementById('t2').value+',';
    if(document.getElementById('t3'))
        jprms += '"t3":'+document.getElementById('t3').value+',';
    if(document.getElementById('regexpires'))
        jprms += '"regexpires":'+document.getElementById('regexpires').value+',';
    if(document.getElementById('t38fax'))
        jprms += '"t38fax":'+document.getElementById('t38fax').checked+',';
    if(document.getElementById('video'))
        jprms += '"video":'+document.getElementById('video').checked+',';
    if(document.getElementById('earlymedia'))
        jprms += '"earlymedia":'+document.getElementById('earlymedia').checked+',';
    if(document.getElementById('dtmfrelay'))
        jprms += '"dtmfrelay":'+document.getElementById('dtmfrelay').checked+',';
    if(protocol == 'h323'){
        jprms += '"dtmfmode":"'+document.getElementById('dtmfh323').value+'",';
        jprms += '"faststart":'+document.getElementById('faststart').checked+',';
        jprms += '"h245tunneling":'+document.getElementById('h245tunneling').checked+',';
        jprms += '"playringback":'+document.getElementById('playringback').checked+',';
    }
    else{
        jprms += '"dtmfmode":"'+document.getElementById('dtmfsip').value+'",';
    }
    jprms += '},';
    jprms += '"inboundanumbertransforms":[';
    jprms += encode_transforms('transforms1');
    jprms += '],';
    jprms += '"inboundbnumbertransforms":[';
    jprms += encode_transforms('transforms2');
    jprms += '],';
    jprms += '"outboundanumbertransforms":[';
    jprms += encode_transforms('transforms3');
    jprms += '],';
    jprms += '"outboundbnumbertransforms":[';
    jprms += encode_transforms('transforms4');
    jprms += ']';

    json_rpc_async('setObject', jprms, handler); 
};

function change_protocol(){
    var value = this.value || document.getElementById('protocols').value;
    if(value == 'h323') {
        document.getElementById('sip').parentNode.style.display = 'none';
        document.getElementById('h323').parentNode.style.display = '';
    }
    else if(value == 'sip'){
        document.getElementById('sip').parentNode.style.display = '';
        document.getElementById('h323').parentNode.style.display = 'none';
    }
};