

function SlidingScreenTransition(oldView, newView, direction, callback)
{
	/* DOM element to be "pushed out" */
	this.currentScreen = oldView.rootElement;
 
	/* DOM element to be "pulled in" */
	this.nextScreen = newView.rootElement;
 
	/* direction of the sliding transition */
	this.direction = direction;
	
	// callback when done
	this.callback = callback;
}

/* constant value for right-to-left transitions */
SlidingScreenTransition.DIRECTION_LEFT = 1;
 
/* constant value for left-to-right transitions */
SlidingScreenTransition.DIRECTION_RIGHT = -1;
 
/* total number of steps of the sliding transition */
SlidingScreenTransition.TRANSITION_STEPS = 10;


SlidingScreenTransition.prototype.start = function()
{
	var self = this;
	
	this.nextScreen.style.top = '0px';
	this.nextScreen.style.left = (this.direction * screen.availWidth) + 'px';
	
	this.transitionStep = 0;
	
	this.transitionInterval = setInterval(
		function()
		{
			self.doTransitionStep();
		},
		100
	);
}

SlidingScreenTransition.prototype.stop	 = function() {
	clearInterval ( this.transitionInterval );
	if (this.callback) {
		this.callback.call();
	}
}


SlidingScreenTransition.prototype.doTransitionStep = function()
{
	this.transitionStep++;
	
	if(this.transitionStep <= SlidingScreenTransition.TRANSITION_STEPS)
	{
		this.nextScreen.style.left = 
			(screen.availWidth * 
			(SlidingScreenTransition.TRANSITION_STEPS - this.transitionStep) * 
			this.direction / SlidingScreenTransition.TRANSITION_STEPS)
			 + 'px';
		
		this.currentScreen.style.left = 
			(- screen.availWidth * this.transitionStep * this.direction / 
			SlidingScreenTransition.TRANSITION_STEPS) 
			+ 'px';
	}
	else
	{
		this.stop();
	}
}