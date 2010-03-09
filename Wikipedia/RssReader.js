///////////////////////////////////////////////////////////////////////////////
// RSS Reader from WRTKit examples, modified for Wikipedia widget

// RSS reader class

function RssReader(aFeedName, aFeedUrl, aFeedPresenter, aParent, aResponseParser){
	this.responseParser = aResponseParser;
	this.feedUpdateBroker = null;
	this.feedUpdateBrokerActive = false;
	this.feedName = aFeedName;
	this.feedURL = aFeedUrl;
	this.feedUpdateForced = false;
	this.feedItemControls = [];
	this.feedLastModified = 0;
	this.feedPresenter = aFeedPresenter;
	this.ignoreContent = false;
	this.hasData = false;
	this.startFromItem = 0;
	this.maxItems = 0;
	this.feedPresenter = 0;
	if ( aFeedName != undefined ) {
		this.init(aFeedName, aFeedUrl, aFeedPresenter, aParent, aResponseParser);
	}
}

RssReader.prototype = new ListView(null, null);
	
RssReader.prototype.init = function (aFeedName, aFeedUrl, aFeedPresenter, aParent, aResponseParser){
	this.previousView = aParent;
	this.feedPresenter = aFeedPresenter;
	this.responseParser = aResponseParser;
	this.feedName = aFeedName;
	this.feedURL = aFeedUrl;
	if (aFeedPresenter != null) {
		this.feedPresenter = aFeedPresenter;
		this.feedPresenter.init(this);
	} else {
		this.feedPresenter = new HtmlFeedPresenter(this);
	}
	ListView.prototype.init.call(this, null, null);
	
	var caption = new NavigationButton(1, "titlebar.png", aFeedName, true);
	caption.addEventListener("ActionPerformed", function(){wikiHomeView.show();});
	this.addControl(caption);
	// add pre-amble items (latest posts, new thread, reply etc)
	this.feedPresenter.addPreambleItems();
}	

	
// Callback function that gets called when a feed update has completed.
RssReader.prototype.feedUpdateCompleted = function(event){
	// remove cancel button
	this.setupSoftKeys();
	if (event.status == "ok") {
		// if there aren't any feed items yet, we'll hide the progress dialog
		
		// check if the feed has updated
		if (event.lastModified != this.feedLastModified) {
			// remember the last modified timestamp
			this.feedLastModified = event.lastModified;
			
			// feed fetched and parsed successfully
			this.setFeedItems(event.items);			
			this.feedPresenter.addFooterItems();
			this.focusFirst();
		}
		uiManager.hideNotification();
	}
	else if (event.status != "cancelled") {
		// show error message
		uiManager.showNotification(3000, "warning", "Error loading page!");
	}
	
	// reset the broker 
	this.feedUpdateBroker = null;
	this.feedUpdateBrokerActive = false;
	
	// reset commanded feed update flag
	this.feedUpdateForced = false;
}
	
RssReader.prototype.focusFirst = function(){
	// focus the first feed item control
	// (but only if we are in the main view)
	if (this.feedItemControls.length > 0) {
		this.feedItemControls[0].setFocused(true);
	}
}
	
// Removes feed items.
RssReader.prototype.removeFeedItems = function (){
	// remove all current feed items from the main view
	for (var i = 0; i < this.feedItemControls.length; i++) {
		this.removeControl(this.feedItemControls[i]);
	}
	
	// reset feed item control array
	this.feedItemControls = [];
}
	
// Sets feed items.
RssReader.prototype.addFeedItemControl = function(c){
	this.feedItemControls.push(c);
	this.addControl(c);
}

// Sets feed items.
RssReader.prototype.setFeedItems = function (items){
	// start by removing all current feed items
	this.removeFeedItems();
	
	if (items.length == 0) {
		this.feedPresenter.showNoItems();
	}
	else {
		// create new feed items and add them to the main view
		// use feed item pool to recycle controls
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			this.feedPresenter.show(item);
		}
		
	}
	this.hasData = true;
}
	
	
// Update feed
RssReader.prototype.update = function(forceFeedUpdate, notification){
	if ( this.hasData && !forceFeedUpdate ) {
		return;
	}		
	this.feedUpdateForced = forceFeedUpdate;
	
	if ( notification == undefined ) {
		notification = true;
	}
	
	// check if a feed update has been scheduled, if it's time to update now,
	// and if there's no update currently in progress and if we're in the main view
	if ((this.feedURL != null) && (!this.feedUpdateBrokerActive) ) { //&& (uiManager.getView() == this) ) {
		// fetch the feed from the specified URL
		this.feedUpdateBrokerActive = true;
		this.feedUpdateBroker = new FeedUpdateBroker();
		this.feedUpdateBroker.startFromItem = this.startFromItem;
		this.feedUpdateBroker.maxItems = this.maxItems;
		
		if ( this.responseParser != null ) {
			this.feedUpdateBroker.responseParser = this.responseParser;
		}
		this.feedUpdateBroker.ignoreContent = this.ignoreContent;
		this.feedUpdateBroker.fetchFeed(this.feedURL, this);
		// allow cancelling
	    if (window.widget) {
			var self = this;
			menu.setRightSoftkeyLabel("Cancel", function(){
				self.feedUpdateBroker.cancel(); self.setupSoftKeys();
				uiManager.hideNotification();
				});
	    }
		if (notification) {
			uiManager.showNotification(-1, "wait", "Loading...", -1);
		}
	}
}
