this.system = this.system || {};

(function(win,doc){
	var SySIndex = function(){
		this.w = $('.zbody').width();
		this.h = $('.zbody').height();

		//存ajax取回的侧边栏数据
		this.data = ''
		// 存headertap的下标，判断是否已经生成相应的侧边栏
		this.indexArr = [];
		//存iframe的路径数组，判断是否已经存在iframe
		this.frameArr = [];
		//计算选项卡个数
		this.nTab = 0;

		this.init();
	};

	var p = SySIndex.prototype;

	//初始函数，里面的函数都只执行一次
	p.init = function(){
		// 保存初始化dom
		this.initDom();
		//动态生成头部部分
		this.getHeaderData();

		//动态生成左侧部分
		this.getAsideData();

		//侧边栏事件
		this.sidebarEvent();

		//关闭iframe事件
		this.closeEvent();

		//右键事件
		this.rightEvent();

		//关闭所有iframe事件
		this.closeAll();

		//页面resize监控
		this.resizeChange();

	};

	//存初始的dom,避免重复获取
	p.initDom = function () {
		this.$headerTab = $('.headertab');
		this.$content = $('.content');
		this.$iftitleList = $('.iftitle-list');
		this.$iframeBox = $('.iframe-box');
	}

	//生成头部
	p.getHeaderData = function(){
		var cur = this;
		$.ajax({
			url:"test/first.json",
			type:"get",
			dataType:"json",
			success:function(json){
				if (json.status == "0") {
					var data = json.data;
					if (data.length) {
						cur.createHeader(data);
					}
				}
			}
		})
	} 

	//生成左侧
	p.getAsideData = function(){
		var cur = this;
		$.ajax({
			url:"test/aside.json",
			type:"get",
			dataType:"json",
			success:function(json){
				if (json.status == "0") {
					var data = json.data;
					if (data.length) {
						cur.data = data;
						cur.createAside(cur.data[0],0)
					}
				}
			}
		})
	};

	//生成头部导航栏
	p.createHeader = function(data){
		var htmlStr = '';
		for (var i = 0; i < data.length; i++) {
			htmlStr+='<li class="'+data[i].class+'">'+data[i].title+'</li>';
		}
		this.$headerTab.append(htmlStr);
		this.eventHeaderList();
	}

	//给头部导航栏加事件
	p.eventHeaderList = function () {
		var cur = this;
		$('.headertab li').on('click',function(){
			var index = $(this).index();
			$(this).addClass("check_tabf").siblings().removeClass("check_tabf");
			cur.createAside(cur.data[index],index);
		})
	}

	//生成左侧导航栏，考虑第一个，没有，已经存在三种情况
	p.createAside = function(data,index){
		if (!data) {return ;}
		var cur = this;
		if (this.findInArr(index,this.indexArr)) {
			$('.sidebar > ul[order='+index+']').show().siblings().hide();
			return;
		}else{
			this.indexArr.push(index);
			$('.sidebar > ul').hide();
		}
		//动态生成
		var $htmlStr = '<ul order="'+index+'">';
		for (var i = 0; i < data.length; i++) {
			if (data[i].url) {
				$htmlStr += '<li _url="'+data[i].url+'">'+data[i].title;
			}else{
				$htmlStr += '<li>'+data[i].title;
			}
			$htmlStr += cur.rabbitCircle(data[i]);
			$htmlStr += '</li>';
		}
		$htmlStr += '</ul>';
		$('.sidebar').append($htmlStr);
	}

	//递归找数据
	p.rabbitCircle = function (data) {
		if (!data) {return '';}
		var str = '';
		if (data.son) {
			str += '<ul style="display:none;">';
			for (var i = 0; i < data.son.length; i++) {
				
				if (data.son[i].url) {
					str += '<li _url="'+data.son[i].url+'">'+data.son[i].title;
				}else{
					str += '<li>'+data.son[i].title;
				}
				str += this.rabbitCircle(data.son[i]);
				str += '</li>'
			}
			str += '</ul>';
		}
		return str;
	}

	// 设置content的宽高
	p.setConStyle = function () {
		
	} 

	//侧边栏事件委托
	p.sidebarEvent = function () {
		var cur = this ;

		$('.sidebar').on('click','li',function(event){
			// 存下点击对象的firstChild
			var $first = $(this).children().first();
			//判断是否有子级，没有即为打开iframe;
			if ($first.get(0)) {
				if ($first.css('display') == 'none') {
					$first.slideDown();
				}else{
					$first.slideUp();
				}
			}else{
				$('.sidebar li').removeClass('checked');
				var src = $(this).attr('_url');
				//打开iframe
				cur.iframeShow(src,$(this).html().split('<')[0]);
				cur.statusChange(src);
			}
			
			//阻止时间冒泡;
			event.stopPropagation();
		})
	}

	//显示iframe 存在三种情况，1，当前显示就是该iframe;2,要显示的iframe存在，只是暂时隐藏。3，要显示iframe还没有创建。
	p.iframeShow = function (src,str) {
		// 先隐藏所有的iframe
		$('iframe').removeClass('f-pressent');
		//清除iftitle-list li的默认状态
		$('.iftitle-list li').removeClass('list-active');

		if (this.findInArr(src,this.frameArr)) {
			$('iframe[src="'+src+'"]').addClass('f-pressent');
		}else{
			this.frameArr.push(src);
			this.iframeCreate(src,str);
		}
	}

	//创建iframe
	p.iframeCreate = function (src,str) {
		var cur = this,
			frameW = cur.w - $('.sidebar').width() - 20,
			frameH = cur.h - $('.header').height() - 40,
			frameStr = '<iframe src="'+src+'" class="f-pressent" frameborder="0" width="'+frameW+'"></iframe>';

		cur.$iframeBox.css({
			width:frameW,	
			height:frameH
		});
		cur.$iframeBox.append(frameStr);
		//创建iframe的同时创建iftitle-list 的li
		// cur.setFrHeight($('.f-pressent'));
		cur.iftitleLiCreate(src,str);
	}

	//设置iframe的高等于内容的高
	p.setFrHeight = function ($dom) {
		// iframe的页面请求需要时间
		$dom.load(function(){
			var innerHeight = $dom.contents().find("body").height();
			$dom.height(innerHeight);
		})
	}

	//创建iftitle-list下的li
	p.iftitleLiCreate = function (src,str) {
		var liStr = '<li class="list-active" _src="'+src+'" title="'+str+'">'+str+'<i class="close">&times;</i></li>';

		this.nTab++;
		this.$iftitleList.append(liStr);
		this.setLiWidth();
	}

	//关闭iframe事件委托
	p.closeEvent = function () {
		var cur = this;
		
		$('.iftitle-list').on('click','.close',function(event){
			//右键菜单隐藏
			$('.mright').hide();
			var $parent = $(this).parent();//li对象
			cur.closeOne($parent);
			
			//阻止时间冒泡;
			event.stopPropagation();
		})

		//点击.iftitle-list li
		$('.iftitle-list').on('click','li',function(event){
			cur.statusClear();
			cur.statusChange($(this).attr('_src'));
		})
	}

	//关闭单个的iframe
	p.closeOne = function ($this) {
		var cur = this,
		//获取当前展示的src
			iNowSrc = $('iframe.f-pressent').attr('src'),
		//获取当前点击对象的src
			srcStr = $this.attr('_src');

		//删除点击的父级li；
		$this.remove();
		cur.nTab--;
		cur.setLiWidth();
		//删除存的src数据；
		cur.findInArr(srcStr,cur.frameArr,true)
		//删除相应的iframe;
		$('iframe[src="'+srcStr+'"]').remove();
		//判断点击取消的是否为当前展示页面
		if (srcStr == iNowSrc) {
			$('.sidebar li[_url="'+srcStr+'"]').removeClass('checked');
			// 显示最后一个
			var $lastChild = $('.iftitle-list li:last-child');
			cur.statusChange($lastChild.attr('_src'));
		}
	}

	//关闭所有的iframe的点击事件
	p.closeAll = function () {
		var cur = this;
		$('.closeall').click(function () {
			cur.statusClear(true);
		})
	}

	//清空所有的状态,是否删除全部对象(关闭所有not有属性_src=src的对象);
	p.statusClear = function (bOk,src) {
		var cur = this,
			src = src || '';

		$('.sidebar li').removeClass('checked');
		if (bOk) {
			this.frameArr = [];
			$('.iftitle-list li:not([_src="'+src+'"])').remove();
			$('iframe:not([src="'+src+'"])').remove();
			if (src) {
				cur.nTab = 1;
				this.setLiWidth();
			}else{
				cur.nTab = 0
			}
			return ;
		}
		$('iframe').removeClass('f-pressent');
		$('.iftitle-list li').removeClass('list-active');
	}


	//相连状态的显示
	p.statusChange = function (src) {
		$('.sidebar li[_url="'+src+'"]').addClass('checked');
		$('iframe[src="'+src+'"]').addClass('f-pressent');
		$('.iftitle-list li[_src="'+src+'"]').addClass('list-active');
	}

	// 右键菜单
	p.rightEvent = function () {
		var cur = this,
		// 获取右键菜单对象
			$mright = $('.mright');

		//右键截取
		$('.iftitle-list').on('contextmenu','li',function(event){
			$mright.show().attr('closing',$(this).attr('_src')).css({
				left:event.pageX,
				top:event.pageY
			});
			return false;
		});
		$(doc).click(function(){
			$mright.hide();
		});
		$(doc).contextmenu(function(){
			$mright.hide();
		});

		$('.m-item').click(function(){
			var index = $(this).index(),
				closeSrc = $(this).parent().attr('closing');

			switch(index){
				case 1:
					//刷新
					break;
				case 2:
					//关闭单个
					cur.closeOne($('.iftitle-list li[_src="'+closeSrc+'"]'));
					break;
				case 3:
					//关闭其他
					cur.statusClear(true,closeSrc);
					cur.statusChange(closeSrc);
					break;
				default:
					break;
			}
		})
	}
	//页面resize检测
	p.resizeChange = function () {
		var cur = this;

		$(win).resize(function(){
			cur.w = $('.zbody').width();
			cur.h = $('.zbody').height();
			var reW = cur.w - $('.sidebar').width() - 20;
			var reH = cur.h - $('.header').height() - 40;
			$('iframe').attr({
				width: reW
			});
			cur.$iframeBox.css({
				width:reW,
				height:reH
			})
			cur.setLiWidth();
		})
	}

	//动态改变iftitle-list li的宽(页面size改变时，添加li时,删除单个li时,删除其他时)
	p.setLiWidth = function () {
		var cur = this,
			clientW = doc.documentElement.clientWidth,
			cW = clientW - $('.sidebar').width() - 20-20,
			$iftitleLi = $('.iftitle-list li');

		if (107*cur.nTab >= cW) {
			$iftitleLi.css('width',1/cur.nTab*(cW-7*cur.nTab));
		}else{
			$iftitleLi.css('width',100);
		}
	}

/*---------------------------功能函数部分-----------------------------*/

	//判断数组中是否存在某数。存在时，是否删除该项；
	p.findInArr = function (n,arr,bOk) {
		for (var i = arr.length - 1; i >= 0; i--) {
			if (n == arr[i]) {
				if(bOk){
					arr.splice(i,1);
				}
				return true;
			}
		}
		return false;
	}

/*	//消除选中文本问题
	p.selectNo = function () {
		
	}*/

	system.SySIndex = SySIndex;
})(window,document);