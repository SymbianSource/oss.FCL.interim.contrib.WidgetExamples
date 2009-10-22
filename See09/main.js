// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

var uiManager;
var homeView;
var mainView;
var scheduleView = null;
var twitterView = null;
var venueView = null;

var schedule;
var scheduleFile = "see09.csv";
var scheduleUrl;

var twitter;

// used as a title bar in all views
var header = "<img src=home.png>";


var day1 = "27-Oct-09";
var day2 = "28-Oct-09";
var showingDay = day1;


function ShowTopicView(topic) {
	var topicView = new ListView(null, header);
	var day = ( showingDay == day1 ) ? "day1": "day2";
	var titleButton = new NavigationButton(null, day+".png", "<b>" + topic + "</b>");
	//titleButton.setEnabled(false);
	topicView.addControl(titleButton);
	topicView.previousView = scheduleView;
	addSessions(topic, topicView);
	topicView.show();
}

function addSessions(topic, topicView) {
	var sessions = schedule.GetSessions(topic, showingDay);
	for ( var i = 0; i < sessions.length ; i++ ) {
		var session = sessions[i];
		var content = new ContentPanel(null, null, null, true);
		var contentHtml = session.GetContentHTML();
		// initialize feed item control
		var title = session.title;
		if ( title.length < 2 ) {
			title = session.chair;
			if (title.length < 2) {
				title = session.speakers;
			}
			title += "'s talk";
		}
		content.setCaption(session.startTime + ": " + title);
		content.setContent(contentHtml);
		content.setExpanded(false);		
		topicView.addControl(content);
	}
}

function ShowScheduleView(){
	scheduleView = new ListView(null, header);
	var title = ( showingDay == day1 ) ? "day1": "day2";
	var dayButton = new NavigationButton(null, "day-icon.png", "<img src="+title+".png border=0 align=center>");
	//dayButton.setEnabled(false);
	scheduleView.addControl(dayButton);
	scheduleView.previousView = mainView;
	// add 'general' sessions
	addSessions(schedule.topics[0], scheduleView);
	
	var trailsButton = new NavigationButton(null, "day-icon.png", "<img src=trailz.png border=0 align=center>");
	trailsButton.setEnabled(false);
	scheduleView.addControl(trailsButton);
	for ( var i = 1; i < schedule.topics.length ; i++ ) {
		var topic = schedule.topics[i];
		var scheduleButton = new NavigationButton(topic, "schedule-icon"+(i%4)+".png", topic);
		scheduleButton.addEventListener("ActionPerformed", function(event){
			var topic = event.source.id;
			ShowTopicView(topic);
		});
		scheduleView.addControl(scheduleButton);
	}
	scheduleView.show();
}


// Called when the data is loaded
function ShowMainView(){
	if (mainView == null) {
		UpdateMiniView();
		mainView = new ListView(null, header);
		var currentSessions = schedule.GetCurrentSessions();
		if (currentSessions != null) {
		// todo
		}
		
		var scheduleButton = new NavigationButton(null, "schedule-icon.png", "<img src='schedule.png' border=0>");
		scheduleButton.setEnabled(false);
		mainView.addControl(scheduleButton);
		var day1Button = new NavigationButton(null, "blank.png", "<img src=day1.png border=0 align=center>");
		day1Button.addEventListener("ActionPerformed", function(event){
			showingDay = day1;
			ShowScheduleView();
		});
		mainView.addControl(day1Button);
		var day2Button = new NavigationButton(null, "blank.png", "<img src=day2.png border=0 align=center>");
		day2Button.addEventListener("ActionPerformed", function(event){
			showingDay = day2;
			ShowScheduleView();
		});
		mainView.addControl(day2Button);
		
		venueView = new ListView(null, header);
		venueView.previousView = mainView;
		var venueMap = new ImageLabel(null, null, "venue.png");
		venueMap.contentElement.style.textAlign = "center";
		venueView.addControl(venueMap);
	
		var venueButton = new NavigationButton(null, "schedule-icon1.png", "<img src='venuelabel.png' border=0>");
		venueButton.addEventListener("ActionPerformed", function(event){
			venueView.show();
		});
		mainView.addControl(venueButton);
		
		twitterView.previousView = mainView;
		var twitterTitle = new NavigationButton(null, "tweetz-icon.png", "<img src='tweetz.png' border=0>");
		twitterTitle.addEventListener("ActionPerformed", function(event){
				if ( twitter == null ) {
					twitter = new Twitter(twitterView);
				}
				twitter.Update(10);
				twitterView.show();
				});
		mainView.addControl(twitterTitle);
//		twitter = new Twitter(mainView);
//		twitter.Update(10);
		mainView.previousView = null;
	}
	mainView.show();	
}

// Called from the onload event handler to initialize the widget.
function init() {
	
    if (window.widget) {
        widget.setNavigationEnabled(false);
        menu.showSoftkeys();
        var updateMenuItem = new MenuItem("Check for updates", 0);
        updateMenuItem.onSelect = CheckForUpdates;
        menu.append(updateMenuItem);
		setInterval("if ( IsHSViewMode() ) UpdateMiniView();", 30000); // wrt bug fix
    }
	
	// create UI manager
	uiManager = new UIManager(document.getElementById("main"));
	
	homeView = new ListView(null, "<img style='margin: 0px 0px; padding: 0px 0px; border: none' src='home.png'>");
	
	var homeViewImage2 = new ImageLabel(null, null, "logo.png");
	homeViewImage2.contentElement.style.textAlign = "center";
	homeView.addControl(homeViewImage2);
	
	setDefaultFontSizeForScreenSize();
	SetViewMode();
	homeView.show();

	twitterView = new ListView(null, "<img style='margin: 0px 0px; padding: 0px 0px; border: none' src='home.png'>");

	schedule = new Schedule();
	schedule.Init(scheduleFile, function(event){
		ShowMainView();
	});
	
//	if ( !window.widget ) {
//		// for firefox / firebug testing
//		CheckForUpdates();
//	}
	
}


// ////////////////////////////////////////////////////////////////
// Support for home screen view
// ////////////////////////////////////////////////////////////////
var HS_VIEW_THRESHOLD = 150;

function SetViewMode(){
	var mainDiv = document.getElementById("main");
	var miniDiv = document.getElementById("mini");
	var hsView = IsHSViewMode(); 
	if ( !hsView ) {
		// normal view		
		mainDiv.style.visibility = 'visible';
		miniDiv.style.visibility = 'hidden';
		miniDiv.style.position = 'static';
		miniDiv.style.top = null;
	}
	else {
		// home screen view
		mainDiv.style.visibility = 'hidden';
		miniDiv.style.visibility = 'visible';
		miniDiv.style.position = 'absolute';
		miniDiv.style.top = '0';
	}
	setDefaultFontSizeForScreenSize();
	UpdateMiniView();
}

function IsHSViewMode() {
	//var screenHeight = document.body.clientHeight;
	var screenHeight = window.innerHeight;
	//alert(screenHeight);
	return ( screenHeight < HS_VIEW_THRESHOLD );
}

function UpdateMiniView() {
	var text = "";
	var current;
	if (schedule) {
		current = schedule.GetCurrentSessions();
	}
	if ( current && current.length > 0 ) {
		text = "Now: " + current[0].title;
		if ( current.length > 1 ) {
			text += "<br>Now: " + current[1].title;
		}
	} else if( twitter && twitter.buttons && twitter.buttons.length > 0  ){
		text = twitter.buttons[0].getText();
	} else {
		text = "Symbian Exchange & Exposition 2009<br>Earls Court 2, 27-28 October 2009" 
	}
	var mini = document.getElementById("mini");
	mini.innerHTML = "<table border=0><tr><td><img src=minilogo.png></td><td><span style='font-size: 10px'>"+text+"</span></td></tr></table>";
}

