// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

var logEnabled = true;

// Opens a URL in a separate browser window
function openURL(url) {
    if (window.widget) {
        // in WRT
        widget.openURL(url);
    } else {
        // outside WRT
        window.open(url, "NewWindow");
    }
}

function increaseFontSize(){
    if (window.widget) {
		setCssBodyFontSize(currentFontSize + 2);
	}
}

function decreaseFontSize(){
    if (window.widget) {
		if (currentFontSize > 4) {
			setCssBodyFontSize(currentFontSize - 2);
		}
	}
}

function setCssBodyFontSize(size){
    if (window.widget) {
		currentFontSize = size;
		var sizestring = "" + size;
		document.body.style.fontSize = sizestring + "px";
		widget.setPreferenceForKey(sizestring, "fontsize");
	}
}


function log(txt) {
	if (logEnabled) {
//		txt = txt.replace(/</g, unescape("%26lt%3B")).replace(/>/g, unescape("%26gt%3B")); 
//		txt = txt.replace(/</g, "&lt");
//		txt = txt.replace(/\>/g, "&gt");
		document.getElementById("debugdiv").innerHTML = txt + "<br> " + document.getElementById("debugdiv").innerHTML;
	} 
}

function setupLog() {
	if (logEnabled) {
		if (window.widget) {
			var logMenuItem = new MenuItem("Toggle log", 99);
			logMenuItem.onSelect = function() {
				var div = document.getElementById("debugdiv");
				var main = document.getElementById("uimandiv");
				if ( div.style.display == "none" ) {
					div.style.display = "";
					main.style.display = "none";
				} else {
					div.style.display = "none";
					main.style.display = "";
				}
			}
			menu.append(logMenuItem);
		}
	}
}

function shorten(text, len) {
	if ( text.length < len + 3 ) return text;
	return text.substring(0,len) + "...";
}

function uniDecode(text) {
	var ptr = 0;
	var buf = "";
	while ( ptr < text.length ){
		if ( text.charAt(ptr) == '%' ) {
			// read next two chars and interpret as hex UTF-8 char code
			var hex = "";
			ptr ++;
			hex += text.charAt(ptr) ;
			ptr ++;
			hex += text.charAt(ptr) ;
			var ccode = unhex(hex);
			// decode utf-8
			if (ccode < 128) { // 1 byte char
				buf += String.fromCharCode(ccode);
				ptr++;
			}
			else if((ccode > 191) && (ccode < 224)) { // 2 byte char 
				var hex2 = "";
				ptr ++; // move to % 
				ptr ++; // move to first hex digit 
				hex2 += text.charAt(ptr) ;
				ptr ++;
				hex2 += text.charAt(ptr) ;
				var ccode2 = unhex(hex2);
				// need more stuff to get char
				buf += String.fromCharCode(((ccode & 31) << 6) | (ccode2 & 63));
				ptr ++;
			}
			else {  // 3 byte char
				var hex2 = "";
				ptr ++; // move to % 
				ptr ++; // move to first hex digit 
				hex2 += text.charAt(ptr) ;
				ptr ++;
				hex2 += text.charAt(ptr) ;
				var ccode2 = unhex(hex2);
				var hex3 = "";
				ptr ++; // move to % 
				ptr ++; // move to first hex digit 
				hex3 += text.charAt(ptr) ;
				ptr ++;
				hex3 += text.charAt(ptr) ;
				var ccode3 = unhex(hex2);
				buf += String.fromCharCode(((ccode & 15) << 12) | ((ccode2 & 63) << 6) | (ccode3 & 63));
				ptr++;
			}
		} else {
			buf += text.charAt(ptr);
			ptr ++;
		}
	}
	return buf;
}

function unhex(hx) {
	var val = 0;
	for ( var i = 0 ; i < hx.length ; i ++ ) {
		val = val * 16;
		switch(hx.charAt(i)) {
			case '0': continue; 
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9': {
				val += parseInt(hx.charAt(i));
				break;
			}
			case 'A':
			case 'a':{
				val += 10;
				break;
			}
			case 'B':
			case 'b':{
				val += 11;
				break;
			}
			case 'C':
			case 'c':{
				val += 12;
				break;
			}
			case 'D':
			case 'd':{
				val += 13;
				break;
			}
			case 'E':
			case 'e':{
				val += 14;
				break;
			}
			case 'F':
			case 'f':{
				val += 15;
				break;
			}
		}
	}
	return val;
}

function shortFormatTime(ts) {
	var date = new Date(ts);
	var ret = "";
	ret += pad(2,"0", date.getDate());
	ret += "/";
	ret += pad(2,"0",(1+date.getMonth()));
	ret += " ";
	ret += pad(2,"0", date.getHours());
	ret += ":";
	ret += pad(2,"0",date.getMinutes());
	return ret;
}


function nocache(url) {
    if (url.indexOf("?") == -1) {
        url += "?";
    } else {
        url += "&";
    }
    url += "xnocache=" + (new Date().getTime());
	return url;
}

function pad(_num, _char, _val) {
	var buf = ""+ _val;
	while(buf.length < _num){
		buf = _char + "" + buf;
	}
//	alert("pad: num=" +num + ", char=" + char + ", val=" + val +", result=" +buf );
	return buf;
}

function getViewRep(view) {
	if ( view == null ) {
		return "null";
	} else if (view) {
		return view.caption;
	} else {
		return "undefined";
	}
}


function ViewCache(size) {
	this.size = size;
	this.names = new Array();
	this.views = new Array();
}

ViewCache.prototype.addView = function(name,view) {
	this.names.splice(0,0,name);
	this.views.splice(0,0,view);
	
	if (this.names.length > this.size) {
		this.names.splice(this.size, 1);
		this.views.splice(this.size, 1);
	}
}

ViewCache.prototype.getView = function(name){
	for ( var i = 0 ; i < this.names.length ; i++ ) {
		if ( name == this.names[i] ) {
			return this.views[i];
		}
	}
	return null;
}