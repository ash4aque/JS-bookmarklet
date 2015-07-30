(function(){

	var v = "1.3.2";
	if (!($ = window.jQuery)) {
		var done = false;
		var script = document.createElement("script");
		script.src = "http://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js";
		script.onload = script.onreadystatechange = function(){
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
				done = true;
				initMyBookmarklet();
			}
		};
		document.getElementsByTagName("head")[0].appendChild(script);
	} else {
		initMyBookmarklet();
	}
	
	function initMyBookmarklet() {
	
		(window.myBookmarklet = function() {

			var PageScraper = function() {
			  this.maxRequestLength = 4096;
			  this.itemData = {};
			  if(!this.itemData) {
			    this.itemData = this.getItemData();
			  }
			};

			PageScraper.prototype.getItemData = function(){
			  var itemData = {};

			  itemData.title = this.getTitle();
			  itemData.imageArray = this.getImageData();
			  //itemData.price = this.getPrice();
			  return itemData;
			};

			PageScraper.prototype.getImageData = function(includeSrc) {
		      var imgs = document.getElementsByTagName('img');
		      var imageArray = [];
		      var srcs = {};
		      for (var i=0;i<imgs.length;i++) {
		        var img = imgs[i];
		        if (img.src.length > this.maxRequestLength) {
		           continue;
		        }
		        if (img.src.length < 7 || typeof img.naturalWidth != 'undefined' && img.naturalWidth == 0 || !img.complete) {
		           continue;
		        }
		        if (srcs[img.src]) {
		           continue;
		        }
		        var pixelCount = img.height * img.width;
		        var squareness = 1;
		        
		        if (img.height > img.width && img.height > 0) {
		          squareness = img.width / img.height;
		        } else if (img.width > img.height && img.width > 0) {
		          squareness = img.height / img.width;
		        }

		        if (pixelCount > 1000 && squareness > 0.5) {
		          var imageIndex = imageArray.length;
		          imageArray[imageIndex] = {};
		          imageArray[imageIndex].src = img.src;
		          imageArray[imageIndex].height = img.height;
		          imageArray[imageIndex].width = img.width;
		          imageArray[imageIndex].id = img.id;
		          srcs[img.src] = 1;
		        }
		      };
		      return imageArray;
			};

			PageScraper.prototype.getTitle = function() {
			  var title = window.document.title;
			  if(typeof title != "string") {
			    return "";
			  }
			    
			  title = title.replace(/\s+/g,' ');
			  title = title.replace(/^\s*|\s*$/g,'');
			  
			  return title;
			};

			PageScraper.prototype.postData = function(data, url, cb) {

			    var f     = document.createElement('iframe'),
			        fname = (+((''+Math.random()).substring(2))).toString(36);

			    f.setAttribute('name', fname);
			    f.setAttribute('id', fname);
			    f.setAttribute('style', 'width:0;height:0;border:none;margin:none;padding:none;position:absolute;');

			    document.body.appendChild(f);

			    var frame = window.frames[fname], 
			        doc   = frame.document,
			        form  = doc.createElement('form'),
			        text  = doc.createElement('textarea');

			    text.setAttribute('name', 'data');
			    text.appendChild(doc.createTextNode(data));

			    form.setAttribute('action', url);
			    form.setAttribute('method', 'post');
			    form.appendChild(text);

			    doc.body.appendChild(form);

			    if (cb) { document.getElementById(fname).onload=cb; }

			    doc.forms[0].submit();
			};

			var ps = new PageScraper();
			var itemData = ps.getItemData()

			if ((ps != "") && (ps != null) && (typeof ps !== 'undefined')) {
				$("body").append("\
				<link href='http://dev.walmart.com/myJs/popover.css' rel='stylesheet'>\
				<div class='pop-container'>\
				  <div class='header'><img class='logo' src='http://dev.walmart.com/myJs/images/logo.png'></img><a target='_self'><img class='pop-cancel' src='http://dev.walmart.com/myJs/images/cancel.png'></img></a></div>\
				  <div class='body'>\
				    <div class='col1'>\
				      <img class='product js-prod' src='"+itemData.imageArray[0].src+"'></img>\
				      <div class='paginator'>\
				        <span class='prev'></span>\
				        <nobr class='count'><span class='currentImg'>1</span> of "+itemData.imageArray.length+"</nobr>\
				        <span class='next'></span>\
				      </div>\
				    </div>\
				    <div class='col2'>\
				      <div class='product-name'><input id='nameInput' class='input-name' type='text' name='nameInput' size='14' value='"+itemData.title+"'></div>\
				      <div class='product-name'><input id='priceInput' class='input-name' type='text' name='priceInput' size='14' value='Price'></div>\
				      <div class='product-name'><input id='pop-btn' class='input-btn' type='button' name='potBtn' value='Add to Wish List'></div>\
				    </div>\
				  </div>\
				</div>\
				");
			}
			
			$('.next').bind('click', function (evt) {
				var totalImage = itemData.imageArray.length;
				var currentImg = parseInt($('.currentImg').html());
				if (currentImg < totalImage) {
					currentImg += 1;
				}
				$('.js-prod').attr("src", itemData.imageArray[currentImg-1].src);
				$('.currentImg').html(currentImg);	
			});

			$('.prev').bind('click', function (evt) {
				var totalImage = itemData.imageArray.length;
				var currentImg = parseInt($('.currentImg').html());
				if (currentImg > 1 && currentImg <= totalImage) {
					currentImg -= 1;
				}
				var sr = itemData.imageArray[currentImg-1].src;
				$('.js-prod').attr("src", itemData.imageArray[currentImg-1].src);
				$('.currentImg').html(currentImg);
				
			});
			
			$(".pop-cancel").click(function(event){
				var bd = $(".pop-container")
				if (bd) {
                  bd.remove();
			    }	
			});

			$(".input-btn").click(function(event){
				var url = 'https://dev.walmart.com:8443/account/login' + '?u=' + encodeURIComponent(window.location) + '&t=' + encodeURIComponent(document.title);
				var data = 'ash4aque';
				ps.postData(data, url);
			});

		})();
	}

})();