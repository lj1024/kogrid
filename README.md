# kogrid
knockout jquery  table plugin (ko表格插件)
# 插件介绍
此插件是一个动态生成表格插件，插件依赖boostrap3,jquery,knockout(简称：ko)
#包含功能  
* ajax加载数据
* 手动加载数据
* 获取选中行数据
* 获取所有行数据
* 删除所有行数据
* 选择性添加复选框
* 选择性添加分页
* 选择性添加排序(支持多列,按照前后顺序排序)
* 添加子表格  
 
#生成的表格样式
基本的表格样式  
![生成的表格](https://github.com/lj1024/kogrid/blob/master/%E7%A4%BA%E4%BE%8B.png)  

带子表格的表格样式  
![带子表格的表格](https://github.com/lj1024/kogrid/blob/master/%E5%B8%A6%E5%AD%90%E8%A1%A8%E6%A0%BC%E7%A4%BA%E4%BE%8B.png)
#使用方法
##1.引入js和css文件
`<link rel="stylesheet" href="/resources/bootstrap/css/bootstrap.min.css">`  
`<link rel="stylesheet" href="/resources/bootstrap/css/bootstrap-theme.min.css">`  
`<link rel="stylesheet" href="/resources/kotable/kogrid.css">`  
`<script src="/resources/jquery/jquery-1.11.3.js"></script>`  
`<script src="/resources/bootstrap/js/bootstrap.js"></script>`  
`<script src="/resources/knockout/knockout-3.3.0.js"></script>`  
`<script src="/resources/knockout/knockout.mapping.js"></script>`  
`<script src="/resources/kotable/kogrid.js"></script>`  

##2.初始化表格
首先需要一个承载容器，这里我用一个div  
`<div id="test" class="container table-responsive"></div>`  
然后调用：  
`$('#test').kogrid( {`    
                `toolbar:{//添加工具栏 `   
			 `'title':'用户表',//工具栏标题`    
			 `'items':[//工具栏包含的工具`    
			        `{`
			        `html:"<span class='glyphicon glyphicon-download-alt' aria-hidden='true'></span>Star",`  
			        `click:function(){`  
			             `console.log($('#test').kogrid('getRows'));`  
			              `}`  
			        `},`  
			        `{`  
			        `html:"<span class='glyphicon glyphicon-star' aria-hidden='true'></span> Star",`  
			        `click:function(data,event){`  
			        	`console.log($('#test').kogrid('getSelectRow'));`  
			            `}`  
			        `}`  
			        `]`  
		 `},`  
		`//是否添加复选框`    
		`checkBox:true,`  
		`//是否分页`  
		`paging:true,`  
		`//是否允许单选`  
		`singleSelect:false,`  
		`//提前设置列排序方式,支持多列排序`  
		`sortColumns:[{'column':'user_name','order':'ASC'}],`  
		`//每页显示条目数`  
		`listNums:[20,30,40],`  
                 `//控制表格样式`
 		`'css':'table-hover table-bordered',`  
     `//ajax控制请求地址,返回数据格式：{"result":"OK","totalCount":1000,"records"[{"username":"1","password":"1","address":null,"rememberme":null,"sex":null},...],"message":"成功"}`  
		`'ajax':{`  
			`url:'customerad/koTestData',`  
			`type:'post',`  
		`},`  
		`'columns' : [ {`  
			`title : '姓名',//要显示的列名`  
			`column : 'user_name',//数据库中的列名`  
			`field : 'username',//返回数据的属性名`  
                        `style :{'width':5%},//控制样式`   
			`sort:true//是否可排序`  
			`}, {`  
			`title : '密码',`  
			`column : 'pass_word',`  
			`field : 'password',`  
		`}, {`  
			`title : '操作',`  
			`display : function(data, ele) {//使用此方法可以自定义列显示内容或者添加子表格,data为当前行数据,ele为当前td标签`  
			`var $div=$("<span></span>");`  
			`var $a = $("<a href='javascript:void(0)'>子表格</a>");`  
			`$a.click(function(){`  
				`//初始化子表格`  
				`$('#test').kogrid('childGrid',ele,{`  
						 `paging:false,`  
						`'ajax':{`  
							`url:'<s:url value='/'/>'+'customerad/koTestData',`  
							`type:'post',`  
						`},`  
						`'columns' : [ {`  
							`title : '姓名',`  
							`column : 'user_name',`  
							`field : 'username',`  
							`sort:true,`  
						`}, {`  
							`title : '密码',`  
							`column : 'pass_word',`  
							`field : 'password',`  
							`sort:true,`  
						`}]`  
					`});`  
					`//子表格加载数据`  
					`$('#test').kogrid('childLoad',ele,{'name':'lisi'});`  
		`} ]`    
	`}); `    
  这样就初始化出来表格  
##3.加载数据  
  ` $('#test').kogrid('load');`  
  //或者带请求参数的加载数据  
 ` $('#test').kogrid('load',{'name':'lisi','age':1});`  
##4.重新加载当前页数据  
  `$('#test').kogrid('reload');`  
##5.获取选中行数据  
   `$('#test').kogrid('getSelectRow');`  
##6.获取当前页所有数据  
  ` $('#test').kogrid('getRows');`  
##7.ajax返回的数据格式，只有此格式才能被正常解析  
  {"result":"OK",//是否请求成功  
  "totalCount":1000,//数据总数  
  "records":[{"username":"1","password":"1","address":null,"rememberme":null,"sex":null},...],//当前页显示数据  
  "message":"成功"//提示信息，请求失败的时候用于提示  
  }  
##8.子表格初始化  
   ` $('#test').kogrid('childGrid',ele,{options});`  
   ele是当前td标签，请参考列子当中的display方法   
##9.子表格加载数据
   ` $('#test').kogrid('childLoad',ele,{请求参数});`  
##10.子表格刷新数据
   ` $('#test').kogrid('childReload',ele);`  
##11.子表格获取选中行数据
   ` $('#test').kogrid('childGetSelectRow',ele);`    
##12.子表格获取所有行数据
   ` $('#test').kogrid('childGetRows',ele);`  
##13.子表格删除所有行数据
   ` $('#test').kogrid('childDelRows',ele);`     
##14.子表格手动加载数据
   ` $('#test').kogrid('childData',ele,{records});`   
