function load_reports(){
    new Reports();
}

function chartOptions(timeFormat) {
    // var timeFormat = (function(intr){
    //     return (intr == 'hour' ? "%H:%M" : (intr == 'day') ? "%d %b" : (intr == '1/2_hour') ? "%H:%M" : "%H:%M");
    // })(picker.intervalString);

    return {
        xaxis: {
            // min: new Date(picker.date.start).getTime(),
            // max: new Date(picker.date.end).getTime(),
            mode: "time",
            timeformat: timeFormat,
            timezone: 'browser',
            tickSize: 0,
            // tickSize: tickSize,
            // monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            monthNames: PbxObject.frases.MONTHS_SHORT,
            tickLength: 0, // hide gridlines
            // axisLabel: "hours",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
            axisLabelPadding: 15,
            color: "#555"
        },
        yaxes: {
            position: 0,
            tickFormatter: function (val) {
                return val.toFixed(1);
            },
            min: 0,
            axisLabel: PbxObject.frases.KINDS.calls,
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
            axisLabelPadding: 5,
            color: "#555"
        },
        grid: {
            hoverable: true,
            borderWidth: {
                top: 0,
                right: 0,
                bottom: 1,
                left: 1
            }
            // color: '#ccc'
        },
        legend: {
            labelBoxBorderColor: "none",
            noColumns: 5,
            position: "ne",
            margin: 0,
            labelFormatter: function(label, series) {
                return '<span class="chart-label">'+label+'</span>';
            }
        },
        tooltip: true,
        tooltipOpts: {
            content: '%x <br> %s: %y.2',
            yDateFormat: timeFormat
        }
    };
}

function Reports(){
    var loaded = false,
        inc = document.querySelectorAll('.calls-incoming'),
        out = document.querySelectorAll('.calls-outgoing'),
        conn = document.querySelectorAll('.calls-connected'),
        load = document.querySelectorAll('.calls-load'),
        self = this,
        row, cell, a, picker, chartData, chartOpts;

    this.init = function(){
        var start, end, interval, params;
        picker = new Picker('calls-date-picker', {submitFunction: self.getStatistics, interval: true, buttonSize: 'md'});
        start = picker.date.start;
        end = picker.date.end;
        interval = picker.interval;
        params = '\"begin\":'+start+', \"end\":'+end+', \"interval\":'+interval;

        json_rpc_async('getCallStatisticsGraph', JSON.parse(params), function(result){
            self.createGraph(result);
            show_content();
        });
    };

    this.getStatistics = function(){
        $('#reports-cont').addClass('faded');
        var start = picker.date.start,
            end = picker.date.end,
            interval = picker.interval,
            params = '\"begin\":'+start+', \"end\":'+end+', \"interval\":'+interval;
            
        json_rpc_async('getCallStatisticsGraph', JSON.parse(params), function(result){
            self.createGraph(result);
            $('#reports-cont').removeClass('faded');
        });
    };

    this.createGraph = function(data){
        if(!data.length){
            $("#outCalls-graph").html('<h3 class="text-muted">'+PbxObject.frases.STATISTICS.NO_DATA+'</h3>');
            $("#inAndLost-graph").html('<h3 class="text-muted">'+PbxObject.frases.STATISTICS.NO_DATA+'</h3>');
            $("#intCalls-graph").html('<h3 class="text-muted">'+PbxObject.frases.STATISTICS.NO_DATA+'</h3>');
            $("#linesLoad-graph").html('<h3 class="text-muted">'+PbxObject.frases.STATISTICS.NO_DATA+'</h3>');
            
            return;
            // var graph = document.getElementById('calls-graph');
            // graph.innerHTML = '<h2 class="back-msg">'+PbxObject.frases.STATISTICS.NO_DATA+'</h2>';
        }

        var insData = [], outsData = [], intsData = [], lostData = [], linesData = [], time, item;
        var tickSize = (picker.intervalString == '1/2_hour' || picker.intervalString == '1/4_hour') ? [] : [1, picker.intervalString];

        var timeFormat = (function(intr){
            return (intr == 'hour' ? "%H:%M" : (intr == 'day') ? "%d %b" : (intr == '1/2_hour') ? "%H:%M" : "%H:%M");
        })(picker.intervalString);

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
            barWidth: picker.interval,
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
            color: "#3c763d"
        }];
        chartOpts = {
            // series: {
            //     stack: 0,
            //     bars: {
            //         show: true,
            //         barWidth: picker.interval/4,
            //         lineWidth: 0,
            //         order: 1,
            //         fillColor: {
            //             colors: [{
            //                 opacity: 1
            //             }, {
            //                 opacity: 0.7
            //             }]
            //         }
            //     }
            // },
            xaxis: {
                // min: new Date(picker.date.start).getTime(),
                // max: new Date(picker.date.end).getTime(),
                mode: "time",
                timeformat: timeFormat,
                timezone: 'browser',
                tickSize: 0,
                // tickSize: tickSize,
                // monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                monthNames: PbxObject.frases.MONTHS_SHORT,
                tickLength: 0, // hide gridlines
                // axisLabel: "hours",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
                axisLabelPadding: 15,
                color: "#555"
            },
            yaxes: {
                position: 0,
                tickFormatter: function (val) {
                    return val.toFixed(1);
                },
                min: 0,
                axisLabel: PbxObject.frases.KINDS.calls,
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: "Verdana, Arial, Helvetica, Tahoma, sans-serif",
                axisLabelPadding: 5,
                color: "#555"
            },
            grid: {
                hoverable: true,
                borderWidth: {
                    top: 0,
                    right: 0,
                    bottom: 1,
                    left: 1
                }
                // color: '#ccc'
            },
            legend: {
                labelBoxBorderColor: "none",
                noColumns: 5,
                position: "ne",
                margin: 0
                // container: $('#calls-graph-labels')
            },
            tooltip: true,
            tooltipOpts: {
                content: '%x <br> %s: %y.2',
                yDateFormat: timeFormat
            }
            // colors: ["#3c763d", "#BADABA", "#4572A7", "#AA4643", "#555"]
        };

        var outCallsOpts = new chartOptions(timeFormat);
        outCallsOpts.legend.container = $('#outCalls-graph-lg');
        var inAndLostCallsOpts = new chartOptions(timeFormat);
        inAndLostCallsOpts.legend.container = $('#inAndLost-graph-lg');
        var intCallsOpts = new chartOptions(timeFormat);
        intCallsOpts.legend.container = $('#intCalls-graph-lg');
        var linesLoadOpts = new chartOptions(timeFormat);
        linesLoadOpts.legend.container = $('#linesLoad-graph-lg');

        $.plot($("#outCalls-graph"), outsData, outCallsOpts);
        $.plot($("#inAndLost-graph"), insAndLostData, inAndLostCallsOpts);
        $.plot($("#intCalls-graph"), intsData, intCallsOpts);
        $.plot($("#linesLoad-graph"), linesData, linesLoadOpts);
        // addEvent(window, 'resize', self.resizeChart);
    };

    this.init();
}