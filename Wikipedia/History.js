// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

var MILLIS_IN_A_DAY = 24*60*60*1000;
var KEEP_HISTORY_FOR = 90 * MILLIS_IN_A_DAY; // 90 days
var KEEP_CONTENT = false;

function HistoryViewItem(articleTitle, articleContent, articleBase, pos) {
	var d = new Date();
	this.articleTitle = articleTitle;
	this.articleContent = articleContent; 
	this.articleBase = articleBase;
	this.pos = pos;
	this.timestamp = d.getTime();
}


function HistoryView (){
	try {
		ListView.prototype.init.call(this, null, null);	
		var caption = new NavigationButton(1, "titlebar.png", "History", true);
		caption.addEventListener("ActionPerformed", function(){wikiHomeView.show();});
		this.addControl(caption);
		this.previousView = null;
		this.items = new Array();
		this.startindex = 0;
		this.endindex = 0;
		this.current = 0;
		this.lastRender = 0;	
		this.todayControl = null;
		this.loadItems();
	}catch(w) {alert(w);}
}

HistoryView.prototype = new ListView(null, null);

HistoryView.prototype.items = null;


HistoryView.prototype.addItem = function(articleTitle, articleContent, articleBase){
	// do not store it if its the same as previous one
	if ( this.items[this.current] != undefined && this.items[this.current] != null && articleTitle == this.items[this.current].articleTitle){
		return;
	}
	var item = null;
	this.current = this.endindex;
	if ( KEEP_CONTENT ){
		item = new HistoryViewItem(articleTitle, articleContent, articleBase, this.current);
	} else {
		item = new HistoryViewItem(articleTitle, null, articleBase, this.current);	
	}
	this.items[this.current-this.startindex]= item;
	this.endindex++;
	this.saveItem(item);
}


HistoryView.prototype.saveItem = function(item){
	if ( window.widget ) {
//		alert("Saving item: pos=" + item.pos +", title=" + item.articleTitle +", ts=" + item.timestamp
//		+ "titlekey:" + getHistoryTitleKey(item.pos) + ", timekey: " + getHistoryTimeKey(item.pos)	);

		widget.setPreferenceForKey(item.articleTitle, getHistoryTitleKey(item.pos));
		if (KEEP_CONTENT) {
			widget.setPreferenceForKey(item.articleContent, getHistoryContentKey(item.pos));
		}
		widget.setPreferenceForKey(item.articleBase, getHistoryBaseKey(item.pos));
		widget.setPreferenceForKey(""+item.timestamp, getHistoryTimeKey(item.pos));
		this.storeIndex();
	}
}

HistoryView.prototype.storeIndex = function () {
	widget.setPreferenceForKey("" + this.startindex, "history.start");
	widget.setPreferenceForKey("" + this.endindex, "history.end");
	widget.setPreferenceForKey("" + this.current, "history.current");
//	alert("index stored, start:"+this.startindex + ", end:"+this.endindex + ", current:"+this.current);
}


HistoryView.prototype.clear = function(){
	this.items = new Array();
	if (window.widget) {
		for (var i = this.startindex; i < this.endindex + 1; i++) {
			widget.setPreferenceForKey(null, getHistoryTitleKey(i));
			if (KEEP_CONTENT) {
				widget.setPreferenceForKey(null, getHistoryContentKey(i));
			}
			widget.setPreferenceForKey(null, getHistoryTimeKey(i));
		}
		this.startindex = 0;
		this.endindex = 0;
		this.current = 0;
		this.storeIndex();
		this.lastRender = 0;
		this.render();
	}
}

HistoryView.prototype.loadItems = function(){
	uiManager.showNotification(-1, "wait", "Loading...");
	var self = this;
	setTimeout(function(){self.doLoadItems();},0);
}


HistoryView.prototype.doLoadItems = function(){
	if ( window.widget ) {
		var d = new Date();
		var now = d.getTime();
		this.items = new Array();
		var tmpstart 	= 	widget.preferenceForKey("history.start");
		var tmpend 		= 	widget.preferenceForKey("history.end");
		var tmpcurr		=	widget.preferenceForKey("history.current");

		this.startindex = (( tmpstart != undefined && tmpstart != null ) ? parseInt(tmpstart) : 0);
		this.endindex = (( tmpend != undefined && tmpend != null ) ? parseInt(tmpend) : 0);
		this.current = (( tmpcurr != undefined && tmpcurr != null ) ? parseInt(tmpcurr) : 0);

//		alert("startindex=" + this.startindex +", endindex=" + this.endindex+ ", current=" + this.current);

		for (var i = this.startindex; i < this.endindex; i++) {
			var pos =  i - this.startindex;
			var title = widget.preferenceForKey(getHistoryTitleKey(i));
//			alert("Examining item: i=" + i + ", pos=" + pos +", title=" + title );
			if ( !title || title == null || title == "null") continue;
			var item = new HistoryViewItem(title,null,null,i);
			if (KEEP_CONTENT) {
				item.articleContent = widget.preferenceForKey(getHistoryContentKey(i));
			}
			item.articleBase = widget.preferenceForKey(getHistoryBaseKey(i));
			item.timestamp = parseFloat(widget.preferenceForKey(getHistoryTimeKey(i)));
			// delete items older than KEEP_HISTORY_FOR
			if (item.timestamp < (now - KEEP_HISTORY_FOR)) {
//				alert("Deleting old item: ts="+ item.timestamp + ", th=" + (now - KEEP_HISTORY_FOR));
				widget.setPreferenceForKey(null, getHistoryTitleKey(i));
				if (KEEP_CONTENT) {
					widget.setPreferenceForKey(null, getHistoryContentKey(i));
				}
				widget.setPreferenceForKey(null, getHistoryBaseKey(i));
				widget.setPreferenceForKey(null, getHistoryTimeKey(i));
			}
			else {
				item.pos = i;
				this.items[pos] = item;
			}
//			alert("Loaded item: i=" + i + ", pos=" + pos +", title=" + title +", ts=" + item.timestamp);
		}
	}
	uiManager.hideNotification();
}

HistoryView.prototype.render = function(){
	var d = new Date();
	var now = d.getTime();
	// what needs to be rendered?

	if (now - this.lastRender > MILLIS_IN_A_DAY || this.todayControl == null) { // render all
		
		// clear components
		this.removeAllControls();
		var caption = new NavigationButton(1, "titlebar.png", "History", true);
		caption.addEventListener("ActionPerformed", function(){
			wikiHomeView.show();
		});
		this.addControl(caption);
		
		// add components for history items, up to today
		
		this.todayControl = new ContentPanel(null, "Last 24 hours", "", true, true);
		this.todayControl.setContent(this.renderHistoryContent(now-MILLIS_IN_A_DAY, now));
		this.addControl(this.todayControl);
		var weekControl = new ContentPanel(null, "Last 7 days", "", true, false);
		weekControl.setContent(this.renderHistoryContent(now-7*MILLIS_IN_A_DAY,now-MILLIS_IN_A_DAY));
		this.addControl(weekControl);
		var moreControl = new ContentPanel(null, "More than 7 days", "", true, false);
		moreControl.setContent(this.renderHistoryContent(0,now-7*MILLIS_IN_A_DAY));
		this.addControl(moreControl);
	} else {
		// render only today
		this.todayControl.setContent(this.renderHistoryContent(now-MILLIS_IN_A_DAY, now));
	} 
	
	this.lastRender = now;		
}

HistoryView.prototype.renderHistoryContent = function (from , to) {
	var buf = "<table class='historytable'>";
	for ( var i = this.endindex ; i >= this.startindex ; i -- ) {
		var ind = i - this.startindex;
		if ( this.items[ind] == undefined || this.items[ind] == null ) continue;
		if ( this.items[ind].timestamp < from ) break;
		if ( this.items[ind].timestamp < to ) {
			buf += this.renderHistoryItem(this.items[ind]);			
		}
	}
	buf += "</table>"
	return buf;
}

HistoryView.prototype.renderHistoryItem = function(item){
	if ( item == undefined || item == null ) return "";
    var buf = "<tr><td><small>";
	buf += shortFormatTime(item.timestamp);
	buf += "</small></td><td  width=70%>";	 
	buf += "<div class=\"FeedItemLink\">";
	buf += "<a href=\"JavaScript:void(0)\" onclick=\"event.stopPropagation();wikiHistoryView.goTo(" ;
	buf += item.pos;
	buf +=  "); return false;\">";
	buf += "<strong>";
	buf += shorten(item.articleTitle, 30);
	buf += "</strong></a>";
	buf += "</div>";
	buf += "</td><td><div class=\"FeedItemLink\">";
	buf += "<a href=\"JavaScript:void(0)\" onclick=\"event.stopPropagation();wikiHistoryView.deleteItem(" ;
	buf += item.pos;
	buf +=  "); return false;\">";
	buf += "<img src=delete.png border=0></a>";
	buf += "</div>";
	buf += "</td></tr>";
	return buf;
}

HistoryView.prototype.deleteItem = function(pos){	
	this.items[pos-this.startindex] = null;
	if ( window.widget ) {
		widget.setPreferenceForKey(null, getHistoryTitleKey(pos));
		if (KEEP_CONTENT) {
			widget.setPreferenceForKey(null, getHistoryContentKey(pos));
		}
		widget.setPreferenceForKey(null, getHistoryBaseKey(pos));
		widget.setPreferenceForKey(null, getHistoryTimeKey(pos));
		this.storeIndex();
	}
	this.lastRender = 0;
	this.render();
}

HistoryView.prototype.show = function(){
	try {
		this.render();
	}catch(e){ alert(e);}
	View.prototype.show.call(this);
}

HistoryView.prototype.goTo = function(pos){
	this.current = pos;
	wikiBrowse(this.items[pos-this.startindex].articleTitle, true, this.items[pos-this.startindex].articleBase); // true means don't re-add to history	 	
}

HistoryView.prototype.go = function(offset){
	var newcurrent = this.current + offset;
	var idx = newcurrent-this.startindex;
	if ( newcurrent >= this.startindex && newcurrent <= this.endindex
		 && idx >= 0 && this.items[idx] != undefined && this.items[idx] != null	) {
		this.current = newcurrent;
		wikiBrowse(this.items[idx].articleTitle, true, this.items[idx].articleBase);	 	
	}
}

HistoryView.prototype.hasNext = function(){
	var newidx = this.current + 1; 
	return ( newidx < this.endindex && this.items[newidx] != undefined && this.items[newidx] != null );  
}

// abstract function for updating per-view menu
// only called if window.widget is defined
HistoryView.prototype.setupMenu = function(){
	if ( window.widget ) {
		menu.clear();
		var clearMenuItem = new MenuItem("Clear", MENU_ITEM_HISTORY_CLEAR);
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


function getHistoryKeyBase(pos) {
	return "hist." + pos + "."; 
}

function getHistoryTitleKey(pos) {
	return getHistoryKeyBase(pos) + "title"; 
}

function getHistoryContentKey(pos) {
	return getHistoryKeyBase(pos) + "content"; 
}

function getHistoryBaseKey(pos) {
	return getHistoryKeyBase(pos) + "base"; 
}

function getHistoryTimeKey(pos) {
	return getHistoryKeyBase(pos) + "time"; 
}


//HistoryView.prototype.removeItem = function(articleTitle){
//	// find index
//	var ind = this.findItemIdFromTitle(articleTitle)
//	if ( ind == -1 ) {
//		return;
//	}
//
//	// remove item
//	this.items[ind-this.startindex] = null;
//	if (window.widget) {
//		widget.setPreferenceForKey(null, getHistoryTitleKey(ind));
//		if (KEEP_CONTENT) {
//			widget.setPreferenceForKey(null, getHistoryContentKey(ind));
//		}
//		widget.setPreferenceForKey(null, getHistoryTimeKey(ind));
//	}
//	this.current = ind;
//	this.endindex = ind;
//	this.render();
//}

//HistoryView.prototype.findItemIdFromTitle = function(title) {
//	var ind = -1;
//	for ( var i = this.startindex ; i < this.endindex + 1 ; i ++ ) {
//		var arrind = i-this.startindex;
//		if ( this.items[arrind] && this.items[arrind] != null && title == this.items[arrind].articleTitle) {
//			ind = i;
//			break;
//		}
//	}
//	return ind;
//}
// return already downloaded content for an article or null
// if we don't have it
//HistoryView.prototype.getContentForArticle = function(articleTitle){
//	if (window.widget && KEEP_CONTENT) {
//		var i = this.findItemIdFromTitle(articleTitle);
//		return widget.preferenceForKey(getHistoryContentKey(i));
//	}
//	return null;
//}

