this.system = this.system || {};
(function(win,doc){
	var Scroll = function () {
		// body的高
		this.bH =  $(doc.body).height();
		//保存内容的高
		this.innerH = 0;
		//保存比例
		this.scale = 0;

		// 存bar_box对象
		this.$bar_box = null;

		//存bar对象
		this.$bar = null;

		this.init();
	}
	var p = Scroll.prototype;

	p.init = function () {

		this.initDom();

		this.crollElement();

		this.eventScroll();

		// 页面大小监测
		this.eventResize();
	}

	p.initDom = function () {
		this.$container = $('.container');
	}

	// 创建scroll的标签
	p.crollElement = function () {
		var eleStr = '<div id="bar_box" style="position:absolute; right:0; top:0; width:5px; height:100%; background:#ccc; z-index:2;">'
					+'<span id="scroll_bar" style="position:absolute; right:0;top:0; width:100%;background:red;"></span>'
					+'</div>';
		$(doc.body).append(eleStr);

		this.$bar_box = $('#bar_box');
		this.$bar = $('#scroll_bar');
	}	

	//事件绑定及滚轮事件
	p.addEvent = function (obj,sEv,fn) {
		if(obj.addEventListener){
			obj.addEventListener(sEv,fn,false);
		}else{
			obj.attachEvent('on'+sEv,fn);
		}
	}

	p.addWheel = function (obj,fn){
		function wheel(ev){
			var oEvent = ev || event;
			var bDown = true;
			bDown=oEvent.detail?oEvent.detail>0:oEvent.wheelDelta<0;
			fn && fn(bDown);
			oEvent.preventDefault && oEvent.preventDefault();
			return false;
		}
		if(win.navigator.userAgent.indexOf('Firefox')!=-1){
			this.addEvent(obj,'DOMMouseScroll',wheel);
		}else{
			this.addEvent(obj,'mousewheel',wheel);
		}
	}

	//scroll事件
	p.eventScroll = function () {
		var cur = this;

		cur.innerH = cur.$container.height();
		cur.scale = cur.bH/cur.innerH;
		//设置bar 的高
		cur.$bar.css('height',cur.bH*cur.scale);
		cur.dragMove(cur.$bar,cur.bH,cur.scale);
		// 添加页面滚动
		cur.addWheel(cur.$container[0],function(bOk){
			var n = cur.$container.offset().top;
			if (bOk) {
				//下滑
				n-=20;
			}else{
				//上滑
				n+=20;
			}
			if (n>=0) {
				n = 0;
			}
			if (n <= cur.bH- cur.innerH) {
				n = cur.bH- cur.innerH;
			}
			cur.$container.css('top',n);
			cur.$bar.css('top',-n/cur.innerH*cur.bH)
		})
	}

	//让scoll_bar能拖动
	p.dragMove = function ($obj) {
		var cur = this;
		$obj.mousedown(function(eve){
			var disY = eve.pageY-$obj.offset().top;
			$(doc).on('mousemove',move);
			$(doc).on('mouseup',up);
			//解决鼠标移出iframe再移入仍然有mousemove函数功能;
			$(doc).on('mouseleave',up);
			function move(eve){
				var t = eve.pageY-disY;
				// console.log(cur.cur.bH - cur.cur.bH*cur.scale)
				if (t <= 0) {
					t = 0;
				};
				if (t >= cur.bH - cur.bH*cur.scale) {
					t = cur.bH - cur.bH*cur.scale ;
				}
				$obj.css('top',t);
				cur.$container.css('top',-t/cur.scale);
			};
			function up(){
				$obj[0].releaseCapture && $obj[0].releaseCapture();
				$(doc).off('mousemove',move)
				$(doc).off('mouseup',up)
				$(doc).off('mouseleave',up)
			}
			//消除ie的拖动选中问题
			$obj[0].setCapture && $obj[0].setCapture();
			eve.preventDefault();
			return false;
		})
	}

	//页面监测
	p.eventResize = function () {
		var cur = this;
		//第一次检测，如果内容个高小于body的高，滚动条不显示；不能默认状态给none,隐藏元素获取不到内容的高
		if (cur.bH >= cur.innerH) {
			cur.$bar_box.css('display','none');
		}
		$(win).resize(function(){
			cur.bH = $(doc.body).height();
			// 页面大小改变时，判断body的高和内容的高 内容的高只获取一次,目前没有考虑到改变的情况
			if (cur.bH >= cur.innerH) {
				cur.$bar_box.css('display','none');
				return ;
			}else{
				cur.$bar_box.css('display','block');
			}

			cur.scale = cur.bH/cur.innerH;
			cur.$bar.css('height',cur.bH*cur.scale);
		})
	}


	system.Scroll = Scroll;
})(window,document)

