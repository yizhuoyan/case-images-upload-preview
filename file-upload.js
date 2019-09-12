(function(window,document){
	"use strict";
	var setting={
		previewWidth:160,
		previewHeight:240,
		url:(function(href){
				return "public-api/upload";
		})(window.location.href),
		
		version:"1.0"
	};
	
	var fileSelectInputEL,
		dragZone,
		uploadBtnEL,
		addFileBtnWrapper,
		uploadProgressBar,
		uploadProgressEL,
		fileTotalAmountEL,
		maxFileSizeEL,
		totalFileSizeEL,
		uploadProgressValueEL,
	last;
	//the selected files
	var selectedFilesDataModel=[];
	//the total file size
	selectedFilesDataModel.totalFileSize=0;
	//the max file size
	selectedFilesDataModel.maxFileSize=0;
	
	
	window.addEventListener("load",function(){
		fileTotalAmountEL=$("#up_fileTotalAmountEL");
		maxFileSizeEL=$("#up_maxFileSizeEL");
		totalFileSizeEL=$("#up_totalFileSizeEL");
		uploadBtnEL=$("#up_uploadBtn");
		addFileBtnWrapper=$("#up_addFileBtnWrapper");
		fileSelectInputEL=$("#up_selectFilesInputEL");
		dragZone=$("#up_dragZone");
		
		uploadProgressBar=$("#up_uploadProgressBar");
		uploadProgressValueEL=$("#up_uploadProgressValueEL");
		uploadProgressEL=$("#up_uploadProgressEL");
		
		//
		handleDragAndDropFile(dragZone);
		//
		fileSelectInputEL.addEventListener("change",handelSelectFileChange);
		//
		uploadBtnEL.addEventListener("click",handleUploadBtnClick,false);
		//
		resizeAddFileBtn();
	});
	
	
		var resizeAddFileBtn=function(){
			addFileBtnWrapper.style.width=setting.previewWidth+"px";
			addFileBtnWrapper.style.height=setting.previewHeight+"px";
			addFileBtnWrapper.style.boxSizing="border-box";
		}
		
		var  handelSelectFileChange=function(evt){
			var fs=this.files;
			for(var i=0,len=fs.length;i<len;i++){
				handleOneFile(fs[i]);
			}
			this.value="";
		};
		
		var handleDragAndDropFile=function(target){
			target.ondragover = target.ondragenter = function(evt) {
                evt.stopPropagation();
                evt.preventDefault();
                if(!this.classList.contains("ondraging")){
                	this.classList.add("ondraging");
                }
        	};
	        target.ondrop=function(evt) {
	                evt.stopPropagation();
	                evt.preventDefault();
	                this.classList.remove("ondraging");
	                var fs = event.dataTransfer.files;
	                for (var i=0; i<fs.length; i++) {
	                    handleOneFile(fs[i]);
	                }
	        };
		};
		
		selectedFilesDataModel.containsFile=function(f){
			var fs=selectedFilesDataModel;
			for(var i=fs.length;i-->0;){
				if($.fileEquals(fs[i],f)){
					return true;
				}
			}
			return false;
		};
		selectedFilesDataModel.addFile=function(f){
			//save file 
			f.index=this.length;
			this.push(f);
			fileTotalAmountEL.textContent=this.length;
			if(this.maxFileSize<f.size){
				this.maxFileSize=f.size;
				maxFileSizeEL.textContent=(this.maxFileSize/1024).toFixed(2);	
			}
			this.totalFileSize+=f.size;
			totalFileSizeEL.textContent=(this.totalFileSize/1024).toFixed(2);
		};
		selectedFilesDataModel.removeFile=function(f){
			this.splice(f.index,1);
			fileTotalAmountEL.textContent=this.length;
			var maxFileSize=0;
			for(var i=this.length;i-->0;){
				if(this[i].size>maxFileSize){
					maxFileSize=this[i].size;
				}
			}
			maxFileSizeEL.textContent=(maxFileSize/1024).toFixed(2);	
			this.totalFileSize-=f.size;
			totalFileSizeEL.textContent=(this.totalFileSize/1024).toFixed(2);
		}
		
		var handleOneFile=function(f){
			//no same file
			if(selectedFilesDataModel.containsFile(f)){
				return;
			}
			selectedFilesDataModel.addFile(f);
			//previewFile
			var fr=new FileReader();
			fr.onload=function(evt){
				var view=handleOneFile.createPreviewView(f,this.result);
				//dragZone.insertBefore(view,dragZone.lastElementChild);	
				dragZone.appendChild(view);	
			}
			fr.readAsDataURL(f);
		};
		
		handleOneFile.createPreviewView=function(f,imgData){
			
			var previewView=document.createElement("li");
			previewView.className="upload-preview-item";
			//previewView.title="双击放大";
			var imgEL=document.createElement("img");
			imgEL.style.display="none";
			var imgDetailDiv=document.createElement("div");
			imgDetailDiv.className="upload-preview-item-detail"
			var imgDetailSizeEL=document.createElement("small");
			imgDetailDiv.appendChild(imgDetailSizeEL);
			
			previewView.appendChild(imgEL);
			previewView.appendChild(imgDetailDiv);
			
			imgEL.onload=function(){
				var aw=this.width;
				var ah=this.height;
				this.setAttribute("data-width",aw);
				this.setAttribute("data-height",ah);
				f.width=aw;
				f.height=ah;
				imgEL.width=setting.previewWidth;
				imgEL.height=setting.previewHeight;
				imgEL.style.display="block";
				imgDetailSizeEL.textContent=(f.size/1024).toFixed(2)+"KB("+aw+"x"+ah+")";
			}
			imgEL.src=imgData;
			
			//delete btn
			var deleteBtn=document.createElement("a");
			deleteBtn.textContent="X";
			deleteBtn.className="upload-preview-item-btn";
			deleteBtn.addEventListener("click",handleDeleteBtnClick);
			
			
			
			
			
			previewView.appendChild(deleteBtn);
			
			
			//bind data
			deleteBtn.targetView=previewView;
			previewView.dataModel=f;
			f.previewView=previewView;
			
			return previewView;
		};
		var handleDeleteBtnClick=function(evt){
		 	var previewView=this.targetView;
		 	var deleteFile=previewView.dataModel;
		 	previewView.parentNode.removeChild(previewView);
		 	selectedFilesDataModel.removeFile(deleteFile);
		};
		
		
		var handleUploadBtnClick=function(evt){
			if(selectedFilesDataModel.length>0){
				uploadBtnEL.disabled=true;
				//show progress
				uploadProgressBar.style.visibility="visible";
				var run=function(){
				    if(uploadProgressEL.value<uploadProgressEL.max){
				        uploadProgressEL.value++;
                        setTimeout(run,30 );
                    }
				};
				run();
				
				$.uploadFiles(selectedFilesDataModel,function(value,max){
					if(value===-1){
					    uploadProgressEL.value=uploadProgressEL.max;
						uploadProgressValueEL.textContent="100%";
					}else{
					    uploadProgressEL.value=value;
					    uploadProgressEL.max=max;
						uploadProgressValueEL.textContent=Math.round(value/max*100)+"%";
					}
				}).catch(function(result){
					console.log(result);
					uploadProgressValueEL.textContent=String(result);
					uploadBtnEL.disabled=false;
					var fs=selectedFilesDataModel;
					while(fs.length>0){
						var f=fs[fs.length-1];
						f.view.parentNode.removeChild(f.view);
						fs.removeFile(f);
					}
				})
			}
			
		};
		
		
	
	
	
	
	var $=function(s,ctx){
		return (ctx||document).querySelector(s);
	};
	$.fileEquals=function(f1,f2){
		if(f1===f2)return true;
		if(f1){
			if(!f2)return false;
			var keys="name,lastModified,size,type".split(",");
			for(var i=0,len=keys.length,k;i<len;i++){
				k=keys[i];
				if(f1[k]!==f2[k]){
					return false;
				}
			}
			return true;
		}
		return f2===null;
	};
	
	$.uploadFiles=function(fs,progressListener){
		progressListener=progressListener||function(){};
		return new Promise(function(ok,failed){
			var fd=new FormData();
			for(var i=0,len=fs.length,f;i<len;i++){
				f=fs[i];
				fd.append(i+"-"+f.width+"x"+f.height,f);
			}
			var xhr=new XMLHttpRequest();
			xhr.withCredentials=true;
			xhr.open("post",setting.url,true);
			xhr.onprogress=function(pe){
			    if(pe.lengthComputable) {
			    	progressListener(pe.loaded,pe.total)
			    }
			};
			xhr.onloadend = function(pe) {
			    //progressListener(-1);
			}
		 	xhr.onreadystatechange = function() {
	            if (this.readyState == 4){ 
	            	if(this.status == 200) {
	                	var resp=this.responseText;
	                	ok(resp);
	                }else{
	                	failed(this.status,this.statusText);
	                }
	            }
	        };
	        xhr.send(fd);
		});
	};
		
	
})(window,document);
