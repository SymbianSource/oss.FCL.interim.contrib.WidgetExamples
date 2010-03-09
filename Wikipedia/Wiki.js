// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////


var baseUrl = "http://en.wikipedia.org";

var wikiSearchBaseUrl = "/w/api.php?format=xml&action=query&list=search&srsearch=";
var wikiSearchOffsetQueryPart = "&sroffset=";
var wikiSearchLimitQueryPart = "&srlimit=";
var wikiSearchWhatQueryPart = "&srwhat=";

var wikiViewPageUrlBase = baseUrl + "/w/index.php?title=";
var wikiPrintableParam = "&printable=yes";

var MENU_ITEM_READER_SEARCH = 1;
var MENU_ITEM_HISTORY_CLEAR = 1;
var MENU_ITEM_BOOKMARKS_CLEAR = 1;
var MENU_ITEM_MAIN_BACK = 4;
var MENU_ITEM_MAIN_NEXT = 5;
var MENU_ITEM_MAIN_ADD_BOOKMARK = 6;
var MENU_ITEM_MAIN_NAVIGATION = 7;
var MENU_ITEM_MAIN_SEARCH = 8;
var MENU_ITEM_MAIN_BOOKMARKS = 9;
var MENU_ITEM_MAIN_HISTORY = 10; 
var MENU_ITEM_MAIN_LANGUAGE =11;
var MENU_ITEM_MAIN_UPDATES =12;
var MENU_ITEM_MAIN_HELP = 13;

var PREDICTIVE_RESULT_COUNT = 0;

//var wapediaArticleBase = "http://wapedia.mobi/en/";


//var wikiListCategoriesUrl = symbianOrgBaseUrl + "/wiki/api.php?format=xml&action=query&list=allcategories&aclimit=500&acprop=size";
//var wikiWatchListUrl = "http://en.wikipedia.org/w/api.php?action=query&list=watchlist&wlallrev&wlprop=ids|title|timestamp|user|comment";
//var wikiWatchListFeed = "/wiki/api.php?action=feedwatchlist&feedformat=rss";

var wikiSearchOptions = [
    { value: "title", text: "Search in title only" },
    { value: "text", text: "Full text search" },
];

function WikiHome () {
	RssReader.prototype.init.call(this,"Wikipedia", null /*url*/, new WikiFeedPresenter(null), null, wikiResponseParser);	

	this.wikiSearchButton = new FormButton(null, "Search");
	this.wikiSearchString = new TextField('wikiSearchString', null, "");

	var bookmarksButton = new NavigationButton(null, "next.png", "Bookmarks");
	var historyButton = new NavigationButton(null, "next.png", "History");
	var languageButton = new NavigationButton(null, "next.png", "Language");

	var self = this;
	bookmarksButton.addEventListener("ActionPerformed", function(){wikiBookmarksView.previousView = self; wikiBookmarksView.show();});
	historyButton.addEventListener("ActionPerformed", function(){wikiHistoryView.previousView = self; wikiHistoryView.show();});
	languageButton.addEventListener("ActionPerformed", function(){languageSelectView.previousView = self; languageSelectView.show();});
	
//	this.wikiSearchString.addEventListener("KeyPressed", function(){self.predictiveSearch(0);});
	this.wikiSearchButton.addEventListener("ActionPerformed", function(){self.search(0);});

	this.addControl(new Label(null, "Search Wiki", null));
	this.addControl(this.wikiSearchString);
	this.addControl(this.wikiSearchButton);
	this.addControl(bookmarksButton);
	this.addControl(historyButton);
	this.addControl(languageButton);
	k.known();
}


WikiHome.prototype = new RssReader();
WikiHome.prototype.wikiMainPageButton = null;
WikiHome.prototype.wikiSearchButton = null;
WikiHome.prototype.wikiSearchString = null;
WikiHome.prototype.wikiSearchSelection = null;
WikiHome.prototype.predictiveTimer = null;

var lastWikiSearchWasFrom = 0;
var lastWikiSearchResultCountWas = 0;

WikiHome.prototype.search = function(from) {
	try {
		lastWikiSearchWasFrom = from;
		var srstring = this.wikiSearchString.getText();
		var url = this.formSearchUrl(srstring, from, resultsPerPage);
		var reader = new RssReader("Wiki: " + srstring, url, new WikiFeedPresenter(null), this, wikiResponseParser);
		reader.show();
	}catch (X) { alert(X);}
}

WikiHome.prototype.predictiveSearch = function(from){
	if ( this.predictiveTimer != null ) {
		clearInterval(this.predictiveTimer);
	}
	var self = this;
	this.predictiveTimer = setInterval(function() {self.doPredictiveSearch(from), 1000}); 
}

WikiHome.prototype.doPredictiveSearch = function(from) {
	if ( this.feedUpdateBroker != undefined && this.feedUpdateBroker != null ) {
		this.feedUpdateBroker.cancel();
	}
	lastWikiSearchWasFrom = from;
	var srstring = this.wikiSearchString.getText();
	if (srstring.length <= 1) {
		return;
	}
	var url = this.formSearchUrl( srstring , from, resultsPerPage );
	this.feedURL = url;
	this.update(true, false);
}


WikiHome.prototype.formSearchUrl = function(query, offset, limit) {
	var buf = baseUrl + wikiSearchBaseUrl + query
	if (offset > 0) {
		buf += wikiSearchOffsetQueryPart + offset;
	}
	buf += wikiSearchLimitQueryPart + limit;
	return buf;
}

// abstract function for updating per-view menu
// only called if window.widget is defined
WikiHome.prototype.setupMenu = function(){
	if ( window.widget ) {
		menu.clear();
		var self = this;
		var searchMenuItem = new MenuItem("Search", MENU_ITEM_MAIN_SEARCH); 
		searchMenuItem.onSelect = function(){wikiHomeView.show();};
		menu.append(searchMenuItem);
		var historyMenuItem = new MenuItem("History", MENU_ITEM_MAIN_HISTORY); 
		historyMenuItem.onSelect = function(){wikiHistoryView.previousView = self; wikiHistoryView.show();};
		menu.append(historyMenuItem);
		var bookmarksMenuItem = new MenuItem("Bookmarks", MENU_ITEM_MAIN_BOOKMARKS); 
		bookmarksMenuItem.onSelect = function(){wikiBookmarksView.previousView = self; wikiBookmarksView.show();};
		menu.append(bookmarksMenuItem);
		
		addHelpMenuItems();		
	}
}

WikiHome.prototype.focusFirst = function(){
	// don't change focus - this is predictive search so stick with text field
}

WikiHome.prototype.show = function(){
	View.prototype.show.call(this);
	if (window.widget) {
		widget.setNavigationEnabled(true);
	}
}


// force right soft key to display "Exit" command
//WikiHome.prototype.setupSoftKeys = function()  {
//    if (window.widget) {
//		alert("WikiHome.prototype.setupSoftKeys");
//		menu.setRightSoftkeyLabel();
//	}
//}


// //////////////////////////////////////////////////////////////
// Article view
function WikiListView(caption){
	ListView.prototype.init.call(this, null, null);	
	caption = uniDecode(caption); // can be encoded unicode 
	var caption = new NavigationButton(1, "titlebar.png", shorten(caption, 30), true);
	caption.addEventListener("ActionPerformed", function(){wikiHomeView.show();});
	this.addControl(caption);
	this.useHistoryForBackButton = 1; // used internally to identify the type 
}

WikiListView.prototype = new ListView(null,null);


WikiListView.prototype.setupMenu = function () {
	if ( window.widget ) {
		menu.clear();
		var self = this;
		
		var searchMenuItem = new MenuItem("Search", MENU_ITEM_READER_SEARCH); 
		searchMenuItem.onSelect = function(){wikiHomeView.show();};
		menu.append(searchMenuItem);

		var bookmarkMenuItem = new MenuItem("Add bookmark", MENU_ITEM_MAIN_ADD_BOOKMARK); 
		bookmarkMenuItem.onSelect = function(){wikiBookmarksView.addItem(pageBeingShown, pageBeingShownContent, pageBeingShownBase);};
		menu.append(bookmarkMenuItem);

		var backMenuItem = new MenuItem("Back", MENU_ITEM_MAIN_BACK);
		backMenuItem.onSelect = function(){self.goBack();};
		menu.append(backMenuItem);

		if (wikiHistoryView.hasNext()) {
			var forwardMenuItem = new MenuItem("Forward", MENU_ITEM_MAIN_NEXT);
			forwardMenuItem.onSelect = function(){wikiHistoryView.go(1);};
			menu.append(forwardMenuItem);
		}
		
		var historyMenuItem = new MenuItem("History", MENU_ITEM_MAIN_HISTORY); 
		historyMenuItem.onSelect = function(){wikiHistoryView.previousView = self; wikiHistoryView.show();};
		menu.append(historyMenuItem);

		var bookmarksMenuItem = new MenuItem("Bookmarks", MENU_ITEM_MAIN_BOOKMARKS); 
		bookmarksMenuItem.onSelect = function(){wikiBookmarksView.previousView = self; wikiBookmarksView.show();};
		menu.append(bookmarksMenuItem);

		addHelpMenuItems();
		
	}

}

WikiListView.prototype.show = function(){
	View.prototype.show.call(this);
	if (window.widget) {
		widget.setNavigationEnabled(true);
	}
}

WikiListView.prototype.setupPreviousView = function() {
	if ( uiManager.currentView.useHistoryForBackButton != undefined ) {
		this.useHistoryForBackButton = true;
		// this signals to uiManager that we want a back button.
		// actual value is not used because useHistoryForBackButton = true
		this.previousView = wikiHistoryView;
	} else {
		this.useHistoryForBackButton = false;
		this.previousView = uiManager.currentView;
	}
}

WikiListView.prototype.goBack = function() {
	if (this.useHistoryForBackButton) {
		wikiHistoryView.go(-1);
	} else {
		View.prototype.goBack.call(this);
	}
}


// /////////////////////////////////////////////////////////////////////////////
// RssReader customisations

// response parser for forum groups
function wikiResponseParser(broker, responseStatus, xmlDoc) {
    if (responseStatus == 200 && xmlDoc != null) {
		// for compatibility with rss
		var lastModified = new Date();
		
        // init result items array
        var items = [];

		var elements = xmlDoc.getElementsByTagName("p");

		for (var i = 0; i < elements.length; i++) {
			var pagetitle = elements[i].getAttribute("title");
            items.push({ id: ""+i, title: pagetitle});
		}

		lastWikiSearchResultCountWas = elements.length;
        // update was completed successfully
        return { status: "ok", lastModified: lastModified, items: items };
    } else {
        // update failed
        return { status: "error" };
    }
}



// ////////////////////////////////////////////////////////////////////////////
// FeedPresenter implementation for full search results view
function WikiFeedPresenter(rssreader){
	if (rssreader) {
		this.init(rssreader);
	}
}

// WikiFeedPresenter is a subclass of ButtonFeedPresenter
WikiFeedPresenter.prototype = new ButtonFeedPresenter(null);

// WikiFeedPresenter "Constructor"
WikiFeedPresenter.prototype.init = function(rssreader) {
	ButtonFeedPresenter.prototype.init.call(this, rssreader);
}

// Handle the click on a specific item
WikiFeedPresenter.prototype.feedClicked = function(event){
	var buttonid = event.source.id;
	
	if (buttonid == "Next page") {
		wikiHomeView.search(lastWikiSearchWasFrom + resultsPerPage);
	}
	else if (buttonid == "Previous page") {
		var from = lastWikiSearchWasFrom - resultsPerPage; 
		if ( from < 0 ) from = 0;
		wikiHomeView.search(from);
	}
	else {
		// show article
		var title = this.items[buttonid].title;
		wikiBrowse(title);
	}
}

// Create and add controls to be shown before items list.
WikiFeedPresenter.prototype.addFooterItems = function(){
    var self = this;
	if (lastWikiSearchResultCountWas == resultsPerPage) {
		var nextPageButton = new NavigationButton("Next page", "next.png", "Next page");
		nextPageButton.addEventListener("ActionPerformed", function(event){ self.feedClicked(event); });
		this.rssreader.addFeedItemControl(nextPageButton);
	}
	if (lastWikiSearchWasFrom > 0) {
		var prevPageButton = new NavigationButton("Previous page", "prev.png", "Previous page");
		prevPageButton.addEventListener("ActionPerformed", function(event) { self.feedClicked(event); });
		this.rssreader.addFeedItemControl(prevPageButton);
	}
}


// /////////////////////////////////////////////////////////////////////////////////
// Browse / view wiki pages in 'printable format'
var wikiAjax;
var pageBeingShown;
var pageBeingShownBase;
var pageBeingShownContent;
var gDontAddToHistory;
var wikiBrowseCancelled = false;
var gViewCache = new ViewCache(10);

function wikiBrowse(page, dontAddToHistory, baseUrl) {
	pageBeingShown = page;
	if ( baseUrl != undefined && baseUrl != null ){
		pageBeingShownBase = baseUrl;
	} else {
		pageBeingShownBase = wikiViewPageUrlBase;
	}
	//alert("page=" + pageBeingShown + ", baseUrl=" + pageBeingShownBase);
	if ( dontAddToHistory != undefined || dontAddToHistory == true) {
		gDontAddToHistory = true;
	} else {
		gDontAddToHistory = false;
	}
	wikiBrowseCancelled = false;
	var t = page.replace(/_/g, ' ');
	var v = gViewCache.getView(t);
	if ( v != undefined && v != null ) {
		v.setupPreviousView();
		v.show();
		return;
	}
	try {
		pageBeingShownContent = null;
		uiManager.showNotification(-1, "wait", "Loading page...", -1);
		if (page) {
		
			wikiAjax = new Ajax();
			
			wikiAjax.onreadystatechange = function(){
				wikiPageDownloadStateChanged();
			};
			
			//		var url = wikiViewPageUrlBase  + encodeURIComponent(page) + wikiPrintableParam; 
			var url = pageBeingShownBase + encodeURIComponent(page) + wikiPrintableParam;
			//alert("url: " + url);
			//		var url = wapediaArticleBase + page 
			// initiate the request
			wikiAjax.open("GET", url, true);
			wikiAjax.send(null);
			
			if (window.widget) {
				menu.setRightSoftkeyLabel("Cancel", function(){
					wikiBrowseCancel();
				});
			}	
			
		}
	} catch(xx) { alert(xx);}
}

function wikiBrowseCancel() {
	wikiBrowseCancelled = true;
	wikiAjax.abort();
}

function wikiPageDownloadStateChanged() {
	if ( wikiBrowseCancelled ) {
		return;
	}
    if (wikiAjax.readyState == 4) {
		uiManager.hideNotification();
		try {
			showWikiPage(pageBeingShown, wikiAjax.responseText);
		}catch(xx) { alert(xx);}
	}
}

function showWikiPage(title, html){
	// ensure no underscores
	title = title.replace(/_/g, ' ');
	title = uniDecode(title);
	pageBeingShown = title;
	pageBeingShownContent = html;
	if (false == gDontAddToHistory) {
		wikiHistoryView.addItem(title, html, pageBeingShownBase);
	}
	var start = html.indexOf('<div id="bodyContent">');
	var end = findDivEnd(html, start);
	var pageView = new WikiListView(pageBeingShown);
	var text = html.substring(start, end);
//	text = stripExtStyle(text);
//	text = modWikiBox(text, 'class="box"');
//	text = modWikiBox(text, 'class="vertical-navbox');
//	text = modWikiBox(text, 'class="infobox"');
	text = stripStylesFromTag(text, "table", "box"); 
	text = stripStylesFromTag(text, "table", "infobox"); 
	text = stripStylesFromTag(text, "table", "navbox"); 
	text = stripStylesFromTag(text, "table", "vertical-navbox"); 
	text = stripStylesFromTag(text, "div", "thumbinner");
	// replace inline float: right;
	text = text.replace(/float: right|float:right/g, "clear:both; width: 95%; display:block");
	text = text.replace(/clear:right|clear: right/g, "");
	text = modWikiLinks(text);
	
	var docModel = ParseIntoDocModel(text);
	var preamble = new ContentPanel(null, "Overview", docModel.preface, true, true);
	pageView.addControl(preamble);
	for (var i = 0; i < docModel.sections.length; i++) {
		if ( docModel.sections[i].caption == "Contents" ) {
			continue;
		}
		var control = new ContentPanel(
			null, 
			docModel.sections[i].caption, 
			docModel.sections[i].content, 
			true, false); // foldable & expanded
		pageView.addControl(control);
	}
	pageView.setupPreviousView();
	gViewCache.addView(title,pageView);
	pageView.show();
}

// ///////////////////////////////////////////////////////////////////////
// Parsing and modding HTML to fit

function modWikiLinks(text) {
//	var tmp = text;//.replace(/ src="/g, ' src="http://www.wikipedia.org');
	// images sorted. now links
	var tmp = text.replace(/65em/g, '100%');
	var strToLookFor = ' href="/wiki/'; //index.php/';

//	var tmp = text.replace(/ src="/g, ' src="http://wapedia.mobi');
//	// images sorted. now links
//	var strToLookFor = ' href="/en/';

	var from = 0;
	var ind = tmp.indexOf(strToLookFor);
	var buf ="";
	while ( ind > 0 ) {
		buf = buf + tmp.substring(from, ind);
		// extract page name
		var ind2 = tmp.indexOf('"', ind + strToLookFor.length);
		var pageName = tmp.substring(ind + strToLookFor.length, ind2);
		buf += " style=\"text-decoration: underline;\""
		buf += " href=\"JavaScript:void(0)\"";
		buf += " onclick=\"event.stopPropagation();wikiBrowse(uniDecode('" + pageName.replace(/'/g, "\'") + "')); return false;\"";
		from = ind2;
		ind = tmp.indexOf(strToLookFor, from);
	}
	buf = buf + tmp.substring(from);
	return buf; 
}

function stripExtStyle(text) {
	var ret = text.replace(/style=\".+?\"/g, "");
	return ret;
}

function stripStylesFromTag(text, tag, style) {
	var key = "<" + tag + " ";
	var ind = text.indexOf(key);
	if ( ind == -1 ) return text;
	var buf = "";
	var prevind = 0;
	while(ind != -1 ) {
		var ind2 = text.indexOf(">", ind);
		if ( ind2 == -1 ) {
			// something's wrong, return unedited
			return text; 
		}
		var tag = text.substring(ind, ind2+1);
		if ( style != undefined ) {
			if ( tag.indexOf(style) != -1 ) {
				tag = stripExtStyle(tag);
			}
		} else {
			tag = stripExtStyle(tag);
		}
		buf += text.substring(prevind, ind);
		buf += tag;
		prevind = ind2+1;
		ind = text.indexOf(key, prevind );
	}
	buf += text.substring(prevind);
	return buf;
}

function findDivEnd(text, from) {
	var openDivCount = 1;
	var divind = text.indexOf("<div", from+1);
	var cdivind = text.indexOf("</div", from+1);
	var pos = from;
	while ( openDivCount > 0 && divind > 0 && cdivind > 0 ) {
		pos = Math.min(divind, cdivind);
		if ( pos == divind ) {
			openDivCount ++;
		}
		if ( pos == cdivind ) {
			openDivCount --;
		}
		divind = text.indexOf("<div", pos+1);
		cdivind = text.indexOf("</div", pos+1);
	}
	return pos;
}



function DocModel(){
	this.preface = null;
	this.sections = new Array();
}


function DocSection(caption, content) {
	this.caption = caption;
	this.content = content;
}


function ParseIntoDocModel(text) {
	var model = new DocModel(); 
	var ind = text.indexOf("<h2");
	if ( ind == -1 ) {
		model.preface = text;
		return model;
	}
	
	model.preface = text.substring(0,ind);
	while (ind > 0) {
		text = text.substring(ind);
		ind = 0;
		var ind2 = text.indexOf("</h2>");
		var caption = text.substring(ind+4, ind2);
		text = text.substring(ind2+5);
		ind = text.indexOf("<h2");
		var endind = ind;
		if ( endind == -1 ) {
			endind = text.length-1;
		}
		var content = text.substring(0,endind);
		var section = new DocSection(caption, content);
		model.sections.push(section);
	}
	return model;
}







// also for vertical-navbox,
// clx = 'class="box"' 
//function modWikiBox(text, clx) {
//	var ind = text.indexOf(clx);
//	if ( ind == -1 ) return text;
//	var buf = "";
//	var prevind = 0;
//	while(ind != -1 ) {
//		var ind2 = text.lastIndexOf("<table ", ind);
//		if ( ind2 == -1 ) {
//			// something's wrong, return unedited
//			return text; 
//		}
//		var substr = text.substring(ind2+1, ind);
//		if (substr.indexOf(">") == -1 && substr.indexOf("<") == -1 ) {
//			// got it
//			buf += text.substring(prevind, ind2 + 7);
//		} else {
//			// not it
//			buf += text.substring(prevind, ind);
//		}
//		prevind = ind;
//		ind = text.indexOf(clx, prevind + 1);
//	}
//	buf += text.substring(prevind);
//	return buf;
//}
//
//function modDivs(text, clx) {
//	var key = "<div " + clx;
//	var ind = text.indexOf(key);
//	if ( ind == -1 ) return text;
//	var buf = "";
//	var prevind = 0;
//	while(ind != -1 ) {
//		var ind2 = text.indexOf(">", ind);
//		if ( ind2 == -1 ) {
//			// something's wrong, return unedited
//			return text; 
//		}
//		buf += text.substring(prevind, ind + key.length);
//		prevind = ind2;
//		ind = text.indexOf(key, prevind );
//	}
//	buf += text.substring(prevind);
//	return buf;
//}
//

