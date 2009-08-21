// ////////////////////////////////////////////////////////////////////////////
// Symbian Foundation Example Code
//
// This software is in the public domain. No copyright is claimed, and you 
// may use it for any purpose without license from the Symbian Foundation.
// No warranty for any purpose is expressed or implied by the authors or
// the Symbian Foundation. 
// ////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// The TextPane class implements a control that displays HTML content.

// Constructor.
function TextPane(id, caption, text) {
    if (id != UI_NO_INIT_ID) {
        this.init(id, caption, text);
    }
}

// TextPane inherits from Control.
TextPane.prototype = new Control(UI_NO_INIT_ID);

// Content element for TextPane text.
TextPane.prototype.contentElement = null;

// Initializer - called from constructor.
TextPane.prototype.init = function(id, caption, text) {
    uiLogger.debug("TextPane.init(" + id + ", " + caption + ", " + text + ")");
    
    // call superclass initializer
    Control.prototype.init.call(this, id, caption);
    
    // create content element
    this.contentElement = document.createElement("div");
    this.controlElement.appendChild(this.contentElement);
    
    // set the text
    this.setText(text);
}

// Returns the enabled state for the control.
TextPane.prototype.isEnabled = function() {
    return true;
}

// Returns the focusable state for the control.
TextPane.prototype.isFocusable = function() {
    return false;
}

// Returns the control text.
TextPane.prototype.getText = function() {
    return this.contentElement.innerHTML;
}

// Sets the text for the control.
TextPane.prototype.setText = function(text) {
    uiLogger.debug("TextPane.setText(" + text + ")");
    this.contentElement.innerHTML = (text == null) ? "" : text;
    this.updateStyleFromState();
}

// Updates the style of the control to reflects the state of the control.
TextPane.prototype.updateStyleFromState = function() {
    uiLogger.debug("TextPane.updateStyleFromState()");
    
    // set element class names
    this.setClassName(this.rootElement, "TextPane");
//    this.setClassName(this.assemblyElement, "ControlAssembly ControlAssemblyNormal");
//    this.setClassName(this.captionElement, "ControlCaption ControlCaptionNormal");
//    this.setClassName(this.controlElement, "ControlElement");
//    this.setClassName(this.contentElement, "TextPane");
}
