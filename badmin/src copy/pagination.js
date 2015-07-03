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
            this.paginInfo.innerHTML = PbxObject.frases.FROM2.toLowerCase() + ' ' +
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