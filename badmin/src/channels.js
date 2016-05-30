function load_channels(result){
    // console.log(result);
    var row,
        table = document.getElementById('channels').getElementsByTagName('tbody')[0],
        // passReveal = [].slice.call(document.querySelectorAll('.password-reveal')),
        fragment = document.createDocumentFragment();

    // PbxObject.extensions = result;
    var channels = [];
    for(var i=0; i<result.length; i++){

        if(result[i].kind !== "channel") continue;
        row = createChannelRow(result[i]);
        fragment.appendChild(row);
        channels.push(result[i]);
    }
        
    table.appendChild(fragment);
    
    PbxObject.channels = channels;
    add_search_handler();
    show_content();

    addEvent(table, 'click', tableClickHandler);

    // $('[data-toggle="popover"]').popover({
    //     content: function(){
    //         return showParties(this);
    //     }
    // });
}

function tableClickHandler(e){
    var e = e || window.event,
        targ = e.target,
        cl;

    if(targ.nodeName !== 'BUTTON') targ = targ.parentNode;
    // if(targ.nodeName !== 'BUTTON') return;
    cl = targ.className;
    if(cl.indexOf('showPartiesBtn') != -1){
        showParties(targ);
    } else if(cl.indexOf('deleteObjBtn') != -1){
        delete_extension(e);
    }
}

function createChannelRow(data){
    var row = document.createElement('tr'),
        info = getInfoFromState(data.state, data.group),
        status = info.rstatus,
        classname = info.rclass,
        cell, a, newkind;

    cell = row.insertCell(0);
    if(data.oid){
        a = document.createElement('a');
        a.href = '#' + data.kind + '?' + data.oid;
        a.textContent = data.ext;
        cell.appendChild(a);
    } else {
        cell.textContent = data.ext;
    }
    
    cell = row.insertCell(1);
    cell.setAttribute('data-cell', 'name');
    cell.textContent = data.name || "";

    cell = row.insertCell(2);
    cell.setAttribute('data-cell', 'status');
    cell.textContent = status || "";

    cell = row.insertCell(3);
    cell.setAttribute('data-cell', 'parties');
    if(data.parties) cell.textContent = data.parties.length || '';

    cell = row.insertCell(4);
    button = createNewButton({
        type: 'popover',
        classname: 'btn btn-primary btn-sm showPartiesBtn',
        placement: 'left',
        // dataContent: ' ',
        dataTrigger: 'focus',
        content: '<i class="fa fa-user"></i>',
    });
    cell.appendChild(button);
    if(!data.parties) button.disabled = 'disabled';

    cell = row.insertCell(5);
    cell.innerHTML = '<a type="button" class="btn btn-primary btn-sm" href="#channel_records?'+data.oid+'"><i class="fa fa-history"></i></a>';

    cell = row.insertCell(6);
    if(data.oid) {
        button = createNewButton({
            title: PbxObject.frases.DELETE,
            classname: 'btn btn-danger btn-sm deleteObjBtn',
            content: '<i class="fa fa-trash"></i>',
        });
        cell.appendChild(button);
    }

    row.id = data.oid;
    row.setAttribute('data-ext', data.ext);
    row.className = classname;

    return row;
}

function showParties(targ){
    var row = getClosest(targ, 'tr'),
        channels = PbxObject.channels,
        cont = '', length, pts;

    channels.forEach(function(channel){
        if(channel.oid === row.id){
            pts = channel.parties;
            if(pts){
                length = pts.length;
                pts.sort();
                pts.forEach(function(party, index){
                    cont += party;
                    if(index != length-1) cont += ', ';
                });
            }
        }
    });
    targ.setAttribute('data-content', cont);
    $(targ).popover('toggle');
    // return cont;
}