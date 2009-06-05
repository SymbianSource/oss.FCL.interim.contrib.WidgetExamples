/*
 * Call this function when window is ready
 */
	window.onload = function()
	{
		
		//	Attach events to Resolution Options & Orientation select
		$('deviceResolution').onchange = function(ele){
			if(ele.target != undefined)
				ele = ele.target;
				
			Emulator.cur_device = ele.options[ele.selectedIndex].value;
			Emulator.setDeviceLabels(SUPPORTED_DEVICES[Emulator.cur_device]);
			
			//	save the selected device details
			createCookie('DEVICE_NAME', Emulator.cur_device);
		}

		/*
		 * Toggle b/w Portrait / Landscape mode
		 */
		$('DisplayOrientation_portrait').onclick = function(ele){
			
			if(ele.target != undefined)
				ele = ele.target;
			if(Emulator.orientation_mode != 'portrait')
				Emulator.changeOrientation(ele);
		}

		$('DisplayOrientation_landscape').onclick = function(ele){
			
			if(ele.target != undefined)
				ele = ele.target;
			if(Emulator.orientation_mode != 'landscape')
				Emulator.changeOrientation(ele);
		}
		$('Toolbar').style.right = "-320px";
		
		
		//	Toggle ToolBar Show/Hide
		$('pullDown').onclick = function()
		{
			if(is_toolbar_hidden)
			{
				showDeviceSettings();
			}
			else
			{
				hideDeviceSettings();	
			}
		} 
		
		//	Toggle ToolBar Show/Hide
		$('WrapperDiv').onmouseover = function(){
			if(!is_scrolling && !is_toolbar_hidden)
				window.setTimeout('hideDeviceSettings()', 1);
		} 
		
		//	Assign Soft-keys trigger to Textual links
		$("leftSoftKey").onclick = function(){
			Emulator.triggerChildLSK();
		}
		$("rightSoftKey").onclick = function(){
			Emulator.triggerChildRSK();
		}
		
		
		//	Assign Soft-keys trigger to Image links
		$("leftSoftKeyImg").onclick = function(){
			Emulator.triggerChildLSK();
		}
		
		$("rightSoftKeyImg").onclick = function(){
			Emulator.triggerChildRSK();
		}
		
		//	Preload Device Information
		Emulator.loadDeviceSettings();
		
		//	set the Default size to device
		Emulator.setDeviceSize();
		
		//	set the Menu Pane position
		Emulator.setMenuPane();
	}


/*
 * Helper function
 */
	function $(str)
	{
		return document.getElementById(str);
	}


/*
 * Emulator, which manages the device interacations
 */

	var Emulator = {};
	
	//	Default, device screen resolution
	Emulator.cur_device = 'n78';
	Emulator.cur_resolution = '240x320';
	Emulator.device_cover_width = 17;
	Emulator.device_cover_height = 8;	
	
	Emulator.orientation_changed = false;
	Emulator.orientation_mode = 'portrait'; // {  portrait | landscape 	}
	
	// Flag, inidcates Menu Object created/exists in the child window
	Emulator.is_widgetMenuIntiated = false;
	
	// Used as a bridge between, Parent window & Child widget
	Emulator.parentToChild_Reference = null;

	//	Interval ID for X-Resize
	Emulator.interval_X = null;

	//	Interval ID for Y-Resize
	Emulator.interval_Y = null;

	Emulator.path = document.location.pathname;
	
/*
 * 	Change the device resolution
 */
	
	Emulator.changeResolution = function(cur_val, to_val)
	{

		if(!SUPPORTED_DEVICES[this.cur_device]['orientation']){
	
				//	check the Portrait mode
				$("DisplayOrientation_portrait").checked = true;

				$("DisplayOrientation_landscape").checked = false;
				$("DisplayOrientation_landscape").disabled = true;
				
				//	update the orientation-mode
				this.orientation_mode = 'portrait';
				
				
				// Toggle the Orientation Flag
				this.orientation_changed = false;
			
		}
		else
			$("DisplayOrientation_landscape").disabled = false;
		
		if(cur_val == to_val)
			return false;
	
		cur_val = cur_val.split('x');
		cur_val[0] = parseInt(cur_val[0]);
		cur_val[1] = parseInt(cur_val[1]);

		to_val = to_val.split('x');
		to_val[0] = parseInt(to_val[0]);
		to_val[1] = parseInt(to_val[1]);
	
		//	hide the keys, if the OPTION menu is OPEN
		this.hideDeviceSoftKeys();
		
		$('widgetIframeWindow').style.height = '100%';
		$('menuItemsPane').style.width = to_val[0]+'px';
		

		// for X
		var adjust_x = 0;
		if(cur_val[0]%10)
		{
			//	decrease these many pixels
			adjust_x = ((cur_val[0]%10) * (-1));
		}
		else if(to_val[0]%10){
			//	increase these many pixels
			adjust_x = (to_val[0]%10);
		}

		cur_val[0] = cur_val[0] + adjust_x;
		$('iframePreviewWindow').style.width = 	parseInt(cur_val[0] + adjust_x) + 'px';
		$('device').style.width = parseInt(cur_val[0] + adjust_x) + this.device_cover_width+'px';


		if (cur_val[0] < to_val[0]) 
		{
			this.resizeDivX(cur_val[0], to_val[0], true);
		}
		else
		{
			this.resizeDivX(cur_val[0], to_val[0], false);
		} 
			
	
		// for Y
		var adjust_y = 0;
		if(cur_val[1]%10)
		{
			//	decrease these many pixels
			adjust_y = ((cur_val[1]%10) * (-1));
		}
		else if(to_val[1]%10){
			//	increase these many pixels
			adjust_y = (to_val[1]%10);
		}
		cur_val[1] = cur_val[1] + adjust_y;

		$('iframePreviewWindow').style.height = 	parseInt(cur_val[1] + adjust_y) + 'px';
		$('device').style.height = parseInt(cur_val[1] + adjust_y) + this.device_cover_height+'px';

		if (cur_val[1] < to_val[1]) 
		{
			this.resizeDivY(cur_val[1], to_val[1], true);
		}
		else
		{
			this.resizeDivY(cur_val[1], to_val[1], false);
		}

	}

/*
 * Resize the device on Horizontally
 */
	
	Emulator.resizeDivX = function(from, to, flag)
	{
		if(from != to)
		{
			var curWidth = $('iframePreviewWindow').style.width;
			curWidth = parseInt(curWidth.substr(0, (curWidth.length-2)));
			if(flag) 
			{
				curWidth = curWidth + 10;
				to = parseInt(to) - 10;
			}
			else 
			{
				curWidth = curWidth - 10;
				to = parseInt(to) + 10;
			}
			$('iframePreviewWindow').style.width = curWidth + 'px';
			$('device').style.width = parseInt(curWidth + this.device_cover_width)+'px';
			
			if(this.interval_X)
				clearInterval(this.interval_X);
			this.interval_X = setInterval(function(){ Emulator.resizeDivX(from, to, flag); }, 10);
		}
		else{
			clearInterval(this.interval_X);
		}
	}
	
/*
 * Resize the device on Vertically
 */
	
	Emulator.resizeDivY = function(from, to, flag)
	{
		if(from != to)
		{
			var curHeight = $('iframePreviewWindow').style.height;
			curHeight = parseInt(curHeight.substr(0, (curHeight.length-2)));
			if(flag) 
			{
				curHeight = curHeight + 10;
				to = parseInt(to) - 10;
			}
			else 
			{
				curHeight = curHeight - 10;
				to = parseInt(to) + 10;
			}
			$('iframePreviewWindow').style.height = curHeight + 'px';
			$('device').style.height = parseInt(curHeight+this.device_cover_height)+'px';
			
			if(this.interval_Y)
				clearInterval(this.interval_Y);
			this.interval_Y = setInterval(function(){ Emulator.resizeDivY(from, to, flag); }, 10);
		}
		else
		{
			clearInterval(this.interval_Y);
			
			/*
			 * Cross check, why i have written these lines @P-1
			 */
			if(!this.parentToChild_Reference.menu.is_sfk_disabled)
			{
				// show menu Pane
				Emulator.setMenuPane();
				$('menuPane').style.display = 'block';
			}

		}
	}
	
/*
 * 	Toggle device orienation b/w Landscape & Portrait
 */
	Emulator.changeOrientation = function(ele)
	{
		if(SUPPORTED_DEVICES[this.cur_device]['orientation'])
		{
			//	If the device supports Orientation, perform
			if(this.parentToChild_Reference.widget.isrotationsupported)
			{
				// Swap the current resolution value
				// Width  -> Height
				// height -> Width
				var cur_val = this.cur_resolution;
				this.cur_resolution = this.cur_resolution.split('x');
				this.cur_resolution = this.cur_resolution[1]+'x'+this.cur_resolution[0];
	
				// Toggle the Orientation Flag
				this.orientation_changed = (this.orientation_changed) ? false : true;
	
				// Toggle the Orientation value
				this.orientation_mode = (this.orientation_mode == 'portrait') ? 'landscape' : 'portrait';
	
				//	Apply the new resolution to the device
				this.changeResolution(cur_val, this.cur_resolution);
			}
		}
		else{
				//	update the orientation-mode
				this.orientation_mode = 'portrait';
				
				// Toggle the Orientation Flag
				this.orientation_changed = false;
		}
	}
	
	
/*
 * 	Set the Device size
 */	
	Emulator.setDeviceSize = function()
	{
		var cur_val;
		try
		{
			this.cur_device = readCookie('DEVICE_NAME');
			if(this.cur_device == undefined)
			{
				this.cur_device = $('deviceResolution').options[0].value;
			}
		}
		catch(e)
		{
				this.cur_device = $('deviceResolution').options[0].value;
		}

		//	get Device resolution
		this.cur_resolution = SUPPORTED_DEVICES[this.cur_device]['display']

		
		//	update the Device label values
		this.setDeviceLabels(SUPPORTED_DEVICES[this.cur_device]);
		
		//	select the corresponding option on the list
		var select = $('deviceResolution');
		for(var i=0; i<select.options.length; i++)
		{
			if(select.options[i].value == this.cur_device)
			{
				select.options[i].selected = true;
			}
		}
		
		//	Disable Landscape Mode if the device won't support
		if(!SUPPORTED_DEVICES[this.cur_device]['orientation'])
			$("DisplayOrientation_landscape").disabled = true;
		else
			$("DisplayOrientation_landscape").disabled = false;
		
		cur_val = this.cur_resolution.split('x')
		$('iframePreviewWindow').style.width = parseInt(cur_val[0])+'px';
		$('iframePreviewWindow').style.height = parseInt(cur_val[1])+'px';
	
		$('device').style.width = parseInt(cur_val[0]) + this.device_cover_width+'px';
		$('device').style.height = parseInt(cur_val[1]) + this.device_cover_height+'px';
	}


/*
 * 	Set Position of the MenuPane
 */

	Emulator.setMenuPane = function()
	{
		var height = $('iframePreviewWindow').style.height;
		height = parseInt(height.substr(0, (height.length-2)));
		
		// decrement height of iframe
		$('widgetIframeWindow').style.height = (height - 20) + 'px';
		
		//	Adjust the Soft-keys position
		if ($('menuItemsPane').childNodes[0]) 
		{
			var length = parseInt($('menuItemsPane').childNodes[0].childNodes.length);
			if (length) 
				$('menuItemsPane').style.top = 55 + parseInt(height - (length * 20)) + 'px';
	
		}
	}

/*
 * 	Show the Device-Softkeys
 */	
	Emulator.showDeviceSoftKeys = function()
	{
		this.setMenuPane();
		
		// show menu Pane
		$('menuPane').style.display = 'block';
		
		// show menu items pane
		$('menuItemsPane').style.display = 'block';
		
	}
	
	
/*
 * 	Hide the Device-Softkeys
 */	
	Emulator.hideDeviceSoftKeys = function()
	{
		var height = $('iframePreviewWindow').style.height;
		height = parseInt(height.substr(0, (height.length-2)));
		
		// hide menuPane 
		$('menuPane').style.display = 'none';
		$('menuItemsPane').style.display = 'none';
		
		// Set iframe height to IframePreviewWindow
		$('widgetIframeWindow').style.height = height + 'px';
	}
	
/*
 * 	Parent-To-Child bride functions
 *  Function to trigger Left-Soft-Key-Event
 */	
	Emulator.triggerChildLSK = function()
	{
		if(this.parentToChild_Reference.menu)
		{
			this.parentToChild_Reference.triggeLSK();
		}
	}
	
/*
 * 	Function to trigger Right-Soft-Key-Event
 */	
	Emulator.triggerChildRSK = function()
	{
		if(this.parentToChild_Reference.menu)
		{
			this.parentToChild_Reference.triggeRSK();
		}
	}
	
/*
 * 	Function to trigger Exit
 */	
	Emulator.triggerExit = function()
	{
		// Hide softkeys
		this.parentToChild_Reference.menu.hideSoftkeys();
		
		
		//	Load the 'preview_exit' file
		$("widgetIframeWindow").src = 'preview/preview_exit.html';
		
		//	assign the Dummy function to Right soft-key
		$("rightSoftKey").innerHTML = 'Cancel';
		$("rightSoftKey").onclick = 'javascript:;';
		
	}

/*
 * 	Function to trigger Menu Hide
 */	
	Emulator.triggerMenuAutoHide = function()
	{
		this.parentToChild_Reference.menu.cancel();
	}
	
	
/*
 * 	Trigger Menu Show function
 */
	Emulator.triggerMenuShow = function(parentId)
	{
		this.parentToChild_Reference.menu.showMenu(parentId);
	}


/*
 * 	Trigger Menu Show function
 */
	Emulator.triggerMenuExit = function(parentId)
	{
		this.parentToChild_Reference.menu.exit();
	}

/*
 * 	Trigger Menu Event
 */	
	Emulator.triggerMenuEvent = function(MenuItemId)
	{
		this.parentToChild_Reference.menu.triggeEvent(MenuItemId);
	}

/*
 * 	Load Device Details
 */
	Emulator.loadDeviceSettings = function()
	{
		if(SUPPORTED_DEVICES)
		{
			var select = $('deviceResolution');
			select.innerHTML = '';
			for(var key in SUPPORTED_DEVICES)
			{
				var option = document.createElement('option');
				option.text = SUPPORTED_DEVICES[key]['name']; 
				option.value = key;
				option.className = '6320';
				select.appendChild(option);
			}
		}
	}

/*
 * 	Set Device Details
 */
	Emulator.setDeviceLabels = function(row)
	{
		$('ModelName').innerHTML = row['name'];
		$('ModelResolution').innerHTML = row['display'] + ' pixels';
		$('ModelImage').src = 'preview/images/device/' + row['image'];
		$('ModelPlatform').innerHTML = row['platform'];
		
		
		var cur_val = this.cur_resolution;
		var to_val = row['display'];
		
		if(this.orientation_changed && SUPPORTED_DEVICES[this.cur_device]['orientation'])
		{
			to_val = to_val.split('x');
			to_val = to_val[1]+'x'+to_val[0];
		}
		this.cur_resolution = to_val;
		this.changeResolution(cur_val, to_val);

	}
	
	function parentToChild_RSK_Event()
	{
		parentToChild_Reference.triggeRightSoftkeyEvent();
	}

	
	function createCookie(name,value) 
	{
		var days = 240000;
	//	var domain = "Nokia-WRT";
	    if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		var value = "Nokia_WRT#"+Emulator.path+"#"+name+"="+value;
		document.cookie = value+expires+"; Emulator.path=/"
	//	+  ((domain) ? ';domain=' + domain : '') + ;
	} 
	
	/**
	 * This function retrieves back the values from the cookies
	 * @param document
	 * @param name
	 * @return
	 */
	function readCookie(name) 
	{
		name = "Nokia_WRT#" + Emulator.path + "#" + name;		
		var nameEQ = name + "=";
	//	alert(name);
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) {
	//			alert(c.substring(nameEQ.length,c.length));
				return c.substring(nameEQ.length,c.length);
			}
		}
		return undefined;
	}

	var scrollIntervalId = null;
	var is_scrolling = false;
	var is_toolbar_hidden = true;
	function showDeviceSettings()
	{	
		if(is_scrolling)
			return false;
			
		is_scrolling = true;
		scrollDiv($('Toolbar'), 'down');
	}

	
	function hideDeviceSettings()
	{
		if(is_scrolling)
			return false;
			
		is_scrolling = true;
		scrollDiv($('Toolbar'), 'up');
	}
	
	var divHeight = 330;
	var divWidth = 320;
	function scrollDiv(ele, type)
	{
		var currentRight = ele.style.right;
		currentRight = parseInt(currentRight.substr(0, (currentRight.length-2)));
		
		//	move up
		if(type == 'up')
		{
			if( currentRight >  parseInt(divWidth * (-1)))
			{
				ele.style.right = parseInt(currentRight - 5) + 'px';
				
				if(scrollIntervalId)
				{
					clearInterval(scrollIntervalId);
				}
				scrollIntervalId = setInterval(function(){ scrollDiv($('Toolbar'), 'up'); }, -10);
			}
			else{
				is_scrolling = false;
				is_toolbar_hidden = true;
				clearInterval(scrollIntervalId);
				
				$('pullDown').className = 'down';
				
				return false;
			}
		}
		else if(type == 'down')
		{
			if( currentRight <  0)
			{
				ele.style.right = parseInt(currentRight + 5) + 'px';

				if(scrollIntervalId)
				{
					clearInterval(scrollIntervalId);
				}
				scrollIntervalId = setInterval(function(){ scrollDiv($('Toolbar'), 'down'); }, -10);

			}
			else{
				is_scrolling = false;
				is_toolbar_hidden = false;
				clearInterval(scrollIntervalId);

				$('pullDown').className = 'up';

				return false;
			}
			
		}
	}
