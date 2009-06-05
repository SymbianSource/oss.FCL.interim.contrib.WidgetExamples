/**
 * Widget object constructor
 * @param {void}
 *     widget()
 * @return {void}
 */ 
function Widget()
{
	//	widget identifier, dummy value
	this.identifier = 14021981;
	this.isrotationsupported = true;
	
	//	widget event triggers
	this.onshow = null;
	this.onhide = null;
	
	/*
	 * Custom extra functionalities to support
	 */
	this.path = document.location.pathname;
	this.sysAPI = null;
	this.onload = null;
	this.opacity = 50;
	this.interval = 20;
	this.isFront = false;
	this.preferenceArray = new Array();
	this.preferenceKey  = 0;
}


/**
 * Launches the browser with the specified url 
 * @param {String} url
 *     openURL()
 * @return {Void}
 */ 
Widget.prototype.openURL = function(url)
{
   if (url) {
	   window.open(url ,"New Widget Window",'height=200 width=250');
   }
}


/**
 * Returns previously stored preference associated with the specified key
 * @param {String} Key preference value to be fetch
 *     preferenceForKey()
 * @return {String} Value
 */ 
Widget.prototype.preferenceForKey = function(key){
	var name = "Nokia_WRT#" + this.path + "#" + key;
	var result = readCookie(document, name);
	return result;
}


/**
 * Stores the key associated with the specified preference
 * @param {String} Preference value to be stored 
 * @param {String} Key Preference value associated to
 *     setPreferenceForKey()
 * @return {Void}
 */ 
Widget.prototype.setPreferenceForKey = function(preference, key)
{
	var value;
	//Specifying null for the preference parameter removes the specified key from the preferences
	if(key == null){
		if(this.preferenceKey>0){
			this.preferenceKey--;
		}
		//delete from cookies
	}
	value = "Nokia_WRT#"+this.path+"#"+key;
	this.preferenceArray[this.preferenceKey] = value;
	
	createCookie(document,value,preference,240000);
	this.preferenceKey++;
	
	//save cookie for cookies
	updateMainCookie(document);
}



/**
 * Toggle between Tabbed navigation mode or Cursor mode
 * @param {Boolean} Value
 *     setNavigationEnabled()
 * @return {Void}
 */ 
Widget.prototype.setNavigationEnabled = function(bool)
{
	//This function can not be used on preview browser
}



/**
 * Open S0-Application identified by UID along with the specified params
 * @param {Integer} Uid hexadecimal value to a specified application
 * @param {String} Value
 *     openApplication()
 * @return {Void}
 */ 
Widget.prototype.openApplication = function(Uid, param)
{
	alert("openApplication function won't be simulated in this application");
}



/**
 * Prepares the Widget.to do transition to specified transitionState
 * @param {String} Value Transition state
 *     prepareForTransition()
 * @return {Void}
 */ 
Widget.prototype.prepareForTransition = function(transitionState)
{
    this.isFront = ("" + transitionState).toLowerCase() != "toback";
    window.document.getElementsByTagName("body")[0].style.opacity = "0.3";
}




/**
 * Does the animation to make the transition between the specified transitionState
 * @param {Void}
 *     performTransition()
 * @return {Void}
 */ 
Widget.prototype.performTransition = function()
{
    var _self = this;
    this.opacity = 0;
    this.interval = window.setInterval(function() {
      _self.opacity += 0.2;
      if (_self.opacity > 1) {
        _self.opacity = 1;
      }
      window.document.getElementsByTagName("body")[0].style.opacity = _self.opacity + "";
      if (_self.opacity >= 1) {
       window.clearInterval(_self.interval);
       window.document.getElementsByTagName("body")[0].style.opacity = "1";
      }
      //do nothing
    }, 50);  
      //do nothing
}





/**
 * Set the preferred screen orientation to landscape. 
 * The display will flip if the phone display orientation 
 * is portrait and the phone supports landscape mode.
 * @param {Void}
 *     setDisplayLandscape()
 * @return {Void}
 */ 
Widget.prototype.setDisplayLandscape = function(){
	try 
	{
		if (this.isrotationsupported && childToParent_Reference.Emulator.orientation_mode != 'landscape') 
		{
			childToParent_Reference.Emulator.changeOrientation(childToParent_Reference.$('DisplayOrientation'));
		}
	} 
	catch (e) {}
}




/**
 * Set the preferred screen orientation to portrait.  
 * The display will flip if the phone display orientation 
 * is landscape and the phone supports portrait mode.
 * @param {Void}
 *     setDisplayPortrait()
 * @return {Void}
 */ 
Widget.prototype.setDisplayPortrait = function()
{
	try 
	{
		if (this.isrotationsupported && childToParent_Reference.Emulator.orientation_mode != 'portrait') 
		{
			childToParent_Reference.Emulator.changeOrientation(childToParent_Reference.$('DisplayOrientation'));
		}
	} 
	catch (e) {}
}

/**
 * Allows the definition of a function to be called 
 * when a Widget.is displayed 
 * @param {Void}
 *     onshow()
 * @return {Void}
 */ 
Widget.prototype.onshow = function()
{
	// to be implemented
}




/**
 * Allows the definition of a function to be called 
 * when a Widget.sent into the background (hidden) 
 * @param {Void}
 *     onhide()
 * @return {Void}
 */ 
Widget.prototype.onhide  = function()
{
	// to be implemented
}



/**
 * This function returns the System API if sysinfo is included in document embed
 */
Widget.prototype.enableSystemApi = function()
{
	
	//	Identify, and Attach System-Info-Object properties
	try 
	{
		var parentIframeRef = window.parent.frames[0];
		if(parentIframeRef) 
		{
			if (parentIframeRef.document.embeds.length > 0) {
				for (var i = 0; i < parentIframeRef.document.embeds.length; i++) 
				{
					//match the system Info API embed tag
					if (parentIframeRef.document.embeds[i].type == 'application/x-systeminfo-widget') 
					{
						new systemAPI(parentIframeRef.document.embeds[i]);
						widget.sysAPI = parentIframeRef.document.embeds[i];
					}
				}
			}
		}
	} 
	catch (e) {
		alert('Error in attachSysInfo: ' + e);
	}	

	//	Attach menu object to window
	window.menu = new Menu();

	// Attach window reference to the Parent Window	
	window.parent.Emulator.parentToChild_Reference = window;

	//	add event listener to window.focus
	window.onfocus = function(){ menu.cancel();	}

	//	add event listener to window.focus
	window.onunload = function()
	{ 
		try
		{
			//	Trigger Callback of Widget.onHide function
			if(typeof(widget.onhide) == 'function')
			{
				widget.onhide();
			}
		}
		catch(e){ errorLog('widget.onhide: '+e.description, 0); }
	}


	/*
	 * Used as a bridge between, Child widget & Parent window
	 */
	window.childToParent_Reference = window.parent;

}

/*
 * support functions for widget object
 */

/**
 * This function stores cookie for all the cookies
 * to help finding cookies of the same document while clearing preferences
 * @param doucment -- Document object
 */
function updateMainCookie(doucment){
	var temp="";
	name = "Nokia_WRT#"+widget.path;
	for (var k = 0; k<widget.preferenceArray.length; k++){
		temp = temp+"|"+widget.preferenceArray[k];
	}
	createCookie(document,name,temp,24000);
}

/**
 * This function creates cookie for the setPreferenceForKey function in order to save key-pref persistently
 * 
 * @param document -- Document object
 * @param name -- Name of the cookie
 * @param value -- value for the name cookie
 * @param days -- expire
 * 
 */

function createCookie(document,name,value,days) {
    if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/"
} 

/**
 * This function retrieves back the values from the cookies
 * @param document
 * @param name
 * @return
 */
function readCookie(document , name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) {
			return c.substring(nameEQ.length,c.length);
		}
	}
	return undefined;
}


/*
 * /////////////////////////////////////////////////////////////////////////////////////
 * //////////////////////////////	  Ends here		  //////////////////////////////////
 * /////////////////////////////////////////////////////////////////////////////////////
 */

function errorLog(str, flag)
{
//	alert(str);
}

/*
 * by John Resig
 * @reference: http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html
 */
function addEvent( obj, type, fn ){ 
   if (obj.addEventListener){ 
      obj.addEventListener( type, fn, false );
   }
   else if (obj.attachEvent){ 
      obj["e"+type+fn] = fn; 
      obj[type+fn] = function(){ obj["e"+type+fn]( window.event ); } 
      obj.attachEvent( "on"+type, obj[type+fn] ); 
   } 
}

/*
 * 		Create a new Widget Object when DOM ready
 * 
*/
try 
{
	//	attach widget object to window
	var widget = new Widget();
	
	//	attach the System-Info api specific functionality
	addEvent(window, 'load', widget.enableSystemApi);
} 
catch (e) 
{
	alert('Exception: Widget object creation');
}
