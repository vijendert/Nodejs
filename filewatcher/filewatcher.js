/**
 * http://usejsdoc.org/
 */
var fs = require('fs');
var events = require('events');
var util = require('util');
var watchFolder = 'watch';
var processedFolder = 'processed';
function Watcher(watched, processed) {
	this.watchFolder = watched;
	this.processedFolder = processed;
}

util.inherits(Watcher, events.EventEmitter);
/*
 * So this method will read dir from the provided directory folder
 * Then emit each file in process event
 */
Watcher.prototype.watch = function() {
	var watcher = this;
	fs.readdir(watcher.watchFolder, function(err, files) {
		if (err) {
			throw err;
		}
		for ( var index in files) {
			watcher.emit('process', files[index]);
		}
	});
};

Watcher.prototype.start = function() {
	// here we will have fs watchFile method which will look for changes
	var watcher = this;
	fs.watchFile(watcher.watchFolder, function() {
		watcher.watch();
	});
};

var watcherUtil = new Watcher(watchFolder, processedFolder);

watcherUtil.on('process', function(file) {
	var watch = this.watchFolder + '/' + file;
	var dest = this.processedFolder + '/' + file.toLowerCase();
	fs.rename(watch, dest, function(err) {
		if (err) {
			throw err;
		}

	});
});

watcherUtil.start();
