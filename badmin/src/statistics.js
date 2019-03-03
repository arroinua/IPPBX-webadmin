function load_statistics(){
    new Statistics();
}

function Statistics(){

    var picker,
        trtable = document.getElementById('trunks-statistics-table'),
        exttable = document.getElementById('ext-statistics-table'),
        extStatBtn = document.getElementById('ext-stats-btn'),
        btnGroup = document.getElementById('ext-stat-kind'),
        lostStatBtn = document.getElementById('lost-stats-btn'),
        trunksQosBtn = document.getElementById('trunks-qos-btn'),
        cont = document.getElementById('dcontainer'),
        inc = [].slice.call(cont.querySelectorAll('.data-model')),
        extStatKind = 'inbound',
        oid = PbxObject.oid,
        start, end, params,
        renewStat = true,
        renewLost = true,
        trunksQosOpened = false;
        self = this;

    function renderTrunksQosStat(data) {
        if(!data) return;
        ReactDOM.render(
            TrunksQosTable({
                frases: PbxObject.frases,
                data: data,
                utils: {
                    formatTimeString: formatTimeString
                }
            }),
            document.getElementById('trunks-qos-cont')
        );
    }

    function openTrunksQosStat() {
        if(trunksQosOpened) return false;
        trunksQosOpened = true;

        $('#trunks-qos-cont').addClass('faded');
        getTrunksQosData({ begin: picker.date.start,  end: picker.date.end }, function(data) {
            console.log('openTrunksQosStat data: ', data);
            renderTrunksQosStat(data);
            $('#trunks-qos-cont').removeClass('faded');
        });
    }

    function getTrunksQosData(params, callback){
        json_rpc_async('getTrunksStatistics', {
            begin: params.begin, 
            end: params.end
        }, callback);   
    }

    this._init = function(){
        picker = new Picker('statistics-date-picker', {submitFunction: self.getStatisticsData, interval: true, buttonSize: 'md'});
        start = picker.date.start;
        end = picker.date.end;
        interval = picker.interval;
        // params = '\"begin\":'+start+', \"end\":'+end;

            
        json_rpc_async('getCallStatistics', { begin: start, end: end }, self._setStatistics);
        json_rpc_async('getCallStatisticsGraph', { begin: start, end: end, interval: interval }, self._setCharts);

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
        lostStatBtn.onclick = function(){
            if(lostStatBtn.getAttribute('data-state') !== 'shown'){
                lostStatBtn.setAttribute('data-state', 'shown');
                self._getLostStatisticsData();
            } else {
                lostStatBtn.setAttribute('data-state', 'hidden');
            }
        };

        trunksQosBtn.onclick = openTrunksQosStat;

        switch_presentation(oid);
        set_page();
    };

    this.getColumns = function(data, colname, match, params) {
        // var columns = [];
        // var col = [];
        var col = [colname];
        var value = null;
        var convert = params ? params.convert : null;

        data.map(function(item) {
            for(var key in item) {
                if(key !== colname && (match ? match.indexOf(key) !== -1 : true)) {
                    value = item[key];
                    
                    if(convert === 'minutes') {
                        value = parseFloat(((value / 1000) / 60).toFixed(2));
                    }

                    col.push(value);
                }
            }

            // columns.push(col);
        }.bind(this));

        return col;
        // return columns;
    };

    this.getStatisticsData = function(){
        var params = { begin: picker.date.start,  end: picker.date.end };

        $('#statistics-cont').addClass('faded');

        json_rpc_async('getCallStatistics', params, function(result){
            self._setStatistics(result);
            $('#statistics-cont').removeClass('faded');
        });

        json_rpc_async(
            'getCallStatisticsGraph', 
            { 
                begin: picker.date.start, 
                end: picker.date.end, 
                interval: picker.interval 
            }, 
            self._setCharts
        );

        getTrunksQosData(params, renderTrunksQosStat);

        renewStat = true;
        renewLost = true;
        if(extStatBtn.getAttribute('data-state') == 'shown')
            self._getExtStatisticsData();
        if(lostStatBtn.getAttribute('data-state') == 'shown')
            self._getLostStatisticsData();
    };

    this._getExtStatisticsData = function(){
        if(!renewStat) return;
        renewStat = false;
        $('#extStat-cont').addClass('faded');
        start = picker.date.start;
        end = picker.date.end;
        params = '\"begin\":'+start+', \"end\":'+end+', \"kind\":"'+extStatKind+'"';
        // console.log(params);
        json_rpc_async('getCallStatisticsExt', params, function(result){
            self._setExtStatistics(result);
            $('#extStat-cont').removeClass('faded');
        });
    };

    this._getLostStatisticsData = function(){
        if(!renewLost) return;
        renewLost = false;

        $('#lostCalls-cont').addClass('faded');
        start = picker.date.start;
        end = picker.date.end;
        params = '\"begin\":'+start+', \"end\":'+end;
        // console.log(params);
        json_rpc_async('getLostCalls', params, function(result){
            self._setLostStats(result);   
            $('#lostCalls-cont').removeClass('faded');
        });
    };

    this._setStatistics = function(data) {
        var attr, value, chartData,
            newdata = data;

        newdata.inbounds.duration = formatTimeString(newdata.inbounds.duration, 'hh:mm:ss');
        newdata.outbounds.duration = formatTimeString(newdata.outbounds.duration, 'hh:mm:ss');
        newdata.internals.duration = formatTimeString(newdata.internals.duration, 'hh:mm:ss');
        if(newdata.outbounds.cost !== undefined) {
            newdata.outbounds.cost = parseFloat(newdata.outbounds.cost).toFixed(2);
        }

        inc.forEach(function(item){
            attr = item.getAttribute('data-model');
            if(attr == 'inbounds.lost'){
                if(newdata.inbounds.lost === 0) item.classList.remove('negtv-col');
                else item.classList.add('negtv-col');
            }
            var value = attr.split('.').reduce(objFromString, newdata);
            item.textContent = value;
        });
        // console.log(newdata.trunks);
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

    this._setLostStats = function(data){
        var tRows = document.createDocumentFragment(),
        tbody = document.getElementById('lost-calls-table').querySelector('tbody');
        for(var i=0; i<data.length; i++){
            tRows.appendChild(self._buildLostCallsTable(data[i]));
        }
        // console.log(data);
        tbody.appendChild(tRows);
    };

    this._setCharts = function(data) {

        var sameDay = moment(picker.date.start).isSame(picker.date.end, 'day');
        var dayDiff = moment(picker.date.end).diff(picker.date.start, 'day');
        var daily = picker.interval === 86400*1000;
        var tickFormat = "%d-%m-%Y";
        var showXAxis = isSmallScreen() ? false : ((dayDiff >= 7 && !daily) ? false : true);

        console.log('_setCharts:', picker, daily, sameDay, dayDiff);

        if(!daily) {
            if(sameDay) tickFormat = "%H:%M";
            else tickFormat = "%d-%m-%Y %H:%M";
        }

        // data = data.map(function(item) {
        //     item['s'] = item.i - item.m;
        //     return item;
        // });

        console.log('statistics charts data: ', data);

        var outChart = c3.generate({
            bindto: '#outbounds-chart',
            data: {
                x: 'intervals',
                columns: [
                    self.getColumns(data, 'intervals', ['t']),
                    self.getColumns(data, PbxObject.frases.SETTINGS.OUTCALLS, ['o']),
                ]
            },
            axis: {
                x: {
                    show: showXAxis,
                    type: 'timeseries',
                    tick: {
                        culling: { max: 7 },
                        format: tickFormat
                    }
                },
                y: {
                    min: 0
                }
            }
        });

        var insChart = c3.generate({
            bindto: '#inbounds-chart',
            data: {
                x: 'intervals',
                columns: [
                    self.getColumns(data, 'intervals', ['t']),
                    self.getColumns(data, PbxObject.frases.SETTINGS.INCALLS, ['i']),
                    self.getColumns(data, PbxObject.frases.STATISTICS.LOSTCALLS, ['m']),
                ],
                type: 'bar',
                groups: [[PbxObject.frases.SETTINGS.INCALLS, PbxObject.frases.STATISTICS.LOSTCALLS]]
            },
            axis: {
                x: {
                    show: showXAxis,
                    type: 'timeseries',
                    tick: {
                        culling: { max: 7 },
                        format: tickFormat
                    }
                },
                y: {
                    min: 0
                }
            }
        });

        var intsChart = c3.generate({
            bindto: '#internals-chart',
            data: {
                x: 'intervals',
                columns: [
                    self.getColumns(data, 'intervals', ['t']),
                    self.getColumns(data, PbxObject.frases.SETTINGS.INTCALLS, ['l']),
                ]
            },
            axis: {
                x: {
                    show: showXAxis,
                    type: 'timeseries',
                    tick: {
                        culling: { max: 7 },
                        format: tickFormat
                    }
                },
                y: {
                    min: 0
                }
            }
        });
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
            cell.textContent = data[i].cost !== undefined ? parseFloat(data[i].cost).toFixed(2) : '';
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
            newCell.innerHTML = data[param] !== undefined ?
                (param === 'duration' ?
                    formatTimeString(data[param], 'hh:mm:ss') : param === 'cost' ?
                        parseFloat(data[param]).toFixed(2) : data[param]) : '';
        }
    };

    this._buildLostCallsTable = function(data){
        var row = document.createElement('tr'),
            cell;

        cell = row.insertCell(0);
        cell.textContent = formatDateString(data.ts) || "";

        cell = row.insertCell(1);
        cell.textContent = data.na || "";
        
        cell = row.insertCell(2);
        cell.textContent = data.nb || "";

        cell = row.insertCell(3);
        cell.textContent = data.nc || "";

        cell = row.insertCell(4);
        cell.textContent = getFriendlyCodeName(data.cs) || "";

        return row;
    };

    this._init();
}