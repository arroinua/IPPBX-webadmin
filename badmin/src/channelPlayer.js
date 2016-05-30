function ChannelPlayer(params){
	'use strict';
	if(!params.audio) throw 'audio is undefined';
	this.audio = params.audio;
	this.path = window.location.protocol+'//'+window.location.host+'/records/' || params.path;
	this.playlist = params.playlist || [];
	this.trackIndex = 0;

	return this.initEvents();
}

ChannelPlayer.prototype = {

	initEvents: function(){
		addEvent(this.audio, "playing", function(e) {
			$(document).trigger('player:playing', [{ trackIndex: this.trackIndex, track: this.playlist[this.trackIndex], currentTime: this.audio.currentTime, duration: this.audio.duration }]);
		}.bind(this), true);

		addEvent(this.audio, 'loadedmetadata', function(e) {
			$(document).trigger('player:loadedmetadata', [{ trackIndex: this.trackIndex, track: this.playlist[this.trackIndex], duration: this.audio.duration }]);
		}.bind(this));

		addEvent(this.audio, "pause", function(e) {
			$(document).trigger('player:pause', [{ trackIndex: this.trackIndex, track: this.playlist[this.trackIndex] }]);
		}.bind(this), true);

		// addEvent(this.audio, "loadedmetadata", function(e) {
		// 	$(document).trigger('player:loadedmetadata', [{ trackIndex: this.trackIndex, track: this.playlist[this.trackIndex] }]);
		// }.bind(this), true);

		addEvent(this.audio, "seeked", function(e) {
			$(document).trigger('player:seeked', [{
				trackIndex: this.trackIndex,
				track: this.playlist[this.trackIndex],
				// duration: this.audio.duration,
				// currentTime: this.audio.currentTime,
				duration: (this.duration || this.playlist[this.trackIndex].duration),
				currentTime: (this.playlist[this.trackIndex].timecode - this.playlist[0].timecode)/1000 + this.audio.currentTime
			}]);
		}.bind(this), true);

		//set up event to update the progress bar
		addEvent(this.audio, "timeupdate", function(e) {
			$(document).trigger('player:timeupdate', [{
				trackIndex: this.trackIndex,
				track: this.playlist[this.trackIndex],
				// duration: this.audio.duration,
				// currentTime: this.audio.currentTime,
				duration: (this.duration || this.playlist[this.trackIndex].duration),
				currentTime: (this.playlist[this.trackIndex].timecode - this.playlist[0].timecode)/1000 + this.audio.currentTime
			}]);
		}.bind(this), true);

		// when playback completes
		addEvent(this.audio, "ended", function(e) {
			$(document).trigger('player:ended', [{ trackIndex: this.trackIndex, track: this.playlist[this.trackIndex], currentTime: this.audio.currentTime }]);
		}.bind(this), true);

		return this;
	},

	init: function(){
		$(document).trigger('player:init', [{ audio: this.audio, path: this.path, playlist: this.playlist, trackIndex: this.trackIndex, duration: this.duration }]);
		return this;
	},

	playTrack: function(trackIndex, currentTime){
		if(!this.playlist.length || trackIndex > this.playlist.length-1 || trackIndex < 0) return this;
		var track = this.playlist[trackIndex || this.trackIndex],
			src = this.path + track.file;
		
		if(trackIndex !== undefined) this.trackIndex = trackIndex;
		if(this.audio.src !== src) {
			this.audio.src = src;
			$(document).trigger('player:trackchange', [{ trackIndex: this.trackIndex, track: track, src: this.audio.src }]);
		}

		if(currentTime !== undefined) {
			this.audio.currentTime = currentTime;
		}
		console.log('play: ', trackIndex, currentTime);
		this.audio.play();
	},

	play: function(){
		if (this.audio.paused) {
		    this.audio.play();
		} else {
		    this.audio.pause();
		}

		return this;
	},

	stop: function(){
		this.audio.pause();
		this.trackIndex = 0;
		this.audio.currentTime = 0;

		return this;
	},

	next: function(){
		var trackIndex = this.trackIndex+1;

		this.audio.pause();
		this.audio.currentTime = 0;
		this.playTrack(trackIndex);

		$(document).trigger('player:next', [{ trackIndex: this.trackIndex, track: this.playlist[trackIndex] }]);

		return this;
	},

	prev: function(){
		var trackIndex = this.trackIndex-1;

		this.audio.pause();
		this.audio.currentTime = 0;
		this.playTrack(trackIndex);

		$(document).trigger('player:prev', [{ trackIndex: this.trackIndex, track: this.playlist[trackIndex] }]);

		return this;
	}

};