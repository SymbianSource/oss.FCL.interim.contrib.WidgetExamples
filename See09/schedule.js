// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

// The Schedule class is used to load, keep and filter sessions   
function Schedule() {
	this.callBackFunction = null;
	this.sessions = null;
	this.topics = new Array( "Main Stage", "Application Development", "Open Source Business Models", "Device Creation and Contributing to Symbian", "Hands-on Lab 1", "Hands-on Lab 2", "Birds of a Feather" );
	this.scheduleFileName = null;
	this.http = null;
	this.parseCounter = 0;
	this.rawData = null;
}

// Kick off loading
Schedule.prototype.Init = function(csvfile, cbfunc){
	this.callBackFunction = cbfunc;
	this.scheduleFileName = csvfile;
	var self = this;
	setTimeout( function() {self.Load();}, 100);
}

// 'public' functions 
Schedule.prototype.GetTopics = function() {
	return this.topics;
}

Schedule.prototype.GetSessions = function(topic, day) {
	var cnt = this.sessions.length;
	var ret = new Array();
	for( var i = 0; i < cnt ; i++ ) {
		var session = this.sessions[i];
		if ( session.topic == topic && day == session.date ) {
			ret.push(session);
		}
	}
	return ret;
}

Schedule.prototype.GetCurrentSessions = function() {
	var now = GetUtcTime(new Date());
	if ( ! this.sessions || this.sessions == null ) {
		return;
	}
	var cnt = this.sessions.length;
	var ret = new Array();
	for( var i = 0; i < cnt ; i++ ) {
		var session = this.sessions[i];
		var sessionStart = session.GetStartUtc();
		var sessionEnd = session.GetEndUtc();
		if( now > sessionStart && now < sessionEnd ) {
			ret.push(session);
		}
	}
	return ret;
}


// 'private' functions

// Loading and parsing
Schedule.prototype.Load = function(){
	// Prepare asynchronous download
	this.http = new Ajax();
	var self = this;
	this.http.onreadystatechange = function() { self.LoadComplete(); };
	this.http.open("GET", this.scheduleFileName, true); // false means synchronous
	this.http.send(null);
}
	
Schedule.prototype.LoadComplete = function() {
	// request complete?
    if (this.http.readyState == 4) {
		try {
			this.rawData = this.http.responseText;
			this.http = null; 
			// parse data
			this.sessions = new Array();
			this.Parse(); // Prepare and set the data for the parser.
		} 
		catch (x) {
			uiManager.showNotification(5000, "warning", "Error processing feed");
		}
	}
}

Schedule.prototype.Parse = function() {
	var session = new Session();
	var fieldCounter = 0;
	var fieldBuf = "";
	var quoted = false;
	for(; this.parseCounter < this.rawData.length; this.parseCounter++ ) {
		var ch = this.rawData.charAt(this.parseCounter);
		if ( !quoted && ( ch == ',' || ch == '\n') ) {
			session.SetFieldByOrdinal(fieldCounter++, fieldBuf);
			if (fieldCounter == session.GetNumberOfFields()) {
				this.AddSession(session);
				this.parseCounter++;
				var self = this;
				setTimeout(function(){self.Parse();}, 1);
				return;
			}
			fieldBuf = "";
		} else if ( ch == '"' ) {
			if (quoted) {
				if (this.parseCounter < this.rawData.length - 1 && this.rawData.charAt(this.parseCounter + 1) == '"') {
					// escaped quote, ignore this and next
					this.parseCounter++;
				} else {
					quoted = false;
				}
			} else {
				quoted = true;
			}
		} else if ( ch == '\r' ) {
			// ignore carriage return 
		} else if ( ch == '\n' ) { // quoted = true
			// replace newline with <br> 
			fieldBuf += "<br>";
		} else {
			fieldBuf += ch;
		}
	}
	this.Sort();
	if (this.callBackFunction) {
		this.callBackFunction.call();
	}
	uiManager.hideNotification();
}

Schedule.prototype.Sort = function (){
	// we get the schedule all messy so here we sort things out
	var cnt = this.sessions.length;
	for( var i = 0 ; i < cnt ; i++ ) {
		for( var j = i+1 ; j < cnt ; j++ ) {
			var si = this.sessions[i];
			var sj = this.sessions[j];
			if ( si.startTime > sj.startTime ) {
				// swap
				this.sessions[i] = sj;
				this.sessions[j] = si;
			}
		}	 
	}	 
}

Schedule.prototype.AddSession = function (session) {
	if ( ! session.topic || session.topic == null || session.topic.length == 0 ) {
		return;
	}
	// add to list of sessions
	this.sessions.push(session);
}

function trim(text) {
	return text;
}


function GetUtcTime(d){
	// convert to msec since Jan 1 1970
	var localTime = d.getTime();
	// obtain local UTC offset and convert to msec
	var localOffset = d.getTimezoneOffset() * 60000;
	// obtain UTC time in msec
	return localTime + localOffset;
}