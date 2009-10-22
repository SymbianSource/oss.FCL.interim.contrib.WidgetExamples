// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

// Loads widget preferences.
function loadPreferences() {
    if (window.widget) {
        // load settings from widget preferences store
        data = widget.preferenceForKey("data");
    }
}

// Loads widget preferences.
function savePreferences() {
    if (window.widget) {
        // save settings in widget preferences store
        widget.setPreferenceForKey(data, "data");
    }
}



function nocache(url) {
    if (url.indexOf("?") == -1) {
        url += "?";
    } else {
        url += "&";
    }
    url += "nocache=" + (new Date().getTime());
	return url;
}


function sessionMatches(session, startDate) {
	var m_date = session.getDate()==startDate.getDate();
	var m_year = session.getFullYear()==startDate.getFullYear();
	var m_month = session.getMonth()==startDate.getMonth();
	var m_hour = session.getHours()==startDate.getHours();
	var m_minute = session.getMinutes()==startDate.getMinutes();
	return m_date && m_month && m_year && m_hour && m_minute; 
}

function dayToString(day) {
	return day.toDateString(); 	
}

function dayMatches(day, startDate){
	var m_date = day.getDate()==startDate.getDate();
	var m_year = day.getFullYear()==startDate.getFullYear();
	var m_month = day.getMonth()==startDate.getMonth();
	return m_date && m_month && m_year; 
}

function sessionTimeToString(session) {
	return ""+session.getHours()+":"+pad(session.getMinutes(),2); 	
}

function dateToString(day) {
	var full = day.toDateString();
	// remove year as it doesn't fit on small screens
	return full.substring(0, full.length-4); 	
}

function pad(num, digits) {
	var str = "" + num;
	while ( str.length < digits ) {
		str = "0" + str;
	}
	return str;
}

// Opens a URL in a separate browser window
function openURL(url) {
    if (window.widget) {
        // in WRT
        widget.openURL(url);
    } else {
        // outside WRT
        window.open(url, "NewWindow");
    }
}

function setDefaultFontSizeForScreenSize(){
	// no preference available, check screen size
	if (window.innerWidth > 400 || window.innerHeight > 400) {
		// hi res screen, use large font
		setLargeView();
	}
	else {
		// lo res screen, use small font
		setSmallView();
	}
}

function setLargeView(){
	document.getElementById('stylesheet').href = 'WRTKit/Resources/UI-large.css';
}

function setSmallView(){
	document.getElementById('stylesheet').href = 'WRTKit/Resources/UI.css';
}

