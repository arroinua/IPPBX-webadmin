function load_channel_records() {
	
	// PbxObject.chrecPicker = new Picker('chrecs-date-picker', {submitFunction: getChannelData, actionButton: true, buttonSize: 'md'});
	ChannelRecords();
	show_content();
}

function ChannelRecords(){

	PbxObject.ChannelPlayer = PbxObject.ChannelPlayer || new ChannelPlayer({ audio: document.getElementById('channel-audiorec') });

	var player = PbxObject.ChannelPlayer,
		dateFrom = document.getElementById('date-from'),
		dateTo = document.getElementById('date-to'),
		recsNum = document.getElementById('cpl-recs'),
		eventsNum = document.getElementById('cpl-events'),
		downloadLink = document.getElementById('cpl-download'),
		onlineEventsCont = document.getElementById('online-events-cont'),
		offlineEventsCont = document.getElementById('offline-events-cont'),
		rangeEventsCont = document.getElementById('range-events'),
		eventsCont = document.getElementById('channel-events'),
		onlineEvents = document.getElementById('online-events'),
		stateCont = document.getElementById('channel-state'),
		fileTime = document.getElementById('cpl-time'),
		fileDuration = document.getElementById('cpl-duration'),
		currentFile = document.getElementById('cpl-currentFile'),
		currentTrack = document.getElementById('cpl-currentTrack'),
		playBtn = document.getElementById('cpl-play'),
		seek = document.getElementById('cpl-seek'),
		controls = document.getElementById('cpl-controls'),
		submitBtn = document.getElementById('cpl-submit-btn'),
		eventsView = document.getElementById('events-view');
		combined = [],
		begin = moment().subtract(30, 'minutes'),
		end = moment(),
		lastEvents = [];
		onlineElements = {};
		// combined = combineChannelData(data.records, data.events),


	$('#channel-player-cont').affix({
		offset: {
			top: 200
		}
	});

	rome(dateFrom, { initialValue: begin });
	rome(dateTo, { initialValue: end });

	initChannelPlayerEvents();
	getChannelData({  begin: begin.valueOf(), end: end.valueOf() });

	function getChannelData(params){
		var reqParams = {
			oid: window.location.hash.substr(window.location.hash.indexOf('?')+1),
			begin: params.begin,
			end: params.end
		},
		data = {};

		json_rpc_async('getChannelRecords', reqParams, function(records) {
			data.records = records;
			json_rpc_async('getChannelEvents', reqParams, function(events) {
				data.events = events;
				$(document).trigger('channelRecords:data', [data]);
			});
		});
	}

	function getChannelState(time){
		json_rpc_async('getChannelState', {oid: window.location.hash.substr(window.location.hash.indexOf('?')+1), time: time}, function(result) {
			$(document).trigger('channelRecords:state', [result]);
		});
	}

	function onNewData(e, data){

		recsNum.innerText = data.records.length;
		eventsNum.innerText = data.events.length;

		combined = combineChannelData(data.records, data.events);

		if(!combined.length) return;
		
		// Init player
		clearTable(rangeEventsCont);
		lastEvents = [];
		addEventsTo(data.events, rangeEventsCont);
		initPlayer(combined);
	}

	function onNewEvent(e, data){
		if(lastEvents.indexOf(data.channelEvent.timecode) !== -1) return;
		lastEvents.push(data.channelEvent.timecode);
		addEventsTo([data.channelEvent], eventsCont);
		triggerOnlineEvent(data.channelEvent);

	}

	function selectEvent(e, data){
		[].forEach.call(rangeEventsCont.children, function(item){
			if(parseInt(item.getAttribute('data-event'), 10) === data.channelEvent.timecode) item.classList.add('list-group-item-success');
			else item.classList.remove('list-group-item-success');
		});
	}

	function onChannelState(e, data){
		clearTable(eventsCont);
		clearTable(onlineEvents);
		onlineElements = {};
		lastEvents = [];

		addEventsTo(data, eventsCont);
		data.forEach(triggerOnlineEvent);
	}

	function addEventsTo(data, cont){
		var fragment = document.createDocumentFragment();
		data.forEach(function(item) {
			fragment.insertBefore(addEventRow(item), fragment.firstChild);
		});
		cont.insertBefore(fragment, cont.firstChild);
	}

	function addEventRow(params, state){
		var li = document.createElement('li');
			icon = document.createElement('i'),
			user = document.createElement('span'),
			evt = document.createElement('span'),
			time = document.createElement('span');

		li.className = 'list-group-item';
		li.setAttribute('data-event', params.timecode);

		icon.className = 'fa fa-fw fa-'+getIconFromState(params.event);
		user.innerText = params.user+' ';
		evt.innerText = PbxObject.frases.CHANNEL_EVENTS[params.event.toString()];
		time.innerText = moment(params.timecode).format('DD/MM/YY HH:mm:ss');
		time.className = 'pull-right';

		li.appendChild(icon);
		li.appendChild(user);
		li.appendChild(evt);
		li.appendChild(time);

		return li;
	}

	function createOnlineEventRow(params, state){
		var li = document.createElement('li');
			user = document.createElement('span'),
			// evt = document.createElement('span'),
			// time = document.createElement('span');

		li.className = 'list-group-item';
		li.setAttribute('data-event', params.timecode);
		user.innerText = params.user+' ';
		// evt.innerText = PbxObject.frases.CHANNEL_EVENTS[params.event.toString()];
		// time.innerText = moment(params.timecode).format('DD/MM/YY HH:mm:ss');
		// time.className = 'pull-right';

		li.appendChild(user);
		// li.appendChild(evt);
		// li.appendChild(time);

		return li;
	}

	function triggerOnlineEvent(evt){
		var el;
		if(!onlineElements[evt.user]) {
			el = createOnlineEventRow(evt);
			onlineEvents.appendChild(el);
			onlineElements[evt.user] = el;
		}

		el = $(onlineElements[evt.user]);

		if(evt.event === 25) {
			el.show();
		} else if(evt.event === 26) {
			el.hide();
		} else if(evt.event === 27) {
			el.remove();
			$(onlineEvents).prepend(el);
			el.addClass('list-group-item-success');
		} else if(evt.event === 28) {
			el.removeClass('list-group-item-success');
		} else if(evt.event === 29) {
			el.addClass('list-group-item-danger');
		} else if(evt.event === 30) {
			el.removeClass('list-group-item-danger');
		}
	}

	function onPlaying(e, data){

		if(data.trackIndex === 0 && !player.audio.currentTime) getChannelState(Math.floor(data.track.timecode+data.currentTime));
		
		currentFile.innerText = data.track.file;
		currentTrack.innerText = data.trackIndex+1;
		playBtn.innerHTML = '<i class="fa fa-fw fa-pause"></i>';
		// fileDuration.textContent = formatTimeString(parseInt(data.duration, 10), 'hh:mm:ss');
	}

	function onPause(){
		playBtn.innerHTML = '<i class="fa fa-fw fa-play"></i>';
	}

	function onSeeked(e, data){
		getChannelState(Math.floor( data.track.timecode + (data.currentTime || 0) ));
	}

	function onSeekedClick(e){
		var currentTime = (player.duration * ((e.offsetX || e.layerX) / seek.clientWidth)).toFixed(2);
		playByCurrentTime(currentTime);
	}

	function onInit(e, data){
		var lastTrack = data.playlist[data.playlist.length-1],
		lastts = lastTrack.timecode + lastTrack.duration*1000;
		fileDuration.textContent =  moment(lastts).format('DD/MM/YY HH:mm:ss');
	}

	function onTrackChange(e, data){
		// getChannelState(data.track.timecode);
		downloadLink.href = data.src;
		downloadLink.setAttribute('download', data.src);
	}

	function onEventClick(e){
		var targ = e.target, timecode;
		if(targ.nodeName === 'span') targ = targ.parentNode;
		timecode = targ.getAttribute('data-event');
		playByTimecode(timecode);
	}

	function clickHandler(e){
		var evt = e || window.event,
			targ = evt.target;
		if(targ.nodeName === 'I') targ = targ.parentNode;
		if(targ.id === 'cpl-play') player.play();
		if(targ.id === 'cpl-stop') player.stop();
		if(targ.id === 'cpl-prev') player.prev();
		if(targ.id === 'cpl-next') player.next();
	}

	function initChannelPlayerEvents(){
		$(document).on('player:init', onInit);
		$(document).on('player:seeked', onSeeked);
		$(document).on('player:timeupdate', setProgress);
		$(document).on('player:timeupdate', updateProgress);
		$(document).on('player:playing', onPlaying);
		$(document).on('player:pause', onPause);
		$(document).on('player:next', onSeeked);
		$(document).on('player:prev', onSeeked);
		$(document).on('player:ended', onPlayEnded);
		$(document).on('player:trackchange', onTrackChange);
		$(document).on('channelRecords:data', onNewData);
		$(document).on('channelRecords:event', onNewEvent);
		$(document).on('channelRecords:event', selectEvent);
		$(document).on('channelRecords:state', onChannelState);
		$(document).on('channelRecords:viewchange', onViewChange);
		addEvent(controls, 'click', clickHandler);
		addEvent(seek, 'click', onSeekedClick);
		addEvent(submitBtn, 'click', function(e) {
			getChannelData({ begin: moment(dateFrom.value).valueOf(), end: moment(dateTo.value).valueOf() });
		});
		addEvent(eventsView, 'change', function(e) {
			$(document).trigger('channelRecords:viewchange', [{ online: this.checked }]);
		});
		addEvent(rangeEventsCont, 'click', onEventClick);
		addEvent(eventsCont, 'click', onEventClick);
	}

	function initPlayer(data){
		player.playlist = data;
		player.duration = (data[data.length-1].timecode + data[data.length-1].duration*1000 - data[0].timecode)/1000;
		player.init().playTrack();
	}

	function setProgress(e, data){
		var seekValue = data.currentTime === 0 ? 0 : Math.floor((100 / data.duration) * data.currentTime);
		seek.value = seekValue;
	}

	function updateProgress(e, data){
		var firstEventTimecode = data.track.timecode,
			currTs = firstEventTimecode + player.audio.currentTime*1000;
			// currTs = firstEventTimecode + data.currentTime*1000;
		
		getCurrEvents(combined[data.trackIndex].events, currTs);

		fileTime.textContent = moment(currTs).format('DD/MM/YY HH:mm:ss');
	}

	function playByCurrentTime(currentTime){
		var ts = combined[0].timecode + currentTime*1000;
		combined.forEach(function(item, index, array) {
			// if(ts >= item.timecode && ts < array[index+1].timecode) {
			if(ts >= item.timecode && ts < item.timecode+item.duration*1000) {
				player.playTrack(index, (ts-item.timecode)/1000);
			}
		});
	}

	function playByTimecode(ts){
		combined.forEach(function(item, index, array) {
			if(ts >= item.timecode && ts < array[index+1].timecode) {
				player.playTrack(index, (ts-item.timecode)/1000);
			}
		});
	}

	function onPlayEnded(e, data){
		player.playTrack(player.trackIndex+1);
	}

	function onViewChange(e, mode){
		if(mode.online) {
			offlineEventsCont.classList.add('hidden');
			onlineEventsCont.classList.remove('hidden');
		} else {
			offlineEventsCont.classList.remove('hidden');
			onlineEventsCont.classList.add('hidden');
		}
	}

	function getIconFromState(state){
		var icon = '';
		switch (state) {
			case 25:
				icon = 'rss';
				break;
			case 26:
				icon = 'sign-out';
				break;
			case 27:
				icon = 'microphone';
				break;
			case 28:
				icon = 'microphone-slash';
				break;
			case 29:
				icon = 'close';
				break;
			case 30:
				icon = 'check';
				break;
		}
		return icon;
	}

	function getCurrEvents(events, ts){
		var timeSeconds = Math.floor(ts/1000);
		events.forEach(function(item){
			if(timeSeconds === Math.floor(item.timecode/1000))
				$(document).trigger('channelRecords:event', [{ channelEvent: item, timeSeconds: timeSeconds }]);
		});
	}

	function combineChannelData(records, events){
		var newArray = [], eventIndex = 0;

		function insertEvents(record) {
			var recLastTs = record.timecode + record.duration*1000;

			record.events = [];

			for (var i = eventIndex; i < events.length; i++) {
				if(events[i].timecode <= recLastTs) {
					record.events.push(events[i]);
				} else {
					eventIndex = i;
					break;
				}
			}
			return record;
		}

		for (var i = 0; i < records.length; i++) {
			newArray.push(insertEvents(records[i]));
		}

		return newArray;
	}	
}

