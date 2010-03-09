// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

// Reference to the WRTKit user interface manager and main view.
var uiManager;
var wikiHomeView;
var wikiHistoryView;
var wikiBookmarksView;
var languageSelectView;
var helpView;

// Update variables
var myversion = "1.0rc5";
var updateBaseUrl = "http://developer.symbian.org/wiki/" 
var versionWikiPageUrl = updateBaseUrl + "index.php/Wikipedia_Reader_Widget";
var versionWikiPageString = "Current widget version is [";
var downloadUrl = updateBaseUrl + "images/b/b3/Wikipedia.wgz";

var resultsPerPage = 10;

// we support variety of screen sizes and orientations
var portrait;
var touchscreen;
var miniview;

var initCalled = false;

// Called from the onload event handler to initialize the widget.
function init(){
	if (window.widget) {
		setInterval("Noop();", 10000);
	}
	try{
		doUiInit();
	} catch(x) {
		alert(x);
	}
}

function doUiInit(){
    // set tab-navigation mode and show softkeys
    // (only if we are in the WRT environment)
    if (window.widget) {
        widget.setNavigationEnabled(false);
        menu.showSoftkeys();
    }

    // create UI manager
	var elem = document.getElementById("uimandiv");
    uiManager = new UIManager(elem,null,true);

    // create main view
    wikiHomeView = new WikiHome();
	wikiHistoryView = new HistoryView();
	wikiHistoryView.previousView = wikiHomeView;
	wikiBookmarksView = new BookmarksView();
	wikiBookmarksView.previousView = wikiHomeView;

	initHelpView();
	initLanguageView();

	initCalled = true;
	setViewMode();
	
//	setupLog();
	restoreLanguage();
    // display the main view
	wikiHomeView.show();
}



function setViewMode() {
	if ( !initCalled ) return;
	portrait = window.innerWidth < window.innerHeight;
	touchscreen = Math.min(window.innerWidth,window.innerHeight) > 240;
	miniview = window.innerHeight < 150;
	if ( miniview ) {
		var main = document.getElementById("uimandiv");
		var mini = document.getElementById("minidiv");
		main.style.display = "none";
		mini.style.display = "";
	} else {
		// no preference available, check screen size
		if ( touchscreen ) {
			// hi res screen, use large font
			setLargeView();
		}
		else {
			// lo res screen, use small font
			setSmallView();
		}
		var main = document.getElementById("uimandiv");
		var mini = document.getElementById("minidiv");
		main.style.display = "";
		mini.style.display = "none";
	}
}

function setLargeView(){
	document.getElementById('stylesheet').href = 'WRTKit/Resources/UI-large.css';
//	setCssBodyFontSize(22);
}

function setSmallView(){
	document.getElementById('stylesheet').href = 'WRTKit/Resources/UI.css';
//	setCssBodyFontSize(14);
}

function Noop(){}


// /////////////////////////////////////////////////////////////////////////////////
// Help view setup

function showHelp(){
	helpView.show();
}


function initHelpView(){
	helpView = new ListView();
	var ajax = null;
	try {
		ajax = new Ajax();
		ajax.open("GET", "help.txt", true);
		ajax.onreadystatechange = function(){
			HelpLoadComplete(ajax);
		};
		ajax.send(null);
	} 
	catch (e) {
		alert(e);
	}
}

function HelpLoadComplete(ajax){
    if (ajax.readyState == 4) {
		var text;
		if (ajax == null || ajax.responseText == undefined || ajax.responseText == null) {
			text = "No help available.";
//			alert("responseText=" + ajax.responseText + ", responseXML=" + ajax.responseXml + ", status=" + ajax.status);
		}
		else {
			text = ajax.responseText;
		}
		var caption = new NavigationButton(1, "titlebar.png", "Help", true);
		caption.addEventListener("ActionPerformed", function(){
			wikiHomeView.show();
		});
		helpView.addControl(caption);
		var docModel = ParseIntoDocModel(text);
		var preamble = new TextPane(null, null, docModel.preface);
		helpView.addControl(preamble);
		for (var i = 0; i < docModel.sections.length; i++) {
			if (docModel.sections[i].caption == "Contents") {
				continue;
			}
			var control = new ContentPanel(null, docModel.sections[i].caption, docModel.sections[i].content, true, false); // foldable & expanded
			helpView.addControl(control);
		}
		
		helpView.previousView = wikiHomeView;
	}
}

function addHelpMenuItems(){
	var languageMenuItem = new MenuItem("Language", MENU_ITEM_MAIN_LANGUAGE);
	languageMenuItem.onSelect = selectLanguage;
	menu.append(languageMenuItem);
	var updateMenuItem = new MenuItem("Check for updates", MENU_ITEM_MAIN_UPDATES);
	updateMenuItem.onSelect = checkForUpdates;
	menu.append(updateMenuItem);
	var helpMenuItem = new MenuItem("Help", MENU_ITEM_MAIN_HELP);
	helpMenuItem.onSelect = showHelp;
	menu.append(helpMenuItem);
}

// ////////////////////////////////////////////////////////////////////////
// Language selection

function setLanguage(lang) {
	baseUrl = lang;
	wikiViewPageUrlBase = baseUrl + "/w/index.php?title=";
	uiManager.showNotification(1000, "info", "Language set");
	if ( window.widget ) {
		widget.setPreferenceForKey(lang, "language");
	}
	wikiHomeView.show();
}

function selectLanguage(){
	languageSelectView.previousView = uiManager.currentView;
	languageSelectView.show();
}

function restoreLanguage(){
	if (window.widget) {
		var lang = widget.preferenceForKey("language");
		if ( lang != undefined && lang != null ) {
			setLanguage(lang);
		}
	}

}
function initLanguageView(){
	languageSelectView = new ListView();
	var ajax = null;
	try {
		ajax = new Ajax();
		ajax.open("GET", "lang.txt", true);
		ajax.onreadystatechange = function(){
			LanguageLoadComplete(ajax);
		};
		ajax.send(null);
	} 
	catch (e) {
		alert(e);
	}
}

function LanguageLoadComplete(ajax){
    if (ajax.readyState == 4) {
		var text;
		if (ajax == null || ajax.responseText == undefined || ajax.responseText == null) {
			text = "Language list not available.";
//			alert("responseText=" + ajax.responseText + ", responseXML=" + ajax.responseXml + ", status=" + ajax.status);
		}
		else {
			text = ajax.responseText;
		}
		var caption = new NavigationButton(1, "titlebar.png", "Languages", true);
		caption.addEventListener("ActionPerformed", function(){
			wikiHomeView.show();
		});
		languageSelectView.addControl(caption);
		var docModel = ParseIntoDocModel(text);
		var preamble = new TextPane(null, null, docModel.preface);
		languageSelectView.addControl(preamble);
		for (var i = 0; i < docModel.sections.length; i++) {
			if (docModel.sections[i].caption == "Contents") {
				continue;
			}
			var control = new ContentPanel(null, docModel.sections[i].caption, docModel.sections[i].content, true, false); // foldable & expanded
			languageSelectView.addControl(control);
		}
		languageSelectView.show = function (){
				View.prototype.show.call(this);
				if (window.widget) {
					widget.setNavigationEnabled(true);
				} 
		}
		languageSelectView.previousView = wikiHomeView;
	}
}


// auto update code

var updatePageAjax = null;

function checkForUpdates() {
	uiManager.showNotification(-1, "wait", "Checking for updates...", -1);
	updatePageAjax = new Ajax();
	updatePageAjax.onreadystatechange = checkForUpdatesStage2;
	updatePageAjax.open('GET', nocache(versionWikiPageUrl), true);
	updatePageAjax.send(null);	
}

function checkForUpdatesStage2() {
    if (updatePageAjax.readyState == 4) {
		// extract version number
		var content = updatePageAjax.responseText;
		var ind = content.indexOf(versionWikiPageString);
		if ( ind == -1 ) {
			uiManager.showNotification(3000, "warning", "Update failed, check manually.");
			return;
		}
		ind += versionWikiPageString.length;
		var ind2 = content.indexOf("]",ind);
		if ( ind2 == -1 || (ind2-ind) > 10 ) {
			uiManager.showNotification(3000, "warning", "Update failed, check manually.");
			return;
		}
		var version = content.substring(ind,ind2);
		// compare to this version
		if ( version != myversion ) {
			var answer = confirm("Install version " + version + "?\nNote: Update will clear history and bookmarks.");
			if (answer) {
				// ok, we have the update
				uiManager.hideNotification();
				openURL(nocache(downloadUrl));
				setTimeout(function () {window.close();}, 1000);
			} else {
			uiManager.showNotification(3000, "info", "Update cancelled.");
			}
		} else {
			uiManager.showNotification(3000, "info", "Up to date!");
		}
	}
}
