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
        insData, outsData, intsData, lostData, linesData, time, item,
        row, cell, a, picker, chartData, chartOpts;

    this.init = function(){
        var start, interval, params;
        picker = new Picker();
        start = picker.today();
        interval = 3600*1000;
        params = '\"begin\":'+start+', \"interval\":'+interval;

        json_rpc_async('getCallStatisticsGraph', params, function(result){
            self.createGraph(result);
        });
        this.update = setInterval(this.checkStates.bind(this), 1000);
        this.statUpdate = setInterval(this.updateStatistics.bind(this), 1800*1000);
        addEvent(window, 'hashchange', this.stopUpdate.bind(this));
    };

    this.checkStates = function(){
        sendData('getCurrentState', null, 6);
        sendData('getCurrentCalls', null, 5);
        // json_rpc_async('getCurrentCalls', null, this.setCurrentCalls.bind(this));
        // json_rpc_async('getCurrentState', null, this.setCurrentState.bind(this));

        // console.log('update');
    };

    this.updateStatistics = function(){
        var start, interval, params;
        picker = new Picker();
        start = picker.today();
        interval = 3600*1000;
        params = '\"begin\":'+start+', \"interval\":'+interval;

        json_rpc_async('getCallStatisticsGraph', params, function(result){
            self.createGraph(result);
        });
    };

    this.setCurrentState = function(result){
        // console.log(loaded);
        if(loaded === false){
            show_content();
            loaded = true;
            // console.log(loaded);
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
                if(ttrunks.rows[i].cells[5].textContent != trunks[i].address)
                    ttrunks.rows[i].cells[5].textContent = trunks[i].address;
            } else{
                row = ttrunks.insertRow(i);
                
                cell = row.insertCell(0);
                cell.className = className;

                cell = row.insertCell(1);

                if(trunks[i].type === 'system') {
                    cell.innerText = trunks[i].name;
                } else {
                    a = document.createElement('a');
                    a.href = '#trunk?'+trunks[i].oid;
                    a.textContent = trunks[i].name;
                    cell.appendChild(a);
                }

                cell = row.insertCell(2);
                cell.textContent = trunks[i].in;

                cell = row.insertCell(3);
                cell.textContent = trunks[i].out;

                cell = row.insertCell(4);
                cell.textContent = parseFloat(trunks[i].load).toFixed(1) + '%';

                cell = row.insertCell(5);
                cell.textContent = trunks[i].address;
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
                    tcalls.rows[i].cells[2].textContent = formatTimeString(result[i].time, 'hh:mm:ss');
            }
            else{
                row = tcalls.insertRow(i);
                
                cell = row.insertCell(0);
                cell.textContent = result[i].caller;

                cell = row.insertCell(1);
                cell.textContent = result[i].called;

                cell = row.insertCell(2);
                cell.textContent = formatTimeString(result[i].time, 'hh:mm:ss');
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
        clearInterval(this.update);
        clearInterval(this.statUpdate);
        removeEvent(window, 'hashchange', this.stopUpdate.bind(this));

    };

    this.createGraph = function(data){
        // console.log(data);
        if(!data.length){
            // var graph = document.getElementById('calls-graph');
            // graph.innerHTML = '<h2 class="back-msg">'+PbxObject.frases.STATISTICS.NO_DATA+'</h2>';
        }
        else {
            insData = []; outsData = []; intsData = []; lostData = []; linesData = []; time; item;
            for(var i=0, length = data.length; i<length; i++){
                item = data[i];
                time = item.t;
                insData.push([time, item.i]);
                outsData.push([time, item.o]);
                intsData.push([time, item.l]);
                lostData.push([time, item.m]);
                linesData.push([time, item.p]);
            }
            var barsOpts = {
                show: true,
                barWidth: 3600*1000,
                lineWidth: 0,
                // order: 1,
                fill: 0.7
                // fillColor: false
            };
            insAndLostData = [{
                label: PbxObject.frases.STATISTICS.CONNECTEDCALLS,
                stack: 0,
                bars: barsOpts,
                data: insData,
                color: "#3c763d"
            }, {
                label: PbxObject.frases.STATISTICS.LOSTCALLS,
                stack: 0,
                bars: barsOpts,
                data: lostData,
                color: "#AA4643"
            }];
            outsData = [{
                label: PbxObject.frases.SETTINGS.OUTCALLS,
                bars: barsOpts,
                data: outsData,
                color: "#4572A7"
            }];
            intsData = [{
                label: PbxObject.frases.SETTINGS.INTCALLS,
                bars: barsOpts,
                data: intsData,
                color: "#BADABA"
            }];
            linesData = [{
                label: PbxObject.frases.STATISTICS.LINES_PAYLOAD,
                data: linesData,
                lines: {
                    show: true,
                    fill: false
                },
                points: {
                    show: true
                },
                // yaxis: 2,
                color: "#3c763d"
            }];
            chartOpts = {
                xaxis: {
                    mode: "time",
                    timeformat: '%H:%M',
                    timezone: 'browser',
                    tickSize: 0,
                    tickLength: 0 // hide gridlines
                },
                yaxis: {
                    min: 0,
                    tickFormatter: function (val) {
                        return val.toFixed(1);
                    }
                },
                grid: {
                    margin: 0,
                    hoverable: true,
                    borderWidth: 0,
                    color: '#ccc'
                },
                legend: false,
                tooltip: true,
                tooltipOpts: {
                    content: '%x <br> %s: %y.1',
                    yDateFormat: "%H:%M"
                }
            };
            $.plot($("#outCalls-graph"), outsData, chartOpts);
            $.plot($("#inAndLost-graph"), insAndLostData, chartOpts);
            $.plot($("#intCalls-graph"), intsData, chartOpts);
            $.plot($("#linesLoad-graph"), linesData, chartOpts);

            addEvent(window, 'resize', self.resizeChart);
            addEvent(window, 'hashchange', function(){
                removeEvent(window, 'resize', self.resizeChart);
            });
        }
    };

    this.resizeChart = function(){
        $.plot($("#outCalls-graph"), outsData, chartOpts);
        $.plot($("#inAndLost-graph"), insAndLostData, chartOpts);
        $.plot($("#intCalls-graph"), intsData, chartOpts);
        $.plot($("#linesLoad-graph"), linesData, chartOpts);
    };

    this.init();

}

function load_calls(){
    PbxObject.CallsBoard = new CallsBoard();
}