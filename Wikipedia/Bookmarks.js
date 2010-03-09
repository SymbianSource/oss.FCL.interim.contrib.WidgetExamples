// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

var MILLIS_IN_A_DAY = 24*60*60*1000;

function BookmarksViewItem(articleTitle, articleContent, articleBase, pos) {
	var d = new Date();
	this.articleTitle = articleTitle;
	this.articleContent = articleContent; 
	this.pos = pos;
	this.articleBase = articleBase;
	this.timestamp = d.getTime();
}


function BookmarksView (){
	try {
		ListView.prototype.init.call(this, null, null);	
		var caption = new NavigationButton(1, "titlebar.png", "Bookmarks", true);
		caption.addEventListener("ActionPerformed", function(){wikiHomeView.show();});
		this.addControl(caption);
		this.previousView = null;
		this.items = new Array();
		this.startindex = 0;
		this.endindex = 0;
		this.rendered = false;	
		this.todayControl = null;
		this.loadItems();
	}catch(w) {alert(w);}
}

BookmarksView.prototype = new ListView(null, null);

BookmarksView.prototype.items = null;


BookmarksView.prototype.addItem = function(articleTitle, articleContent, articleBase){
	try {
		this.removeItem(articleTitle);
		this.rendered = false;
		var item = null;
		item = new BookmarksViewItem(articleTitle, null /*articleContent*/, articleBase, this.endindex);
		this.items[this.endindex - this.startindex] = item;
		this.endindex++;
		this.saveItem(item);
	}catch(w) { alert(w);}
}


BookmarksView.prototype.saveItem = function(item){
	if ( window.widget ) {
//		alert("BM: Saving item: pos=" + item.pos +", title=" + item.articleTitle +", ts=" + item.timestamp
//		+ "titlekey:" + getBookmarksTitleKey(item.pos) + ", timekey: " + getBookmarksTimeKey(item.pos)	);

		widget.setPreferenceForKey(item.articleTitle, getBookmarksTitleKey(item.pos));
		//widget.setPreferenceForKey(item.articleContent, getBookmarksContentKey(item.pos));
		widget.setPreferenceForKey(item.articleBase, getBookmarksBaseKey(item.pos));
		widget.setPreferenceForKey(""+item.timestamp, getBookmarksTimeKey(item.pos));
		this.storeIndex();
	}
}

BookmarksView.prototype.storeIndex = function () {
	widget.setPreferenceForKey("" + this.startindex, "boox-start");
	widget.setPreferenceForKey("" + this.endindex, "boox-end");
//	alert("BM: index stored, start:"+this.startindex + ", end:"+this.endindex);
}


BookmarksView.prototype.clear = function(){
	this.items = new Array();
	if (window.widget) {
		for (var i = this.startindex; i < this.endindex + 1; i++) {
			widget.setPreferenceForKey(null, getBookmarksTitleKey(i));
			widget.setPreferenceForKey(null, getBookmarksContentKey(i));
			widget.setPreferenceForKey(null, getBookmarksBaseKey(i));
			widget.setPreferenceForKey(null, getBookmarksTimeKey(i));
		}
		this.startindex = 0;
		this.endindex = 0;
		this.storeIndex();
		this.rendered = false;
		this.render();
	}
}

BookmarksView.prototype.loadItems = function(){
	uiManager.showNotification(-1, "wait", "Loading...");
	var self = this;
	setTimeout(function(){self.doLoadItems();},0);
}


BookmarksView.prototype.doLoadItems = function(){
	if ( window.widget ) {
		var d = new Date();
		var now = d.getTime();
		this.items = new Array();
		var tmpstart 	= 	widget.preferenceForKey("boox-start");
		var tmpend 		= 	widget.preferenceForKey("boox-end");

		this.startindex = (( tmpstart != undefined && tmpstart != null ) ? parseInt(tmpstart) : 0);
		this.endindex = (( tmpend != undefined && tmpend != null ) ? parseInt(tmpend) : 0);

//		alert("BM: startindex=" + this.startindex +", endindex=" + this.endindex);

		for (var i = this.startindex; i < this.endindex; i++) {
			var pos =  i - this.startindex;
			var title = widget.preferenceForKey(getBookmarksTitleKey(i));
//			alert("BM: Examining item: i=" + i + ", pos=" + pos +", title=" + title );
			if ( !title || title == null || title == "null") continue;
			var item = new BookmarksViewItem(title,null,null,i);
			item.articleContent = widget.preferenceForKey(getBookmarksContentKey(i));
			item.articleBase = widget.preferenceForKey(getBookmarksBaseKey(i));
			item.timestamp = parseFloat(widget.preferenceForKey(getBookmarksTimeKey(i)));
			item.pos = i;
			this.items[pos] = item;
//			alert("BM: Loaded item: i=" + i + ", pos=" + pos +", title=" + title +", ts=" + item.timestamp);
		}
		this.rendered = false;
	}
	uiManager.hideNotification();
}

BookmarksView.prototype.render = function(){
	if ( this.rendered ) return;
	var d = new Date();
	var now = d.getTime();
	// clear components
	this.removeAllControls();
	var caption = new NavigationButton(1, "titlebar.png", "Bookmarks", true);
	caption.addEventListener("ActionPerformed", function(){
		wikiHomeView.show();
	});
	this.addControl(caption);
	
	// add components for bookmarks items, up to today
	
	var thecontrol = new ContentPanel(null, "All bookmarks", "", true, true);
	thecontrol.setContent(this.renderBookmarksContent(0, now));
	this.addControl(thecontrol);
	this.rendered = true;
}

BookmarksView.prototype.renderBookmarksContent = function (from , to) {
	var buf = "<table class='historytable'>";
	for ( var i = this.endindex ; i >= this.startindex ; i -- ) {
		var ind = i - this.startindex;
		if ( this.items[ind] == undefined || this.items[ind] == null ) continue;
		if ( this.items[ind].timestamp < from ) break;
		if ( this.items[ind].timestamp < to ) {
			buf += this.renderBookmarksItem(this.items[ind]);			
		}
	}
	buf += "</table>"
	return buf;
}

BookmarksView.prototype.renderBookmarksItem = function(item){
	if ( item == undefined || item == null ) return "";
    var buf = "<tr><td><small>";
	buf += shortFormatTime(item.timestamp);
	buf += "</small></td><td width=70%>";	 
	buf += "<div class=\"FeedItemLink\">";
	buf += "<a href=\"JavaScript:void(0)\" onclick=\"wikiBookmarksView.goTo(" ;
	buf += item.pos;
	buf +=  "); return false;\">";
	buf += "<strong>";
	buf += shorten(item.articleTitle, 30);
	buf += "<strong></a>";
	buf += "</div>";
	buf += "</td><td><div class=\"FeedItemLink\">";
	buf += "<a href=\"JavaScript:void(0)\" onclick=\"event.stopPropagation();wikiBookmarksView.deleteItem(" ;
	buf += item.pos;
	buf +=  "); wikiBookmarksView.render(); return false;\">";
	buf += "<img src=delete.png border=0></a>";
	buf += "</div>";
	buf += "</td></tr>";
	return buf;
}

BookmarksView.prototype.deleteItem = function(ind){	
	try {
	//	alert("BM: removeItem: ind=" + ind);
		// remove item
		this.items[ind-this.startindex] = null;
		if (window.widget) {
			widget.setPreferenceForKey(null, getBookmarksTitleKey(ind));
			widget.setPreferenceForKey(null, getBookmarksContentKey(ind));
			widget.setPreferenceForKey(null, getBookmarksBaseKey(ind));
			widget.setPreferenceForKey(null, getBookmarksTimeKey(ind));
		}
		this.rendered = false;
	}catch(ex) { alert(ex);}
}

BookmarksView.prototype.goTo = function(pos){
	wikiBrowse(this.items[pos-this.startindex].articleTitle, false, this.items[pos-this.startindex].articleBase); // true means don't re-add to history	 	
}



BookmarksView.prototype.show = function(){
	try {
		this.render();
	}catch(e){ alert(e);}
	View.prototype.show.call(this);
}


// abstract function for updating per-view menu
// only called if window.widget is defined
BookmarksView.prototype.setupMenu = function(){
	if ( window.widget ) {
		menu.clear();
		var clearMenuItem = new MenuItem("Clear", MENU_ITEM_BOOKMARKS_CLEAR);
		var self = this; 
		clearMenuItem.onSelect = function(){self.clear();};
		menu.append(clearMenuItem);

		var self = this;
		var searchMenuItem = new MenuItem("Search", MENU_ITEM_MAIN_SEARCH); 
		searchMenuItem.onSelect = function(){wikiHomeView.show();};
		menu.append(searchMenuItem);
		var historyMenuItem = new MenuItem("History", MENU_ITEM_MAIN_HISTORY); 
		historyMenuItem.onSelect = function(){wikiHistoryView.previousView = self; wikiHistoryView.show();};
		menu.append(historyMenuItem);
		var bookmarksMenuItem = new MenuItem("Bookmarks", MENU_ITEM_MAIN_BOOKMARKS); 
		bookmarksMenuItem.onSelect = function(){wikiBookmarksView.show();};
		menu.append(bookmarksMenuItem);

		addHelpMenuItems();
	}
}


function getBookmarksKeyBase(pos) {
	return "boox." + pos + "."; 
}

function getBookmarksTitleKey(pos) {
	return getBookmarksKeyBase(pos) + "title"; 
}

function getBookmarksContentKey(pos) {
	return getBookmarksKeyBase(pos) + "content"; 
}

function getBookmarksTimeKey(pos) {
	return getBookmarksKeyBase(pos) + "time"; 
}

function getBookmarksBaseKey(pos) {
	return getHistoryKeyBase(pos) + "base"; 
}



BookmarksView.prototype.removeItem = function(articleTitle){
	// find index
	var ind = this.findItemIdFromTitle(articleTitle)
	if ( ind == -1 ) {
		return;
	}
	deleteItem(ind);
}

BookmarksView.prototype.findItemIdFromTitle = function(title) {
	var ind = -1;
	for ( var i = this.startindex ; i < this.endindex + 1 ; i ++ ) {
		var arrind = i-this.startindex;
		if ( this.items[arrind] != undefined && this.items[arrind] != null && title == this.items[arrind].articleTitle) {
			ind = i;
			break;
		}
	}
	return ind;
}

// return already downloaded content for an article or null
// if we don't have it
BookmarksView.prototype.getContentForArticle = function(articleTitle){
	if (window.widget) {
		var i = this.findItemIdFromTitle(articleTitle);
		return widget.preferenceForKey(getBookmarksContentKey(i));
	}
	return null;
}

