// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

var resultsPerPage = 30;

var wikiSearchBaseUrl = symbianOrgBaseUrl + "/wiki/api.php?format=xml&action=query&list=search&srsearch=";
var wikiSearchOffsetQueryPart = "&sroffset=";
var wikiSearchLimitQueryPart = "&srlimit=";
var wikiSearchWhatQueryPart = "&srwhat=";

var wikiViewPageUrlBase = symbianOrgBaseUrl + "/wiki/index.php?title=";
var wikiPrintableParam = "&printable=yes";


//var wikiListCategoriesUrl = symbianOrgBaseUrl + "/wiki/api.php?format=xml&action=query&list=allcategories&aclimit=500&acprop=size";
//var wikiWatchListUrl = "http://en.wikipedia.org/w/api.php?action=query&list=watchlist&wlallrev&wlprop=ids|title|timestamp|user|comment";
//var wikiWatchListFeed = "/wiki/api.php?action=feedwatchlist&feedformat=rss";

var wikiSearchOptions = [
    { value: "title", text: "Search in title only" },
    { value: "text", text: "Full text search" },
];

function WikiHome (parent) {
	ListView.prototype.init.call(this, null, createCaption("Symbian Wiki"));	
	this.previousView = parent;

	this.wikiMainPageButton = new NavigationButton(1, "right.gif", "Browse: Main page");
	this.wikiSearchButton = new FormButton(null, "Search");
	this.wikiSearchSelection = new SelectionList(null, null, wikiSearchOptions, false, wikiSearchOptions[0]);
	this.wikiSearchString = new TextField('wikiSearchString', null, "");
	
	var self = this;
	
	this.wikiMainPageButton.addEventListener("ActionPerformed", function(){wikiBrowse("Main Page");});
	this.wikiSearchButton.addEventListener("ActionPerformed", function(){self.search(0);});

	this.addControl(this.wikiMainPageButton);
	this.addControl(new Label(null, "Search Wiki", null));
	this.addControl(this.wikiSearchString);
	this.addControl(this.wikiSearchSelection);
	this.addControl(this.wikiSearchButton);


//	wikiBrowseButton = new NavigationButton(1, "right.gif", "Browse categories");
//	wikiBrowseButton.addEventListener("ActionPerformed", function(){browseWikiCategories.show();});
//	this.addControl(wikiBrowseButton);

}

WikiHome.prototype = new ListView(null, null);
WikiHome.prototype.wikiMainPageButton = null;
WikiHome.prototype.wikiSearchButton = null;
WikiHome.prototype.wikiSearchString = null;
WikiHome.prototype.wikiSearchSelection = null;

var lastWikiSearchWasFrom = 0;
var lastWikiSearchResultCountWas = 0;

WikiHome.prototype.search = function(from) {
	lastWikiSearchWasFrom = from;
	var srstring = this.wikiSearchString.getText();
    var selectedTitleOrText = this.wikiSearchSelection.getSelected();
    var titleOrText = (selectedTitleOrText != null) ? selectedTitleOrText.value : "title";
	var url = this.formSearchUrl( srstring , from, resultsPerPage, titleOrText );
	var reader = new RssReader("Wiki: " + srstring, url, new WikiFeedPresenter(null), this, wikiResponseParser);
	reader.show();
}

WikiHome.prototype.formSearchUrl = function(query, offset, limit, what) {
	var buf = wikiSearchBaseUrl + query
	if (offset > 0) {
		buf += wikiSearchOffsetQueryPart + offset;
	}
	buf += wikiSearchLimitQueryPart + limit
	buf += wikiSearchWhatQueryPart + what;
	return buf;
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

// FeedPresenter implementation for wiki
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
		wiki.search(lastWikiSearchWasFrom + resultsPerPage);
	}
	else if (buttonid == "Previous page") {
		var from = lastWikiSearchWasFrom - resultsPerPage; 
		if ( from < 0 ) from = 0;
		wiki.search(from);
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
		var nextPageButton = new NavigationButton("Next page", "blueright.gif", "Next page");
		nextPageButton.addEventListener("ActionPerformed", function(event){ self.feedClicked(event); });
		this.rssreader.addControl(nextPageButton);
	}
	if (lastWikiSearchWasFrom > 0) {
		var prevPageButton = new NavigationButton("Previous page", "blueright.gif", "Previous page");
		prevPageButton.addEventListener("ActionPerformed", function(event) { self.feedClicked(event); });
		this.rssreader.addControl(prevPageButton);
	}
}


// /////////////////////////////////////////////////////////////////////////////////
// Browse / view wiki pages in 'printable format'
var wikiAjax;
var pageBeingShown;
function wikiBrowse(page) {
	pageBeingShown = page;
	uiManager.showNotification(-1, "wait", "Loading page...", -1);
	if ( page ) {
		wikiAjax = new Ajax();
	    
		wikiAjax.onreadystatechange = function() { wikiPageDownloadStateChanged(); };
		
		var url = wikiViewPageUrlBase  + encodeURIComponent(page) + wikiPrintableParam; 
	    // initiate the request
	    wikiAjax.open("GET", url, true);
	    wikiAjax.send(null);
	}
}

function wikiPageDownloadStateChanged() {
    if (wikiAjax.readyState == 4) {
		uiManager.hideNotification();
		var html = wikiAjax.responseText;
		var start = html.indexOf('<div id="bodyContent">');
		var end = findDivEnd(html, start);
		var pageView = new ListView(null, createCaption(pageBeingShown));
		var container = new TextPane(null, null, modWikiLinks(html.substring(start, end)));
		pageView.addControl(container);
		pageView.previousView = uiManager.currentView;
		pageView.show();
		if (window.widget) {
			widget.setNavigationEnabled(true);
		}
	}
}

function modWikiLinks(text) {
	var tmp = text.replace(/ src="/g, ' src="http://developer.symbian.org');
	// images sorted. now links
	var strToLookFor = ' href="/wiki/index.php/';
	var from = 0;
	var ind = tmp.indexOf(strToLookFor);
	var buf ="";
	while ( ind > 0 ) {
		buf = buf + tmp.substring(from, ind);
		// extract page name
		var ind2 = tmp.indexOf('"', ind + strToLookFor.length);
		var pageName = tmp.substring(ind + strToLookFor.length, ind2);
		buf += " style=\"text-decoration: underline;\" href=\"JavaScript:void(0)\" onclick=\"wikiBrowse('" + pageName + "'); return false;\"";
		from = ind2;
		ind = tmp.indexOf(strToLookFor, from);
	}
	buf = buf + tmp.substring(from);
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
