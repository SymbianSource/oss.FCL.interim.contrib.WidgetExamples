// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

// Login to the developer site

var loginUrlContent = null;
var loginUrlHttpReq = null;
var loginCallback = null;

var isHideNotifications = true;
function login(callback){
	if ( forumUsername == null || forumPassword == null ) {
		loginInitiated = true;
		loginInitiatedCallback = callback;
		promptForPassword();
		return;
	}
	loginCallback = callback;
	loginInitiated = false;
	loginInitiatedCallback = null;
	uiManager.showNotification(-1, "wait", "Please wait...", -1);	
	
	var parameters =  symbianOrgLoginUsernameField + "=" + forumUsername
	          + "&" + symbianOrgLoginPasswordField + "=" + forumPassword
			  + "&submit=Login&image_submit.x=0&image_submit.y=0&image_submit=submit"
			  + "&referrer="+symbianOrgBaseUrl;
	loginUrlHttpReq = new Ajax();
    loginUrlHttpReq.onreadystatechange = loginComplete;
	
    // initiate the request
	loginUrlHttpReq.open('POST', symbianOrgLoginUrl +"?referer="+symbianOrgBaseUrl, true);
	loginUrlHttpReq.setRequestHeader("Referer", symbianOrgBaseUrl);
	loginUrlHttpReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	loginUrlHttpReq.setRequestHeader("Content-length", parameters.length);
	loginUrlHttpReq.setRequestHeader("Connection", "close");
	loginUrlHttpReq.send(parameters);
}

function loginComplete(){
	if ( loginUrlHttpReq == null ) {
		return;
	}
    // complete request?
	var readyState = loginUrlHttpReq.readyState;
    // attempt to get response status
    var responseStatus = null;
    try {
        responseStatus = loginUrlHttpReq.status;
    } catch (noStatusException) {}
    if (readyState == 4) {

		if (responseStatus < 300) {
			
			var content = loginUrlHttpReq.responseText;
			if (content.indexOf("LoginWelcome") == -1) {
				uiManager.showNotification(3000, "warning", "Login failed.");
				promptForPassword();
			}
			else {
				if (loginCallback != null) {
					loginCallback.call();
				}
				// ensure we have all the cookies we need
				var vbCookieGet = new Ajax();
				var vburl = symbianOrgBaseUrl + "/forum/";
			    vbCookieGet.onreadystatechange = forumCookieHarvestComplete;
				vbCookieGet.open('GET', vburl, true);
				vbCookieGet.send(null);
			}
		} else if (responseStatus < 400) {
			// do nothing, this must be a redirect
		} else {
			uiManager.hideNotification();
			uiManager.showNotification(3000, "warning", "Login failed.");
			promptForPassword();
		}
    }
}

function forumCookieHarvestComplete () {
	if (isHideNotifications) {
		uiManager.hideNotification();
	}
	isHideNotifications = true;
}
