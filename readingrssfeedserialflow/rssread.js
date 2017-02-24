/**
 * http://usejsdoc.org/
 */
var request = require('request');
var htmlParser = require('htmlparser');
var fs = require('fs')
var tasks = [ checkListOfUrlFile, readFileAndGetUrl, downloadRssFile,
		parseRssFile ];
var dir = 'rss_urls.txt';

function next(err, result) {
	if (err)
		throw err;
	var task = tasks.shift();
	console.log("Task ");
	task(result);
}
next();

function checkListOfUrlFile(result) {
	fs.exists(dir, function(exists) {
		if (!exists)
			return next(new Error("File does not exist"), null);
		next(null, dir);
	});
}

function readFileAndGetUrl(result) {
	fs.readFile(result, function(err, data) {
		// here I need to put the
		if (err)
			return next(new Error("Something went wrong"), null);
		// regulr ecpresion stuff here
		var listOfUrls = data.toString().split("\n");
		console.log(listOfUrls);
		console.log("data currently is " + data.toString());
		// find a random url
		var index = Math.floor(Math.random() * listOfUrls.length);
		console.log(index);
		next(null, listOfUrls[index]);
	});
}
function downloadRssFile(result) {
	// here we use the request
	request({
		url : result
	}, function(err, resp, body) {
		if (err)
			return next(new Error("File does not exist"), null);
		if (resp.statusCode !== 200) {
			return next(new Error("Some error " + resp.statusCode), null);
		}
		next(null, body);
	});
}

function parseRssFile(result) {
	// here is the role of the parser
	// since this is rss feed
	console.log("result " + result);
	var rssHandler = new htmlParser.RssHandler();
	// using the handle get the parser
	var rssParser = new htmlParser.Parser(rssHandler);
	rssParser.parseComplete(result);
	console.log("rss handler giving lenght " + rssHandler.dom.items.length);
	if (!rssHandler.dom.items.length) {
		next(new Error("Some error in parsing"), null);
	}
	for ( var index in rssHandler.dom.items) {
		console.log("\n");
		console.log(rssHandler.dom.items[index].title);
	}
}
