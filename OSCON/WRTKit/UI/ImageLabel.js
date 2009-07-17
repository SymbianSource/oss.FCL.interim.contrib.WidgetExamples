// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// The ImageLabel class implements a control that displays an image

// Constructor.
function ImageLabel(id, caption, image) {
    if (id != UI_NO_INIT_ID) {
        this.init(id, caption, image);
    }
}

// Label inherits from Control.
ImageLabel.prototype = new Control(UI_NO_INIT_ID);

// Content element for the ImageLabel
ImageLabel.prototype.contentElement = null;

// DOM element for image 
ImageLabel.prototype.image = null;

// DOM element for text 
ImageLabel.prototype.text = null;

// Initializer - called from constructor.
ImageLabel.prototype.init = function(id, caption, image) {
    uiLogger.debug("ImageLabel.init(" + id + ", " + caption + ", " + image + ")");
    
    // call superclass initializer
    Control.prototype.init.call(this, id, null);
    
    // create content element
    this.contentElement = document.createElement("div");
    this.controlElement.appendChild(this.contentElement);
    
	this.image = image;
	this.label = caption;
	this.updateContentElement();
}

// Returns the enabled state for the control.
ImageLabel.prototype.isEnabled = function() {
    return true;
}

// Returns the focusable state for the control.
ImageLabel.prototype.isFocusable = function() {
    return false;
}

// Returns the button image (URL); null if none.
ImageLabel.prototype.getImage = function() {
    return image;
}

// Sets the button image (URL); null if none.
ImageLabel.prototype.setImage = function(image) {
	this.image = image;
}

// Sets the text
ImageLabel.prototype.setLabel = function(text) {
	this.label = label;
}

ImageLabel.prototype.updateContentElement = function(){
	var buf = "";
	if ( this.image != null ) {
		buf += "<img src=" + this.image+" ALIGN=MIDDLE>";
	}
	if (this.label != null ) {
		buf += this.label;
	}
	this.contentElement.innerHTML = buf;
}

// Updates the style of the control to reflects the state of the control.
ImageLabel.prototype.updateStyleFromState = function() {
    uiLogger.debug("Label.updateStyleFromState()");
    
    // set element class names
    this.setClassName(this.rootElement, "Control");
    this.setClassName(this.assemblyElement, "ControlAssembly ControlAssemblyNormal");
    this.setClassName(this.captionElement, "ControlCaption ControlCaptionNormal");
    this.setClassName(this.controlElement, "ControlElement");
    this.setClassName(this.contentElement, "ContentPanelCaptionText");
}
