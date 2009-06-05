/*
	Function 	:	menu()
	Argument	:	Void
	Returns		:	Void
	Description	:	Constructor Function creates a Menu object to the WINDOW
*/

function Menu()
{
	this.items = Array();
	this.index = null;
	this.isDimmed = false;	
		
	//	Event triggers
	this.onShow = null;
	this.onRightSoftKeySelect = null;
	
	// Flag for Menu softkeys disabled to show
	this.is_sfk_disabled = false;
}


/*
	Function 	:	menu.append()
	Argument	:	MenuItem Object
	Returns		:	Void
	Description	:	Function appends MenuItem to a Menu Object
*/
Menu.prototype.append = function(MenuItem)
{
	if(this.allowedTypeOf(MenuItem))
	{
		var i;
		var flag = true;
		try{
		for(i=0; i<this.items.length; i++)
		{
			if(this.items[i].id == MenuItem.id)
			{	
				flag = false; 
				break; 
			}
		}} catch(e){ }
		if(flag)
		{
			//	MenuItem.parent = this;
			this.items.push(MenuItem);
		}
	}
}


/*
	Function 	:	menu.remove()
	Argument	:	MenuItem Object
	Returns		:	Void
	Description	:	Function Remove the menuItem and its children from the container options menu.
*/
Menu.prototype.remove = function(MenuItem)
{
	if(!this.allowedTypeOf(MenuItem))
		return false;

	var i;
	var flag = false;
	if (this.items.length) {
		for (i = 0; i < this.items.length; i++) {
			if (this.items[i].id == MenuItem.id) {
				flag = true;
				break;
			}
		}
	}
	if(flag)
	{
		this.items.splice(i, 1);
	}
}

/*
	Function 	:	menu.clear()
	Argument	:	Void
	Returns		:	Void
	Description	:	Clears (deletes) all the menu items in the menupane.
*/
Menu.prototype.clear = function()
{
	try
	{
		this.items.splice(0, this.items.length);
	}catch(e){}
}


/*
	Function 	:	Menu.getMenuItemById(id)
	Argument	:	Integer
	Returns		:	MenuItem Object
	Description	:	Function get the MenuItem Object with the reference of id
*/
Menu.prototype.getMenuItemById = function(id)
{
	var menuItemRef = menuItemExhistsById(this, id, 0);
	if(this.allowedTypeOf(menuItemRef))
		return menuItemRef;
	else
		return undefined;
}


/*
	Function 	:	Menu.getMenuItemByName(name)
	Argument	:	String
	Returns		:	MenuItem Object
	Description	:	Function get the MenuItem Object with the reference of String name
*/
Menu.prototype.getMenuItemByName = function(name)
{
	var menuItemRef = menuItemExhistsById(this, name, 1);

//	if(menuItemRef !=null)
	if(this.allowedTypeOf(menuItemRef))
		return menuItemRef;
	else
		return undefined;
}

/*
	Function 	:	Menu.setRightSoftkeyLabel()
	Argument	:	String, Function
	Returns		:	Void
	Description	:	Set the label of the right soft key to str. This enables the default text 
					to be changed from �exit� and a new function assigned by setting a callbackfunction
*/
Menu.prototype.setRightSoftkeyLabel = function(label, callbackfunction)
{
	window.menu = this;
	
	try
	{
		var rightSoftKey = childToParent_Reference.$('rightSoftKey');
		if(typeof(callbackfunction) == 'function')
		{
			rightSoftKey.innerHTML = label;
	
			this.onRightSoftKeySelect = callbackfunction;
			rightSoftKey.setAttribute('onClick', 'javascript:Emulator.triggerChildRSK();');	
		}
		else
		{
			rightSoftKey.innerHTML = "Cancel";
			this.onRightSoftKeySelect = null;
			rightSoftKey.setAttribute('onClick', 'javascript:Emulator.triggerChildRSK();');	
		}
	}catch(e){  }
}

/*
	Function 	:	Menu.showSoftkeys()
	Argument	:	Void
	Returns		:	Void
	Description	:	Makes the softkeys visible. By default the softkeys are not visible

*/
Menu.prototype.showSoftkeys = function()
{
	/*
	 *  Shows showSoftkeys
	 */
	this.is_sfk_disabled = false;
	childToParent_Reference.Emulator.showDeviceSoftKeys();
}

/*
	Function 	:	Menu.hideSoftkeys()
	Argument	:	Void
	Returns		:	Void
	Description	:	Makes the softkeys invisible. By default the softkeys are not visible. 

*/
Menu.prototype.hideSoftkeys = function()
{
	/*
	 *  Hide showSoftkeys
	 */
	this.is_sfk_disabled = true;
	childToParent_Reference.Emulator.hideDeviceSoftKeys();
}


/*	
 *  
 * ----------------------------------------------------------------
 * Exta Functionalities which helps to make main functions to work
 * ----------------------------------------------------------------
 *  
*/

Menu.prototype.cancel = function()
{
	/*
	 *  Clear menu and Exit the widget
	 */

	childToParent_Reference.$('menuItemsPane').innerHTML = '';
	childToParent_Reference.$('menuItemsPane').style.display = 'none';

	if(this.is_sfk_disabled)
		childToParent_Reference.Emulator.hideDeviceSoftKeys();
}

Menu.prototype.exit = function()
{
	/*
	 *  Clear menu and Exit the widget
	 */

	childToParent_Reference.$('menuItemsPane').innerHTML = '';
	childToParent_Reference.$('menuItemsPane').style.display = 'none';

	if(childToParent_Reference.Emulator.showSoftKeys_disabled)
		childToParent_Reference.$('menuPane').style.display = 'none';

	//	call the Parent function
	childToParent_Reference.Emulator.triggerExit();
}


Menu.prototype.showMenu = function(parentId)
{
	try{
	var menuItemsPane = childToParent_Reference.$('menuItemsPane')
	menuItemsPane.innerHTML = '';

	var menuPane = childToParent_Reference.$('menuPane');
	menuPane.style.display = 'block';

	var ul = document.createElement('ul');
	var ele = this;
	if(parentId)
	{
		ele = menuItemExhistsById(ele, parentId, 0);
	}
	if(ele.items.length)
	{
		for(var i=0; i<ele.items.length; i++)
		{
			if(!ele.items[i].isDimmed){
				
				try{
					ul.appendChild(createMenuElement(ele.items[i]));
				}catch(e){  }
			}
		}
		if(parentId)
		{
			if(ele.parent)
				ul.appendChild(createNormalMenuElement('Back', ele.parent.id));	
			else
				ul.appendChild(createNormalMenuElement('Back', null));	
		}
		else
		{
			ul.appendChild(createExitMenuElement());	
		}
		if(ele.items.length > 1)
			menuItemsPane.style.overflowY = 'scroll';
		else
			menuItemsPane.style.overflowY = 'hidden';
	}
	else
	{
		menuItemsPane.style.overflowY = 'hidden';
		ul.appendChild(createExitMenuElement());	
	}
	menuItemsPane.innerHTML = '<ul>'+ul.innerHTML+'</ul>';
	/*
	 * Set the MenuKeys DIV style.top
	 */
	childToParent_Reference.Emulator.showDeviceSoftKeys();
	}
	catch(e)
	{
		alert('showMenu: '+e);
	}
}

Menu.prototype.triggeLeftSoftKeyEvent = function()
{
	if(typeof(window.menu.onShow) == 'function')
	{
			window.menu.onShow();
	}
	childToParent_Reference.$('softKeysPane').style.display = 'block';
	this.showMenu();
}

Menu.prototype.triggeEvent = function(MenuItemId)
{
	try{
		var menuItemRef = menuItemExhistsById(this, MenuItemId, 0);
		if(menuItemRef != null)
		{
			if(typeof menuItemRef.onSelect == 'function')
				menuItemRef.onSelect(MenuItemId);
	
			if(menuItemRef.items.length)
				this.showMenu(MenuItemId);
			else
				this.cancel();
		}
	}
	catch(e)
	{
		alert('triggeEvent: '+MenuItemId+' >> '+e);
	}
}

Menu.prototype.hasChild = function(parentId)
{
	for(var i=0; i<this.items.length; i++)
	{
		if(this.items[i].parentId == parentId)
		{	
			 return true;
		}
	}
	return false;
}


Menu.prototype.allowedTypeOf = function(MenuItem)
{
	try
	{
		if( (typeof(MenuItem) == 'object') && (MenuItem.type == 'MenuItem'))
			return true;			
	}
	catch(e)
	{
		return false;
	}
}

function widgetMenuReferenceShowMenu_NOKIA(parentId)
{
	window.menu.showMenu(parentId);
}

function widgetTriggeMenuEvent_NOKIA(MenuItemId)
{
	alert(MenuItemId);
	window.menu.triggeEvent(MenuItemId);
}

/*
	MenuItemExhists??
*/
function menuItemExhistsById(menuReference, value, argumentType)
{
	var i;
	var flag = null;
	
	for(i=0; i<menuReference.items.length; i++)
	{
		if(!argumentType)
		{
			if(menuReference.items[i].id == value)
			{	
				flag = true; 
				break; 
			}
		}
		else
		{
			if(menuReference.items[i].name == value)
			{	
				flag = true; 
				break; 
			}
		}
		
		if(menuReference.items[i].items != undefined && menuReference.items[i].items.length)
		{
			var temp = menuItemExhistsById(menuReference.items[i], value, argumentType);
			if(temp)
				return temp;
		}
	}
	if(flag)
	{
		// crate a package and send it
		menuReference.items[i].index = i;
		return menuReference.items[i];
	}
	else
		return null;
}

function createMenuElement(MenuItem) 
{
	var listitem = document.createElement('li');
	listitem.id = MenuItem.id;
/*	if(MenuItem.onSelect)
	{
		listitem.setAttribute('onClick', 'javascript:widgetTriggeMenuEvent_NOKIA('+MenuItem.id+');');
	}
*/	listitem.setAttribute('onClick', 'javascript:Emulator.triggerMenuEvent('+MenuItem.id+');');

    var anchor = document.createElement('a');
	anchor.id = 'subMenuItem_'+MenuItem.id;
	anchor.innerHTML = MenuItem.name;
	if(MenuItem.items.length)
 	{  
		listitem.className = 'subMenuItem';
		anchor.setAttribute('href', 'javascript:Emulator.triggerMenuShow('+MenuItem.id+');');
	}
    listitem.appendChild(anchor);
	return (listitem);
}

function createNormalMenuElement(MenuTitle, index) 
{
    var listitem = document.createElement('li');

    var anchor = document.createElement('a');
	anchor.id = 'subMenuItem_BACK';
	anchor.innerHTML = MenuTitle;

	if(MenuTitle == 'Application Switcher') 
	{
		listitem.className = 's60AppToggle';
		anchor.setAttribute('href', 'javascript:window.menu.cancel();');
	}
	else if (MenuTitle == 'Back') {
		listitem.className = 'exitOrBackBtn';
		anchor.setAttribute('href', 'javascript:Emulator.triggerMenuShow(' + index + ');');
	}
	else 
		anchor.setAttribute('href', 'javascript:Emulator.triggerMenuShow(' + index + ');');
    
	listitem.appendChild(anchor);
	return (listitem);
}

function createExitMenuElement() 
{
    var listitem = document.createElement('li');
	listitem.className = 'exitOrBackBtn';
    var anchor = document.createElement('a');
	anchor.id = 'subMenuItem_EXIT';
	anchor.innerHTML = 'Exit';
	anchor.setAttribute('href', 'javascript:Emulator.triggerMenuExit();');
	
    listitem.appendChild(anchor);
	return (listitem);
}

function triggeRSK()
{
	try {
		if (window.menu) {
			if (childToParent_Reference.$('softKeysPane').style.display != 'none') {
				if (window.menu.onRightSoftKeySelect != null) {
					window.menu.onRightSoftKeySelect();
					window.menu.cancel();
				}
				else {
					window.menu.cancel();
				}
			}
		}
	}catch(e)
	{
		alert(e);
	}
}

function triggeLSK()
{
	if(window.menu)
	{
		window.menu.showMenu();
		if(typeof(window.menu.onShow) == 'function')
		{
			if(window.menu.onShow)
			{
				window.menu.onShow();
			}
		}
	}
}
