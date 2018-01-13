function today(date) {

    'use strict';

    var _date = date ? new Date(date) : new Date();
    var scope = {
        valueOf: valueOf,
        dateOf: dateOf,
        toStartOf: toStartOf,
        toEndOf: toEndOf,
        plus: plus,
        minus: minus
    };

    function valueOf() {
        return _date.valueOf();
    }

    function dateOf() {
        return _date;
    }

    function toStartOf(period) {
        if(period === 'month') {
            _date = new Date(_date.setDate(1));
        } else if(period === 'year') {
            _date = new Date(_date.setMonth(0,1));
        } else {
            _date = new Date(_date.setHours(0,0,0,1));
        }

        return scope;
    }

    function toEndOf(period) {
        if(period === 'month') {
            scope.toStartOf('month').plus(1, 'month').minus(1);
        } else if(period === 'year') {
            _date = new Date(_date.setMonth(11,31));
        } else {
            _date = new Date(_date.setHours(23,59,59));
        }

        return scope;
    }

    function plus(number, period) {
        if(!period) {
            _date = new Date(_date.setDate(_date.getDate() + number));
        } else if(period.match(/month|months/g)) {
            _date = new Date(_date.setMonth(_date.getMonth() + number));
        } else if(period.match(/year|years/g)) {
            _date = new Date(_date.setFullYear(_date.getFullYear() + number));
        }

        return scope;
    };

    function minus(number, period) {
        if(!period) {
            _date = new Date(_date.setDate(_date.getDate() - number));
        } else if(period.match(/month|months/g)) {
            _date = new Date(_date.setMonth(_date.getMonth() - number));
        } else if(period.match(/year|years/g)) {
            _date = new Date(_date.setFullYear(_date.getFullYear() - number));
        }

        return scope;
    };

    return scope;

 }