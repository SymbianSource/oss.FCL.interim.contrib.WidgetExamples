

///////////////////////////////////////////////////////////////////////////////
// The OsconContentPanel class is a control for displaying content. 
// The panel has a title bar and 
// can be expanded and collapsed.

// Constructor.
function OsconContentPanel(id, caption, content, foldable, expanded) {
    if (id != UI_NO_INIT_ID) {
        this.init(id, caption, content, foldable, expanded);
    }
}

// ContentPanel inherits from Control.
ContentPanel.prototype = new Control(UI_NO_INIT_ID);
