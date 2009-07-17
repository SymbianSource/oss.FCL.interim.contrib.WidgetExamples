// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

var currentFontSize = 14;
var uiManager;
var home;
var mainView;
var osconIcalUrl = new Array();
var icalData = new Array();
var icalReader = new Array();
var osconDays = new Array();
var http;
var downloadDayIndex = -1;

// Called from the onload event handler to initialize the widget.
function init() {
	
	for (var i = 0; i < 5; i++) {
		var osconDay = new Date()
		osconDay.setFullYear(2009, 6, 20 + i);
		osconDays.push(osconDay);
		osconIcalUrl.push("OSCON200907" + (20+i) + ".ics");
		icalData.push(null);
		icalReader.push(null);
	}
	
    // set tab-navigation mode and show softkeys
    // (only if we are in the WRT environment)
    if (window.widget) {
		//create about menu
	
        widget.setNavigationEnabled(false);
        menu.showSoftkeys();
    }
	
	// create UI manager
	uiManager = new UIManager();

	home = new ListView(null,null);
	
	var homeViewImage = new ImageLabel(null, null, "oscon-home.png");
	// hack to center image
	homeViewImage.contentElement.style.textAlign = "center";
	home.addControl(homeViewImage);

	var homeViewImage2 = new ImageLabel(null, null, "logo.png");
	// hack to center image
	homeViewImage2.contentElement.style.textAlign = "center";
	home.addControl(homeViewImage2);
	
	mainView = new ListView(null, "<img src=oscon-home.png>");
	
	
	for (var i = 0; i < osconDays.length; i++) {
		var button = new NavigationButton(i, "day"+(i+1)+".png", dateToString(osconDays[i]));
		mainView.addControl(button);
		button.addEventListener("ActionPerformed", function(event){
			var clickedButton = event.source;
			var clickedId = clickedButton.id;
			showDay(clickedId, osconDays[clickedId], null);
			});
	}	
	
	home.previousView=mainView;
	home.show();
	
	uiManager.showNotification(-1, "wait", "Please wait...", -1);
	setTimeout(function(){	uiManager.hideNotification();mainView.show();}, 1000);
}


function showDay(dayIndex, date) {
	downloadDayIndex = dayIndex;
	if ( icalReader[dayIndex] == null ) {
		downloadIcalData(dayIndex);
	} else {
		showList(date, null);
	}
}

function downloadIcalData(dayIndex) {
	downloadDayIndex = dayIndex;
	uiManager.showNotification(-1, "wait", "Please wait...", -1);

	http = new Ajax();
    http.onreadystatechange = function() { downloadStateChanged(); };

    // initiate the request
    http.open("GET", osconIcalUrl[downloadDayIndex], true);
    http.send(null);
}

function downloadStateChanged(){
	// complete request?
    if (http.readyState == 4) {
        // attempt to get response status
        var responseStatus = null;
        try {
            responseStatus = http.status;
        } catch (noStatusException) {}
        
		// are we being prompted for login?
		icalData[downloadDayIndex] = http.responseText;
		try {
			dataAvailable(downloadDayIndex);
//			savePreferences();
		}catch(x) {
			uiManager.showNotification(5000, "warning", "Error processing feed");
		}
		downloadInProgress = false;
    }
}

function dataAvailable(downloadDayIndex){
	uiManager.showNotification(-1, "wait", "Parsing info...", -1);
	// parse iCal
	var reader = new iCalReader(); // Construction of the reader object.
	reader.prepareData(icalData[downloadDayIndex]); // Prepare and set the data for the parser.
	reader.parse(); // Parse the data.
	reader.sort(); // Sort the data.
	icalReader[downloadDayIndex] =  reader;
	showList(osconDays[downloadDayIndex], null);
	uiManager.hideNotification();
}

function showList(day, session) {
	var list = new ListView(null, "<img src=oscon-home.png>");
	if (day) {
		var button = new ImageLabel(null, dateToString(day), "day"+(downloadDayIndex+1)+".png");
		list.addControl(button);
	}
	if (session) {
		var button = new ImageLabel(null, sessionTimeToString(session) + ", " + dateToString(session) , "session.png");
		list.addControl(button);
	}
	
	var myCalReader = icalReader[downloadDayIndex];
	var events = myCalReader.getCalendar().getEvents(); // Get all events.
	var num = myCalReader.getCalendar().getNrOfEvents();

	var addedSessions = new Array();

	
	for(var i=0; i<num; i++) { // Loop through all events.
	
		var event = myCalReader.getCalendar().getEventAtIndex(i); // A single event.        
		
		// Get Javascript date for start and end time.
		var startDate = event.getStartDate();
		var altStartDate = null;
		try {
			altStartDate = event.getAltStartDate();
		} catch(z) {
			altStartDate = startDate; 
		}
		var timeZone = event.getTimeZone();
		
		if ( day ) {
			if ( ! dayMatches(day, startDate) ) {
				continue;
			} else {
				var haveit = false;
				// if session is not in already, add it
				for (var j = 0 ; j < addedSessions.length ; j++ ) {
					if ( sessionMatches(addedSessions[j], altStartDate ) ) {
						haveit = true;
						break;
					}
				}
				if (!haveit) {
					// add it
					addedSessions.push(altStartDate);
					var button = new NavigationButton(altStartDate.getTime(), "session.png", "Session @ "+ sessionTimeToString(altStartDate));
					button.addEventListener("ActionPerformed", function(event){
						var clickedButton = event.source;
						var clickedId = clickedButton.id;
						var ed = new Date();
						ed.setTime(clickedId);
						showList(null, ed);
					});
					list.addControl(button);
				}
				continue;
			}
		}
		else if ( ! sessionMatches(session, startDate) ) {
			continue;
		}


		// add events
		var endDate = event.getEndDate();
		var location = event.getProperty("LOCATION");
		var summary = event.getProperty("SUMMARY");
		var description = event.getProperty("DESCRIPTION");
		var url = event.getProperty("URL");

		var buf = "";
		buf += "<div class=\"FeedItemDate\">" ;
		if ( location != null ) {
			buf += location + ", ";
		}
		buf += sessionTimeToString(startDate) +"-" + sessionTimeToString(endDate) + " " + timeZone + "</div>";
		buf += "<div class=\"FeedItemDescription\">" + description + "</div>";
		if (url != null) {
	        buf += "<div class=\"FeedItemLink\">";
            buf += "<a href=\"JavaScript:void(0)\" onclick=\"openURL('" + url + "'); return false;\">";
            buf += "Read more...";
            buf += "</a>";
	        buf += "</div>";
		}
		
		var cp = new ContentPanel(null, null, null, true);

		// initialize feed item control
		cp.setCaption(summary);
		cp.setContent(buf);
		cp.setExpanded(false);
		list.addControl(cp); 	
	} // End for each event.
	list.previousView = uiManager.currentView;
	list.show();
}


// Loads widget preferences.
function loadPreferences() {
    if (window.widget) {
        // load settings from widget preferences store
        icalData = widget.preferenceForKey("icalData");
    }
}

// Loads widget preferences.
function savePreferences() {
    if (window.widget) {
        // save settings in widget preferences store
        widget.setPreferenceForKey(icalData, "icalData");
    }
}



function setDefaultFontSizeForScreenSize(){
	// first check if there is a preference present
    if (window.widget) {
		var saved = widget.preferenceForKey("fontsize");
		if ( widget.preferenceForKey("fontsize") ) {
			setCssBodyFontSize(parseInt(saved));
		}
		else {
			// no preference available, check screen size
			if (window.screen.width > 400 || window.screen.height > 400) {
				// hi res screen, use large font
				setCssBodyFontSize(18);
			}
			else {
				// lo res screen, use small font
				setCssBodyFontSize(14);
			}
		}
	}
}

function increaseFontSize(){
    if (window.widget) {
		setCssBodyFontSize(currentFontSize + 2);
	}
}

function decreaseFontSize(){
    if (window.widget) {
		if (currentFontSize > 4) {
			setCssBodyFontSize(currentFontSize - 2);
		}
	}
}

function setCssBodyFontSize(size) {
    if (window.widget) {
		currentFontSize = size;
		var sizestring = "" + size;
		document.body.style.fontSize = sizestring + "px";
		widget.setPreferenceForKey(sizestring, "fontsize");
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
