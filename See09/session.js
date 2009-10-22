// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

// Session class is used to encapsulate all session data
function Session(){
	this.date = null;
	this.location = null;
	this.startTime = null;
	this.endTime = null;
	this.topic = null;
	this.chair = null;
	this.speakers = null;
	this.title = null;
	this.description = null;
}

Session.prototype.GetContentHTML = function () {
	var buf = "<small><i>" + this.startTime + " - " + this.endTime;
	if ( this.location ) {
		buf += ", " + this.location;
	}
	buf += "</i>";
	var haschair = false;
	if ( this.chair && this.chair != null && this.chair.length > 0 ) {
		var ch = this.chair.replace(/<br>/g, ", ");
		buf += "<br><b>Chair: " + ch + "</b>";
		haschair = true;
	}
	if (this.speakers && this.speakers != null && this.speakers.length > 0) {
		buf += "<b>, "
		if ( haschair ) {
			buf += "Speakers: ";
		}
		// remove nasty newlines
		var spk = this.speakers.replace(/<br>/g, ", ");
		buf += spk + "</b>";
	}
	buf += "<br>" + this.description + "</small>";
	return buf;
}


// Used when parsing to assign a value by ordinal
Session.prototype.SetFieldByOrdinal = function(ordinal, val) {
	switch(ordinal) {
		case 0: this.date = val; break;
		case 1: this.location = val; break;
		case 2: this.startTime = val; break;
		case 3: this.endTime = val; break;
		case 4: this.topic = val; break;
		case 5: this.chair = val; break;
		case 6: this.speakers = val; break;
		case 7: this.title = val; break;
		case 8: this.description = val; break;
	}
}

Session.prototype.GetNumberOfFields = function () {
	return 9;
}

Session.prototype.GetStartUtc = function(){
	return this.GetUtcTime(this.date, this.startTime);
}

Session.prototype.GetEndUtc = function(){
	return this.GetUtcTime(this.date, this.endTime);
}

Session.prototype.GetUtcTime = function(dateString, timeString){
	// make a date, then we'll mod it
	var d = new Date();
	// dateString is in the format DD-mmm-YY
	var parts = dateString.split("-");
	d.setFullYear(parseInt(parts[2]) + 2000);
	d.setDate(parseInt(parts[0]));
	d.setMonth(indexOfMonth(parts[1]));
	// time is in the format HH:MM
	parts = timeString.split(":");
	d.setHours(parseInt(parts[0]));
	d.setMinutes(parseInt(parts[1]));
	// convert to msec since Jan 1 1970
	var localTime = d.getTime();
	// obtain local UTC offset and convert to msec
	var localOffset = d.getTimezoneOffset() * 60000;
	// obtain UTC time in msec
	return localTime + localOffset;
}

function indexOfMonth(m){
	switch(m.toLowerCase()) {
		case "jan": return 1;
		case "feb": return 2;
		case "mar": return 3;
		case "apr": return 4;
		case "may": return 5;
		case "jun": return 6;
		case "jul": return 7;
		case "aug": return 8;
		case "sep": return 9;
		case "oct": return 10;
		case "nov": return 11;
		case "dec": return 12;
	}
}
