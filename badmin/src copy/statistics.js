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
        cont = document.getElementById('dcontainer'),
        inc = [].slice.call(cont.querySelectorAll('.data-model')),
        extStatKind = 'inbound',
        oid = PbxObject.oid,
        start, end, params,
        renewStat = true,
        renewLost = true,
        self = this;

    this._init = function(){
        picker = new Picker('statistics-date-picker', {submitFunction: self.getStatisticsData, buttonSize: 'md'});
        start = picker.date.start;
        end = picker.date.end;
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
        lostStatBtn.onclick = function(){
            if(lostStatBtn.getAttribute('data-state') !== 'shown'){
                lostStatBtn.setAttribute('data-state', 'shown');
                self._getLostStatisticsData();
            } else {
                lostStatBtn.setAttribute('data-state', 'hidden');
            }
        };

        switch_presentation(oid);
        set_page();
    };

    this.getStatisticsData = function(){
        $('#statistics-cont').addClass('faded');
        start = picker.date.start;
        end = picker.date.end;
        params = '\"begin\":'+start+', \"end\":'+end;
        json_rpc_async('getCallStatistics', params, function(result){
            self._setStatistics(result);
            $('#statistics-cont').removeClass('faded');
        });

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
            newCell.innerHTML = data[param] !== undefined ? (param === 'duration' ? formatTimeString(data[param], 'hh:mm:ss') : param === 'cost' ? data[param].toFixed(2) : data[param]) : '';
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