function Player(){
    var player,
        seek,
        time,
        play,
        dur,
        link,
        oAudio,
        trackIndex = 1,
        shown = false,
        controls,
        pbControl,
        currentFile = "",
    //display and update progress bar

    init = function(){
        // console.log('init');
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
        controls = document.getElementById('pl-controls');
        pbControl = document.getElementById('pl-pb-control');

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
            if(global.lastEl) global.lastEl.innerHTML = '<i class="fa fa-fw fa-pause"></i>';
        }, true);

        addEvent(oAudio, 'loadedmetadata', function() {
            dur.textContent = formatTimeString(parseInt(oAudio.duration), 'hh:mm:ss');
        });

        // //set up event to toggle play button to play when paused
        addEvent(oAudio, "pause", function() {
            play.innerHTML = '<i class="fa fa-fw fa-play"></i>';
            if(global.lastEl) global.lastEl.innerHTML = '<i class="fa fa-fw fa-play"></i>';
        }, true);
        //set up event to update the progress bar
        addEvent(oAudio, "timeupdate", progressBar, true);

        // when playback completes
        addEvent(oAudio, "ended", playTrack(trackIndex+1), true);

        //set up mouse click to control position of audio
        addEvent(seek, "click", function(e) {
            if (!e) e = window.event;
            oAudio.currentTime = (oAudio.duration * ((e.offsetX || e.layerX) / seek.clientWidth)).toFixed(2);
            // console.log('currentTime: '+oAudio.currentTime);
        }, true);
    },

    progressBar = function() {
        var percent = oAudio.currentTime === 0 ? 0 : Math.floor((100 / oAudio.duration) * oAudio.currentTime);
        time.textContent = formatTimeString(parseInt(oAudio.currentTime), 'hh:mm:ss');
        seek.value = percent;

        $(document).trigger('player:timeupdate', [{ time: oAudio.currentTime*1000, trackIndex: trackIndex }]);
    },

    playTrack = function(track) {
        if(!global.playlist.length || track <= 1 || track >= global.playlist.length) return;
        
        trackIndex = track;

        $(document).trigger('player:track', [{ track: trackIndex }]);

        oAudio.src = global.filePath + global.playlist[trackIndex-1].file;
        currentFile = global.playlist[trackIndex-1].file;
        link.href = oAudio.src;
        link.setAttribute('download', oAudio.src);
        oAudio.play();

        console.log('playTrack: ', trackIndex, global.playlist[trackIndex-1].file);
    },

    clickHandler = function(e){
        if(!e) e = window.event;
        var targ = e.target;
        if(targ.nodeName == 'I') targ = targ.parentNode;
        // console.log(targ);
        if(targ.id == 'pl-play') global.playAudio();
        if(targ.id == 'pl-stop') global.stopAudio();
        if(targ.id == 'pl-prev') global.prevAudio();
        if(targ.id == 'pl-next') global.nextAudio();
        if(targ.id == 'pl-close') close();
    },

    show = function(){
        player.classList.add('shown');
        shown = true;

        if(global.playlist.length) {
            controls.style.width = '475px';
            pbControl.classList.remove('hidden');
        }
    },

    close = function(){
        player.classList.remove('shown');
        global.stopAudio();
        shown = false;
    },

    template = function(){
        return (
            '<audio id="audio-rec" type="audio/x-wav; codecs=\'1\'"></audio>'+
            '<div class="pl-controls" id="pl-controls">'+
                '<a href="#" download="" class="pl-control bg-success pull-left" id="pl-download"><i class="fa fa-download"></i></a>'+
                '<button class="pl-control bg-primary pull-left" id="pl-play"><i class="fa fa-fw fa-play"></i></button>'+
                '<div id="pl-pb-control" class="hidden" style="display:inline;height: 100%;">'+
                    '<button class="pl-control bg-primary pull-left" id="pl-prev"><i class="fa fa-fw fa-backward"></i></button>'+
                    '<button class="pl-control bg-primary pull-left" id="pl-next"><i class="fa fa-fw fa-forward"></i></button>'+
                '</div>'+
                '<div class="pl-time"><span id="pl-time"></span>/<span id="pl-duration"></span></div>'+
                '<progress id="pl-seek" max="100" value="0" class-"pl-seek-bar"></progress>'+
                '<button class="pl-control bg-danger pull-right" id="pl-close"><i class="fa fa-fw fa-close"></i></button>'+
                '<button class="pl-control bg-primary pull-right" id="pl-stop"><i class="fa fa-fw fa-stop"></i></button>'+
            '</div>'
        );
    },

    global = {
        playlist: [],
        filePath: '',
        audioFile: '',
        audioURL: '',
        audio: oAudio,
        lastEl: null,
        playAudio: function() {
            if(shown === false)
                show();
            //Skip loading if current file hasn't changed.
            if (this.audioURL !== currentFile) {
                oAudio.src = this.filePath + this.audioURL;
                currentFile = this.audioURL;
                link.href = this.audioURL;
                link.setAttribute('download', this.audioFile);
            }
            console.log('playAudio: ', oAudio.src, currentFile);
            //Tests the paused attribute and set state. 
            if (oAudio.paused) {
                oAudio.play();
            } else {
                oAudio.pause();
            }
        },
        prevAudio: function() {
            this.stopAudio();
            playTrack(trackIndex-1);
        },
        nextAudio: function() {
            this.stopAudio();
            playTrack(trackIndex+1);
        },
        stopAudio: function() {
            oAudio.pause();
            oAudio.currentTime = 0;
        }
    };

    init();
    return global;
}