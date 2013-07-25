#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var using_URL = false;
var online_content = "";
var checks = "";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURLresolves = function(url) {
    var instr = url.toString();
    restler.get(instr).on('complete', function(result) {
	if (result instanceof Error) {
	            console.log("%s does not resolve. Exiting.", instr);
	            process.exit(1); 
	    } else {
		online_content = result;
		}
	});
    using_URL = true;
    return instr;
}

var cheerioHtmlFile = function(htmlfile) {
    if (using_URL)
	    return cheerio.load(htmlfile);
    else 
	    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var processOnlineContent = function() {
    if (online_content.length == 0) { 
	setTimeout(processOnlineContent, 2000);// try again in 2 sec
	} else {
	        var checkJson = checkHtmlFile(online_content, checks);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	    }
}


if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-U, --URL <file_URL>', 'URL index.html', clone(assertURLresolves), '')
        .parse(process.argv);
    if (using_URL) {
	//use async processing workaround
	checks = program.checks;
	processOnlineContent();
	} else {
	        var checkJson = checkHtmlFile(program.file, program.checks);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
