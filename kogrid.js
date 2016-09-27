;
(function($, window, document, undefined) {
	// 添加ko自定义绑定
	ko.bindingHandlers.append = {
		init : function(element, valueAccessor, allBindings, viewModel,
				bindingContext) {
			var value = valueAccessor(), allBindings = allBindings();
			$(element).append(value);
		}
	};
	// 扩展array方法
	Array.prototype.kocontains = function(obj) {
		var i = this.length;
		while (i--) {
			if (this[i] === obj) {
				return true;
			}
		}
		return false;
	};
	

	// ko的viewModel
	var ViewModel = function() {
		var self = this;
		self.container = ko.observable();
		self.toolbar = ko.observable();
		// 表格样式
		self.attr = null;
		self.css = null;
		self.style = null;
		// 表格是否只支持单选,true单选,flase多选
		self.singleSelect = ko.observable(false);
		// 表格是否添加复选框
		self.checkBox = ko.observable(true);
		// 是否显示分页
		self.paging = ko.observable();
		// ajax配置项
		self.ajax = null;
		// ajax请求额外提交参数
		self.queryParams = ko.observable();
		// 表格列配置
		self.columns = [];
		// 表格需要升序的列
		self.ascColumns = ko.observableArray();
		// 表格需要降序的列
		self.descColumns = ko.observableArray();
		// 表格需要排序的列
		self.sortColumns = ko.observableArray();
		// 表格每页可选显示数量
		self.listNums = ko.observableArray([ 10, 20, 30 ]);
		// 表格当前每页显示数量
		self.listNum = ko.observable();
		// 数据总数量
		self.totalCount = ko.observable(1);
		// 当前选中页
		self.selectPage = ko.observable(1);
		// 表格当前页数据
		self.records = ko.observableArray();
		// 选中行,在数据数组(也就是self.records)中的索引
		self.selectIndexs = ko.observableArray();
		// 选中所有行
		self.selectAllIndexs = ko.pureComputed({
			read : function() {
				return self.selectIndexs().length === self.records().length;
			},
			write : function(value) {
				if (value) {
					self.selectIndexs.removeAll();
					for (var i = 0; i < self.records().length; i++) {
						self.selectIndexs.push(i);
					}
				} else {
					self.selectIndexs.removeAll();
				}
			},
			owner : this
		});
		// 前省略号
		self.showStartPagerDots = ko.observable(false);
		// 后省略号
		self.showEndPagerDots = ko.observable(false);
		//前省略号点击事件
		self.startPagerDotsClick=function(){
			var pages = self.pages();
			var selectPage = pages[0]-1;
			if(selectPage <=0){
				selectPage = 1;
			}
			self.selectPage(selectPage);
			return true;
		};
		//后省略号点击事件
		self.endPagerDotsClick=function(){
			var pages = self.pages();
			var selectPage = pages[pages.length-1]+1;
			if(selectPage >self.totalPages()){
				selectPage = self.totalPages();
			}
			self.selectPage(selectPage);
			return true;
		};
		// 计算总页数
		self.totalPages = ko.computed(function() {
			var totalPage = Math.ceil(self.totalCount() / self.listNum());
			var totalPages = new Array();
			for (var i = 1; i <= totalPage; i++) {
				totalPages.push(i);
			}
			return totalPages;
		});
		// 计算需要显示的页数
		self.pages = ko.computed(function() {
			var pagerCount = 7;
			var result = [], start = 1, end = pagerCount;
			if (self.selectPage() >= pagerCount) {
				start = self.selectPage() - Math.floor(pagerCount / 2);
				self.showStartPagerDots(true);
			} else {
				self.showStartPagerDots(false);
			}
			end = start + pagerCount - 1;
			if (end >= self.totalPages().length) {
				end = self.totalPages().length;
				self.showEndPagerDots(false);
			} else {
				self.showEndPagerDots(true);
			}
			//不足pagerCount页,重新设置start值
			if(end - start < 6) {
				start = end - 6;
			}
			for (var i = start; i <= end; i++) {
				result.push(i);
			}
			return result;
		});
		// 显示从第几条到第几条
		self.display = ko.computed(function() {
			var displayNum = self.selectPage() * self.listNum();
			var from = displayNum - self.listNum() + 1;
			var to = displayNum > self.totalCount() ? self.totalCount()
					: displayNum;
			return from + '-' + to;
		});
		// ajax提交数据
		self.postData = function(data) {
			var ajaxOption = self.ajax;
			if (ajaxOption) {
				if (ajaxOption['success']) {
					delete ajaxOption['success'];
				}
				if (ajaxOption['error']) {
					delete ajaxOption['error'];
				}

				var $container = self.container();
				// 清除原有子表格
				$container.find(".subTable").each(function() {
					$(this).remove();
				});
				self.selectIndexs.removeAll();
				var param = {};
				var pageNum = self.listNum();
				if (data != undefined) {
					self.selectPage(data);
				}
				var selectPage = self.selectPage();
				param.pageSize = pageNum;
				param.fromIndex = pageNum * (selectPage - 1) + 1;
				var queryParams = self.queryParams();
				var sortColumns = self.sortColumns();
				var tempSortColumns = new Array();
				for (var i = 0; i < sortColumns.length; i++) {
					tempSortColumns.push({
						'column' : sortColumns[i]['column'],
						'order' : sortColumns[i]['order']()
					});
				}
				param = $.extend({}, ajaxOption['data'], param, queryParams, {
					'sortColumns' : JSON.stringify(tempSortColumns)
				});

				ajaxOption['data'] = param;
				ajaxOption['success'] = function(data) {
					if (data.result == 'OK') {
						if (self.paging()) {
							self.records(data.records);
							self.totalCount(data.totalCount);
						} else {
							self.records(data.records);
						}
					} else {
						alert(data.message);
					}

				};
				ajaxOption['error'] = function(data) {
					alert('服务器内部错误');
				};
				$.ajax(ajaxOption);
			}

			return true;

		};
		// 调跳转页处理方法
		self.gotoPage = function() {
			self.postData();
			return true;
		};
		// 改变每页显示条目数出发的方法
		self.changeListNum = function() {
			self.postData();
			return true;
		};
		self.selectRow = function(ele, data, event) {
			var selectedIndex = self.selectIndexs();
			var $ele = $(ele);
			var eleIndex = parseInt($ele.attr('index'));
			// 单选
			if (self.singleSelect()) {
				if (selectedIndex.kocontains(eleIndex)) {
					self.selectIndexs.remove(eleIndex);
				} else {
					self.selectIndexs.removeAll();
					self.selectIndexs.push(eleIndex);
				}

			} else {// 多选
				if (selectedIndex.kocontains(eleIndex)) {
					self.selectIndexs.remove(eleIndex);
				} else {
					self.selectIndexs.push(eleIndex);
				}
			}

			return true;
		};
		// 下一页方法
		self.nextPage = function() {
			var currentPage = self.selectPage();
			// 小于最大页数
			if (currentPage < self.totalPages().length) {
				self.selectPage(currentPage + 1);
			}
			return true;
		};
		// 上一页
		self.previousPage = function() {
			var currentPage = self.selectPage();
			// 小于最大页数
			if (currentPage > 1) {
				self.selectPage(currentPage - 1);
			}
			return true;
		};
		// 首页
		self.firstPage = function() {
			self.selectPage(1);
			self.postData();
			return true;
		};
		// 尾页
		self.lastPage = function() {
			var last = self.totalPages().length;
			if (last > 0) {
				self.selectPage(last);
			}
			self.postData();
			return true;
		};
		// 对表格列进行排序
		self.addSortColumn = function(data) {
			var column = data['column'] || data['field'];
			var sortColumn = {};
			if (data['sort']) {
				if (column) {
					var sortColumns = self.sortColumns();
					var flag = false;
					for (var i = 0; i < sortColumns.length; i++) {
						if (sortColumns[i]['column'] == column) {
							flag = true;
							sortColumn = sortColumns[i];
							break;
						}
					}

					if (flag && sortColumn['order']() == 'ASC') {
						sortColumn['order']('DESC');
					} else if (flag && sortColumn['order']() == 'DESC') {
						self.sortColumns.remove(sortColumn);
					} else {
						sortColumn.order = ko.observable('ASC');
						sortColumn.column = column;
						self.sortColumns.push(sortColumn);
					}
					self.postData();

				} else {
					$.error('please ensure the column <' + data.title
							+ '> has property column or field');
				}
			}
		};
		self.isAscColumn = function(data) {
			var column = data['column'] || data['field'];
			var flag = false;
			if (data['sort']) {
				if (column) {
					var sortColumns = self.sortColumns();
					for (var i = 0; i < sortColumns.length; i++) {
						if (sortColumns[i]['column'] == column
								&& sortColumns[i]['order']() == 'ASC') {
							flag = true;
							break;
						}
					}

				}
			}
			return flag;

		};
		self.isDescColumn = function(data) {
			var column = data['column'] || data['field'];
			var flag = false;
			if (data['sort']) {
				if (column) {
					var sortColumns = self.sortColumns();
					for (var i = 0; i < sortColumns.length; i++) {
						if (sortColumns[i]['column'] == column
								&& sortColumns[i]['order']() == 'DESC') {
							flag = true;
							break;
						}
					}

				}
			}
			return flag;
		};
	};

	// 通用操作对象
	var methods = {
		// 初始化表格
		'init' : function(options) {
			var opts = $.extend({}, $.fn.kogrid.defaults, options || {});
			var $kotable = $(this);
			// 表格添加工具条
			if (opts['toolbar']) {
				$kotable.append("<div class='kotoolbar'><span data-bind='text:toolbar().title()'></span>"
								+ "<!-- ko  foreach: toolbar().items -->"
								+ "<button type='button' class='btn btn-sm btn-default' data-bind='click:$data.click,html:$data.html'>"
								+ "</button>" + "<!-- /ko -->" + "</div>");

			}
			// 表格添加表头
			$kotable.append("<table  class='kotable table' data-bind='css:css,attr:attr'>"
							+ "<thead><tr>"
							+ "<th class='koTotalCheck' data-bind='visible:checkBox' width='100px'><span data-bind='visible:!singleSelect()'><input type='checkbox' name='koTotalcheck' data-bind='checked:selectAllIndexs'></span></th>"
							+ "<!-- ko foreach:columns -->"
							+ "<th data-bind='click:$parent.addSortColumn'>"
							+ "<span data-bind='text:$data.title'></span>"
							+ "<span data-bind='visible:$data.sort'>"
							+ "<span data-bind='css:{koSort:$parent.isAscColumn($data)}'  class='glyphicon glyphicon-triangle-top' aria-hidden='true'></span>"
							+ "<span data-bind='css:{koSort:$parent.isDescColumn($data)}' class='glyphicon glyphicon-triangle-bottom' aria-hidden='true'></span>"
							+ "</span>"
							+ "</th>"
							+ "<!-- /ko -->"
							+ "<tr></thead></table>");
			// 表格添加表体
			$kotable.children('table').first().append("<tbody data-bind='foreach : records,visible:records().length >0'><tr index data-bind='attr:{index:$index},css:{koSelected:$parent.selectIndexs().kocontains($index())},click:function(data,event){$parent.selectRow($element,data,event);return true;}'></tr></tbody>");
			var $kotableTbodyTr = $kotable.children('table').first().children(
					'tbody').first().children('tr').first();
			if (opts.checkBox) {
				$kotableTbodyTr
						.append("<td class='koCheck' data-bind='visible:$parent.checkBox' ><input type='checkbox' name='kocheck' data-bind='checkedValue: $index, checked: $parent.selectIndexs,click: function() { return true; }, clickBubble: false'></td>");
			}
			var columns = opts.columns;
			for (var i = 0; i < columns.length; i++) {
				var column = columns[i];
				if (column.display) {
					$kotableTbodyTr.append("<td  data-bind='attr:"
							+ JSON.stringify(column.attr) + ",css:"
							+ JSON.stringify(column.css) + ",style:"
							+ JSON.stringify(column.style)
							+ ",append:$parent.columns[" + i
							+ "].display($data,$element)'></td>");
				} else {
					$kotableTbodyTr.append("<td data-bind='text:"
							+ column.field + ",attr:"
							+ JSON.stringify(column.attr) + ",css:"
							+ JSON.stringify(column.css) + ",style:"
							+ JSON.stringify(column.style) + "'></td>");
				}
			}
			// 表格无数据时,表体显示
			$kotable.children('table').first().append(
							"<tbody data-bind='visible:records().length == 0'><tr ><td align='center'  colspan ='100' >没有查到相关数据!</td><tr></tbody>");
			// 表格下部 分页工具条
			$kotable.append("<div data-bind='visible: paging() && records().length > 0' class='row page' >"
							+ "<div class='col-xs-7'> "
							+ "<ul class='kopagination pagination' >"
							+ "<li data-bind='click:firstPage'><a href='javascript:void(0)' aria-label='Previous'><span aria-hidden='true'>首页</span></a></li>"
							+ "<li data-bind='click:previousPage,css:{disabled:selectPage() == 1}'><a href='javascript:void(0)' aria-label='Previous'><span aria-hidden='true'>上一页</span></a></li>"
							+ "<!-- ko if: showStartPagerDots -->"
							+ "<li><a href='javascript:void(0)' data-bind='event:{click:startPagerDotsClick}'> ... </a></li>"
							+ "<!-- /ko -->"
							+ "<!-- ko foreach: pages -->"
							+ "<li data-bind='css:{active:$parent.selectPage() == $data}' ><a href='javascript:void(0)'  data-bind='text:$data,event:{click:$parent.postData}'></a></li>        "
							+ "<!-- /ko -->"
							+ "<!-- ko if: showEndPagerDots -->"
							+ "<li><a href='javascript:void(0)' data-bind='event:{click:endPagerDotsClick}'> ... </a></li>"
							+ "<!-- /ko -->"
							+ "<li data-bind='click:nextPage,css:{disabled:selectPage() == totalPages().length}'><a href='javascript:void(0)' aria-label='Next'><span aria-hidden='true'>下一页</span></a></li>"
							+ "<li data-bind='click:lastPage'><a href='javascript:void(0)' aria-label='Previous'><span aria-hidden='true'>尾页</span></a></li>"
							+ "</ul></div>"
							+ "<div class='col-xs-5 pull-right'>  "
							+ "<div class='kopagination pagination'><span>跳转到<select data-bind='options:totalPages(),optionsText:$data,optionsValue:$data,value:selectPage,event:{change:gotoPage}'>      </select></span> <span>每页<select data-bind='options:listNums,optionsText:$data,optionsValue:$data,value:listNum,event:{change:changeListNum}'>            </select></span> "
							+ "<span>共<span data-bind='text:totalPages().length'></span>页</span>"
							+ "  <span>共<span data-bind='text:totalCount'></span>记录</span>"
							+ "<span>当前<span data-bind='text:display'></span></span>"
							+ "</div> </div></div>");
			var viewModel = new ViewModel();
			// mapping中的sortColumns方法,用于自定义生成监听数组对象,直接ko.mapping.fromjs不能达到,初始化的时候指定列排序方式功能
			var mapping = {
				'copy' : [ "columns", "ajax", "attr", "css", 'style' ],
				'sortColumns' : {
					create : function(options) {
						var sortColumn = {};
						sortColumn.column = options.data.column;
						sortColumn.order = ko.observable(options.data.order);
						return sortColumn;
					}
				}
			};
			ko.mapping.fromJS(opts, mapping, viewModel);
			viewModel.listNum(viewModel.listNums()[0]);
			viewModel.container($kotable);
			// ko绑定
			ko.applyBindings(viewModel, $kotable[0]);
			$kotable.data('viewModel', viewModel);

		},
		// 表格ajax加载数据
		'load' : function(queryParams) {
			var viewModel = $(this).data('viewModel');
			if (queryParams) {
				viewModel.queryParams(queryParams);
			}
			viewModel.selectPage(1);
			viewModel.postData();
		},
		// 手动加载数据
		'data' : function(records) {
			var viewModel = $(this).data('viewModel');
			// 直接加载进来数据,暂时不支持分页
			viewModel.paging(false);

			if (records && records.length > 0) {
				viewModel.records(records);
			}
		},
		'reload' : function() {
			var viewModel = $(this).data('viewModel');
			var totalPages = viewModel.totalPages();
			var lastPage = totalPages[totalPages.length - 1];
			if (viewModel.selectPage() > lastPage) {
				viewModel.selectPage(lastPage);
			}
			viewModel.postData();
		},
		'getRows' : function() {
			var viewModel = $(this).data('viewModel');
			return viewModel.records() || [];
		},
		'delRows' : function() {
			var viewModel = $(this).data('viewModel');
			viewModel.records.removeAll();
		},
		'getSelectRow' : function() {
			var viewModel = $(this).data('viewModel');
			var selectIndex = viewModel.selectIndexs();
			var records = viewModel.records();
			if (selectIndex.length > 0) {
				if (viewModel.singleSelect()) {
					return records[selectIndex[0]] || {};
				} else {
					var rows = new Array();
					for (var i = 0; i < selectIndex.length; i++) {
						rows.push(records[selectIndex[i]]);
					}
					return rows;
				}
			}
		}

	};
	// 主表格
	$.fn.kogrid = function() {
		var method = arguments[0];

		if (methods[method]) {
			method = methods[method];
			arguments = Array.prototype.slice.call(arguments, 1);
		} else if (typeof method === "object" || !method) {
			method = methods.init;
		} else {
			$.error("Method <" + method + "> does not exist on jQuery.plugin kogrid");
			return this;
		}
		return method.apply(this, arguments);

	};

	//默认配置项
	$.fn.kogrid.defaults = {
		queryParams : null,
		ascColumns : [],
		descColumns : [],
		singleSelect : false,
		checkBox : false,
		paging : true,
	};
	// 子表格
	$.fn.kosubgrid = function(options) {
		var $tr = $(this).closest('tr');
		var subTable = $tr.data('subTable');
		if (subTable === $(this)[0]) {
			$tr.next(".subTable").fadeToggle('slow', function() {
				$(this).remove();
			});
			return $tr.removeData('subTable');
		} else {
			$tr.removeData('subTable');
			$tr.next(".subTable").remove();
			$tr.data('subTable', $(this)[0]);
			$td = $("<td colspan ='100'></td>");
			$td.kogrid(options);
			$td.kogrid('load');
			var $innerTr = $("<tr class='subTable'></tr>");
			$innerTr.append($td);
			$innerTr.fadeToggle('slow');
			return $tr.after($innerTr);
		}
	};

})(jQuery, window, document);