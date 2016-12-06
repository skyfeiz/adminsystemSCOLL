function addEvent(obj,sEv,fn){
	if(obj.addEventListener){
		obj.addEventListener(sEv,fn,false);
	}else{
		obj.attachEvent('on'+sEv,fn);
	}
}
function addWheel(obj,fn){
	function wheel(ev){
		var oEvent = ev || event;
		var bDown = true;
		bDown=oEvent.detail?oEvent.detail>0:oEvent.wheelDelta<0;
		fn && fn(bDown);
		oEvent.preventDefault && oEvent.preventDefault();
		return false;
	}
	if(window.navigator.userAgent.indexOf('Firefox')!=-1){
		addEvent(obj,'DOMMouseScroll',wheel);
	}else{
		addEvent(obj,'mousewheel',wheel);
	}
}