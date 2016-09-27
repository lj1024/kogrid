# kogrid
knockout jquery  table plugin (ko表格插件)
#插件介绍
此插件是一个动态生成表格插件，插件依赖boostrap3,jquery,knockout(简称：ko)
#1.引入js和css文件
<!-- bootsrap3 css 样式-->
<link rel="stylesheet" href="resources/bootstrap/css/bootstrap.min.css">
<link rel="stylesheet" href="resources/bootstrap/css/bootstrap-theme.min.css">
<!-- kogrid css 样式-->
<link rel="stylesheet" href="/resources/kotable/kogrid.css">
<!-- jquery js -->
<script src="/resources/jquery/jquery-1.11.3.js"></script>
<script src="/resources/bootstrap/js/bootstrap.js"></script>
<!-- knockout js -->
<script src="/resources/knockout/knockout-3.3.0.js"></script>
<script src="/resources/knockout/knockout.mapping.js"></script>
<!-- kogrid js -->
<script src="/resources/kotable/kogrid.js"></script>
#2.初始化表格
首先需要一个承载容器，这里我用一个div
<div id="test" class="container table-responsive"></div>
然后调用：
$('#test').kogrid( {
		  //工具条
		  toolbar:{
			 'title':'用户表',
			 'items':[
			        {
			        	html:"<span class='glyphicon glyphicon-download-alt' aria-hidden='true'></span>",
			        	click:function(){
			        		alert('xxx');
			        	}
			        },
			        {
			        	html:"<span class='glyphicon glyphicon-star' aria-hidden='true'></span>",
			        	click:function(){
			        		$('#test').kogrid('reload');
			        	}
			        }
			        ]
		 },
		 //是否添加复选框
		checkBox:true,
		//是否分页
		paging:true,
		//是否允许单选
		singleSelect:false,
		//提前设置列排序方式,支持多列排序
		sortColumns:[{'column':'user_name','order':'ASC'}],
		//每页显示条目数
		listNums:[20,30,40],
    //控制表格样式
 		'css':'table-hover table-bordered',
     //ajax控制请求地址,返回数据格式：{"result":"OK","totalCount":1000,"records":[{"username":"1","password":"1","address":null,"rememberme":null,"sex":null},...],"message":"成功"}
		'ajax':{
			url:'customerad/koTestData',
			type:'post',
		},
		'columns' : [ {
			title : '姓名',//要显示的列名
			column : 'user_name',//数据库中的列名
			field : 'username',//返回数据的属性名
			sort:true//是否可排序
			}, {
			title : '密码',
			column : 'pass_word',
			field : 'password',
		}, {
			title : '操作',
			display : function(data, ele) {
				var $div=$("<span>"+data.username+data.password+"</span>");
				return $div;
			}
		} ]

	}); 
  这样就初始化出来表格
  #3.加载数据
   $('#test').kogrid('load');
  //或者带请求参数的加载数据
  $('#test').kogrid('load',{'name':'lisi','age':1});
  #4重新加载当前页数据
  $('#test').kogrid('reload');
  #5获取选中行数据
   $('#test').kogrid('getSelectRow');
  #6获取当前页所有数据
   $('#test').kogrid('getRows');
  7#最后强调下ajax返回的数据格式：
  {"result":"OK",//是否请求成功
  "totalCount":1000,//数据总数
  "records":[{"username":"1","password":"1","address":null,"rememberme":null,"sex":null},...],//当前页显示数据
  "message":"成功"//提示信息，请求失败的时候用于提示
  }
  
