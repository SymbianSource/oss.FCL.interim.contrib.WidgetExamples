// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////


var twitterurl = "http://twitter.com/statuses/user_timeline/21138778.rss";

function Twitter(parentView) {
	this.parentView = parentView;
	this.buttons = null;	
	this.numToShow = 5;
	this.http = null;
}

Twitter.prototype.Update = function(numToShow){
	this.numToShow = numToShow;
	if ( this.buttons == null ) {
		// add the separator
		var separator = new NavigationButton(null, "tweetz-icon.png", "<img src='tweetz.png' border=0>");
		separator.setEnabled(false);
		this.parentView.addControl(separator);
		// create buttons
		this.buttons = new Array();
		for( var i = 0 ; i < this.numToShow; i++ ) {
			var button = new NavigationButton("twitter_button_"+i, null , "");
			this.parentView.addControl(button);
			this.buttons.push(button);
		}
		this.buttons[0].setText("Loading twitter feed...");
	}
	var self = this;
	// get the rss 
	// Prepare synchronous download
	this.http = new Ajax();
    this.http.open("GET", twitterurl , true); // false means synchronous
    this.http.onreadystatechange = function() { self.DoUpdate(); };
    this.http.send(null);
}

Twitter.prototype.DoUpdate = function(){
    if (this.http.readyState == 4) {
	
		try {
			// Get parsed Doc
			var xmlDoc = this.http.responseXML;
			if (xmlDoc == null) {
				// if the content type is not set correctly, we get the response as text
				var xmlparser = new DOMParser();
				xmlDoc = xmlparser.parseFromString(this.http.responseText, "text/xml");
			}
			var itemElements = xmlDoc.getElementsByTagName("item");
			var loopEnd = Math.min(this.numToShow, itemElements.length);
			// traverse elements and create buttons
			for (var i = 0; i < loopEnd; i++) {
				// iterate through child nodes of this item and gather tweets
				var title = null;
				var date = null;
				
				node = itemElements[i].firstChild;
				while (node != null) {
					if (node.nodeType == Node.ELEMENT_NODE) {
						if (node.nodeName == "title") {
							// item title
							title = getTextOfNode(node);
						}
						else 
							if (node.nodeName == "pubDate" || node.nodeName == "dc:date") {
								// item publishing date
								date = getTextOfNode(node);
							}
					}
					node = node.nextSibling;
				}
				
				this.buttons[i].setText("<font size=0.6em><i>" + date + "</i> " + title + "</font>");
				this.buttons[i].setImage("tweet.png");
			}
		} 
		catch (x) {
			this.buttons[0].setText("<font size=0.6em>Uh-Oh! Tweetz not tweeting right now.</font>");
			for (var i = 0; i < this.numToShow; i++) {
				this.buttons[i].setText("");
				this.buttons[i].setImage(null);
			}
		}
	}
}

// Returns the text of a node.
function getTextOfNode(node) {
    var buf = "";
	// iterate through all child elements and collect all text to the buffer
	var child = node.firstChild;
	while (child != null) {
		if (child.nodeType == Node.TEXT_NODE || child.nodeType == Node.CDATA_SECTION_NODE) {
			// append text to buffer
			if (buf != "") {
				buf += " ";
			}
			buf += child.nodeValue;
		}
		child = child.nextSibling;
	}
	// make link if there is a url
	var ind = buf.indexOf("http://");
	var endind = buf.indexOf(" ", ind);
	if ( ind != -1 ) {
		var tmp = buf.substring(0,ind);
		var url = "";
		if ( endind == -1 ) {
			url = buf.substring(ind);
		} else {
			url = buf.substring(ind, endind);
		}
		tmp += "<div class=\"FeedItemLink\">";
        tmp += "<a href=\"JavaScript:void(0)\" onclick=\"openURL('" + url + "'); return false;\">";
		tmp += url + "</a></div>";
			
		if ( endind != -1 ) {
			tmp += buf.substring(endind);
		}
		buf = tmp;
	}
	return buf;
}
