// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

var updatePageAjax;
var versionURL = "http://developer.symbian.org/wiki/index.php/SEE_2009_Widget";
var downloadUrl = "http://developer.symbian.org/wiki/images/7/74/See09Widget.wgz";
var myVersion = "1.0rc3";
var versionPrefixString = "Current Widget Version is: [";
var versionSuffixString = "]";

function CheckForUpdates() {
	if (IsHSViewMode()) {
		setTimeout(function() {CheckForUpdates();}, 600000);
		return;
	}

	uiManager.showNotification(-1, "wait", "Checking for updates...", -1);
	updatePageAjax = new Ajax();
	updatePageAjax.onreadystatechange = function(){
		CheckForUpdatesStage2();
	};
	updatePageAjax.open('GET', nocache(versionURL), true);
	updatePageAjax.send(null);	
}

function CheckForUpdatesStage2() {
    if (updatePageAjax.readyState == 4) {
		// extract version number
		var content = updatePageAjax.responseText;
		var ind = content.indexOf(versionPrefixString);
		if ( ind == -1 ) {
			uiManager.showNotification(3000, "warning", "Update failed, check manually.");
			return;
		}
		ind += versionPrefixString.length;
		var ind2 = content.indexOf(versionSuffixString,ind);
		if ( ind2 == -1 || (ind2-ind) > 10 ) {
			uiManager.showNotification(3000, "warning", "Update failed, check manually.");
			return;
		}
		var version = content.substring(ind,ind2);
		// compare to this version
		if ( version != myVersion ) {
			var answer = confirm("Install new version " + version + "?");
			if (answer) {
				// ok, we have the update
				uiManager.hideNotification();
				openURL(nocache(downloadUrl));
				setTimeout(function () {window.close();}, 1000);
			} else {
				uiManager.showNotification(3000, "info", "Update cancelled.");
			}
		} else {
			// No need to show anything
			 uiManager.showNotification(3000, "info", "Up to date!");
		}
	}
}
