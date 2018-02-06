const PIC_SERVER = "http://www.zskjsdxl.top:9090/"
const ENTRIES = 100

$(function() {
	if(!cookie_userType) {
    	$("#tab_edit").parent().hide();
    	$("#tab_area").parent().hide();
    	$("#tab_line").parent().hide();
    	$("#tabs_left li:eq(1)").hide();
    }

	$('#nav').css('visibility', 'visible')
	$('#main').css('visibility', 'visible')

	// keep 16:9
    var win_width = parseFloat($(document).width());
    $('body').css('height', win_width * 1080 / 1920 + 'px');
    $('p').each(function() {
        var h = $(this).parent().css('height');
        $(this).css('line-height', h);
    })

    $('a').each(function() {
        var h = $(this).parent().css('height');
        $(this).css('line-height', h);
    })

    // adjust logo
    var w = parseFloat($('#nav_left img').css('width'));
    var img_h = w * 0.2901;
    $('#nav_left img').css('height', img_h + 'px');
    var h = parseFloat($('#nav_left').css('height'));
    $('#nav_left img').css('margin-top', (h - img_h) / 2 + 'px');
    $('#nav_left img').css('margin-bottom', (h - img_h) / 2 + 'px');

    // welcome
    var myDate = new Date();
    var year = myDate.getFullYear();
    var month = myDate.getMonth() + 1;
    var day = myDate.getDate();
    var dayOfWeek = myDate.getDay();
    var dayOfWeekName = ['日', '一', '二', '三', '四', '五', '六'];
    $('#tabs_right p').text('欢迎您: ' + cookie_name + ' 今天是' + year + '年' + month + '月' + day + '月' +
        '   星期' + dayOfWeekName[dayOfWeek]);

    // ````````````````````````````` common use above

    // adjust search 
    $('#search p').css('line-height','');
	

	// adjust main3 areaset p
	$('#areaSet p').css('line-height','');
	$('#lineSet p').css('line-height','');

	deviceInfoShow();
	//页面显示
	$('#nav').css('visibility', 'visible');
    $('#main').css('visibility', 'visible');
	//logout
	$('#logout').click(function() {
		var data = {
			'userId': cookie_userId
		}
		$.ajax({
			url: '/v1/user/logout',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					// todo session clear
					window.location.href = 'login';
					Cookies.set('sessionId', null);
				} else {
					alert('用户登出失败');
					console.log(data);
				}
			}
		});
	});

	$('#tab_info').click(function() {
		$('#main2').hide();
		$('#main3').hide();
		$('#main4').hide();
		$('#main').show();
		deviceInfoShow();
	})

	$('#tab_edit').click(function() {
		$('#main').hide();
		$('#main3').hide();
		$('#main4').hide();
		$('#main2').show();
		deviceEditShow();
	})

	$('#tab_area').click(function() {
		$('#main').hide();
		$('#main2').hide();
		$('#main4').hide();
		$('#main3').show();
		areaSetShow();
	})

	$('#tab_line').click(function() {
		$('#main').hide();
		$('#main2').hide();
		$('#main3').hide();
		$('#main4').show();
		lineSetShow();
	})


	//设备信息
	$('body').on('click', '#dt1 tr', function() {
		$('#dt1 tr').css('background-color', 'white');
		// $(this).css('background-color', 'rgb(176,196,222)');
		$(this).css('background-color', 'rgb(3,161,161)');
		$('#search input:eq(2)').val($(this).find('td:eq(1)').text());
		$('#search input:eq(3)').val($(this).find('td:eq(2)').text());
		$('#search input:eq(4)').val($(this).find('td:eq(16)').text());
		$('#search input:eq(5)').val($(this).find('td:eq(17)').text());
		$('#search input:eq(6)').val($(this).find('td:eq(18)').text());
		$('#search .selectDanger:eq(1)').val(dangerType.indexOf($(this).find('td:eq(6)').text()) + 1);
	});

	$('#resetSubmit').click(function() {
		deviceInfoShow();
	})

	$('#searchSubmit').click(function() {
		// alert('click success');
		var deviceName = $('#search input:eq(0)').val();
		var deviceTele = $('#search input:eq(1)').val();
		var lineId = $('#search select:eq(3)').val();
		var dangerId = $('#search select:eq(4)').val();

		var lv = parseInt($("body").attr("data-level"));
		var area = [];
		for (var i = 0; i < lv+1; i++) {
			var tmp = $('#selectLevel' + i).find("option:selected").text();
			if (tmp !== "全部") {
				area.push(tmp);	
			}
		};
		if (area.length > 1) {
			area = area.join('/');
		} else {
			area = area[0];
		}

		var status = 2 - parseInt($('#searchStat').val());

		if (lineId == '0') {
			lineId = ''
		}
		if (lv == 0) {
			area = ''
		}

		var data = {
			'area': area,
			'deviceDangerID': $("#search .selectDanger").find("option:selected").val(),
			'lineId': lineId,
			'name': deviceName,
			'deviceTele': deviceTele,
			'status': status,
			'index': 0,
		};
		searchDevice(data);
	})

	$('#infoLast').click(function() {
		var data = {
			'userId': cookie_userId,
			'userType': cookie_userType,
			'index': parseInt($('#table').attr('infolist-index')) - 1,
			'order': 'deviceID',
		};
		deviceInfoList(data);
	});

	$('#infoNext').click(function() {
		var data = {
			'userId': cookie_userId,
			'userType': cookie_userType,
			'index': parseInt($('#table').attr('infolist-index')) + 1,
			'order': 'deviceID',
		};
		deviceInfoList(data);
	});

	$('#infoLast2').click(function() {
		var data = {
			'index': parseInt($('#table').attr('infoedit-index')) - 1,
			'order': 'deviceID',
			'userType': cookie_userType,
		};
		deviceInfoEdit(data);
	});

	$('#infoNext2').click(function() {
		var data = {
			'index': parseInt($('#table').attr('infoedit-index')) + 1,
			'order': 'deviceID',
		};
		deviceInfoEdit(data);
	});

	// 设备编辑
	$("#main2 input[type='checkbox']").each(function() {
		this.checked = false;
	});

	$('body').on('click', '#selectAll', function() {
		if (this.checked) {
			$("#main2 tbody input[type='checkbox']").each(function() {
				this.checked = true;
			});
		} else {
			$("#main2 tbody input[type='checkbox']").each(function() {
				this.checked = false;
			});
		}
	})

	$('#selectLevel0').change(function() {
		$("#selectLevel1").parent().addClass("hide");
		$("#selectLevel2").parent().addClass("hide");
		if ($('#selectLevel0').val() === "0") {
			$('#selectLevel1').parent().addClass("hide");
			$('#selectLevel2').parent().addClass("hide");
		} else {
			const parentId = $(this).find('option:selected').val();
			const data = {
				'parentId': parentId,
				'level': 1,
			};
			selectLevel(data);
		}
	})

	$('#selectLevel1').change(function() {
		$("#selectLevel2").parent().addClass("hide");
		if ($('#selectLevel1').val() === "0") {
			$('#selectLevel2').parent().addClass("hide");
		} else {
			const parentId = $(this).find('option:selected').val();
			const data = {
				'parentId': parentId,
				'level': 2,
			};
			selectLevel(data);
		}
	})

	$('.selectLevel0').change(function() {
		$(".selectLevel1").parent().addClass("hide");
		$(".selectLevel2").parent().addClass("hide");
		if ($('.selectLevel0').val() === "0") {
			$('.selectLevel1').parent().addClass("hide");
			$('.selectLevel2').parent().addClass("hide");
		} else {
			const parentId = $(this).find('option:selected').val();
			const data = {
				'parentId': parentId,
				'level': 1,
			};
			_selectLevel(data);
		}
	})

	$('.selectLevel1').change(function() {
		$(".selectLevel2").parent().addClass("hide");
		if ($('.selectLevel1').val() === "0") {
			$('.selectLevel2').parent().addClass("hide");
		} else {
			const parentId = $(this).find('option:selected').val();
			const data = {
				'parentId': parentId,
				'level': 2,
			};
			_selectLevel(data);
		}
	})

	//
	$('#addDevice').click(function() {
		$('#modalAdd input').val('');
		// selectDanger();
		selectLevels();
		$('#modalAdd').modal();
		$('#modalAdd-body input:eq(3)').val(cookie_userId);
	})

	$('#modalAdd .modal-footer button:eq(0)').click(function() {
		if ($('#modalAdd-body input:eq(4)').val() != $('#modalAdd-body input:eq(5)').val()) {
			alert('两次输入的密码不一致!');
			$('#modalAdd-body input:eq(4)').val('');
			$('#modalAdd-body input:eq(5)').val('');
		} else {
			var data = {
				'userName': $('#modalAdd-body input:eq(3)').val(),
				'password': $('#modalAdd-body input:eq(4)').val(),
			};
			if (checkUser(data) != 0) {
				var deviceID = $('#modalAdd-body input:eq(0)').val();
				var deviceName = $('#modalAdd-body input:eq(1)').val();
				var deviceTele = $('#modalAdd-body input:eq(2)').val();
				// var deviceMeid = $('#modalAdd-body input:eq(3)').val();
				if ($('#modalAdd-body .selectLevel2').val() == '0') {
					if ($('#modalAdd-body .selectLevel1').val() == '0') {
						var lv = 1;
					} else {
						var lv = 2;
					}
				} else {
					var lv = 3;
				}
				var parentId = $('#modalAdd-body .selectLevel' + (lv - 1)).find("option:selected").val();
				// var area = '';
				// for (var i = 0; i < lv; i++) {
				// 	// console.log(i)
				// 	var tmp = $('#modalAdd-body .selectLevel' + i).find("option:selected").text();
				// 	if (i == lv - 1) {
				// 		area += tmp
				// 	} else {
				// 		area += tmp + "/";
				// 	}

				// 	// console.log(area);
				// };

				var area = [];
				var levels = [];
				for (var i = 0; i < n; i++) {
					var tmp = $('#modalEdit-body .selectLevel' + i).find("option:selected").text();
					area.push(tmp);
					var tmp = $('#modalEdit-body .selectLevel' + i).val();
					levels.push(tmp);
				};

				var area = area.join('/');
				var levels = levels.join('/')

				var deviceDangerID = parseInt($('#modalAdd-body .selectDanger').find("option:selected").val());
				var lineName = $('#modalAdd-body .selectLine').find("option:selected").text();
				var lineId = $('#modalAdd-body .selectLine').find("option:selected").val();
				// alert(parentId);
				var data = {
					'userId': cookie_userId,
					'deviceID': deviceID,
					'deviceName': deviceName,
					'deviceMeid': "",
					'deviceTele': deviceTele,
					'area': area,
					'parentId': parentId,
					'deviceDangerID': deviceDangerID,
					'lineName': lineName,
					'lineId': lineId,
					'levels':levels
				}
				createDevice(data);
			}
		}
	})

	//
	$('#editDevice').click(function() {
		$('#modalEdit input').val('');
		var num = $('#main2 table tbody').find("input:checkbox:checked").length;
		if (num > 1) {
			alert('只可以选择一个设备!');
		} else if (num == 0) {
			alert('未选中设备!');
		} else {
			selectLevels();
			var tr = $("#main2 tbody input:checkbox:checked").parent().parent();

			var levels = tr.attr('levels');

			var levelIds = levels.split('/');
			for (var i = 0; i <levelIds.length; i++) {
				$(`#modalEdit-body .selectLevel${i}`).val(levelIds[i]);
				var data = {
					'parentId': levelIds[i],
					'level': i+1,
				}
				_selectLevel(data);
			}

			$('#modalEdit-body input:eq(0)').val(tr.find('td:eq(2)').text());
			$('#modalEdit-body input:eq(1)').val(tr.find('td:eq(3)').text());
			// $('#modalEdit-body input:eq(2)').val(tr.find('td:eq(7)').text());
			// $('#modalEdit-body input:eq(2)').val(cookie_userId);
			$('#modalEdit-body .selectDanger').val(tr.attr('devicedangerid'));
			$('#modalEdit-body .selectLine').val(tr.attr('lineid'));

			var danger = tr.find('td:eq(7)').text();
			var count = $('#modalEdit-body .selectDanger option').length;
			var i = 0;
			while (count) {
				if ($('#modalEdit-body .selectDanger option:eq(' + i + ')').text() == danger) {
					var tmpval = $('#modalEdit-body .selectDanger option:eq(' + i + ')').val();
					$('#modalEdit-body .selectDanger').val(tmpval);
					break;
				}
				i++;
				count--;
			}
			// var area = tr.find('td:eq(5)').text();
			// var tmp = [];
			// tmp = area.split('/');
			// var count = $('#modalEdit-body .selectLevel0 option').length;
			// var j = 0;
			// var parentId = "";
			// while (count) {
			// 	if ($('#modalEdit-body .selectLevel0 option:eq(' + j + ')').text() == tmp[0]) {
			// 		var tmpval = $('#modalEdit-body .selectLevel0 option:eq(' + j + ')').val();
			// 		$('#modalEdit-body .selectLevel0').val(tmpval);
			// 		parentId = tmpval
			// 		break;
			// 	}
			// 	j++;
			// 	count--;
			// }
			// for (var i = 1; i < 4; i++) {
			// 	if (tmp[i] == "") {
			// 		break;
			// 	} else {
			// 		var data = {
			// 			'parentId': parentId,
			// 			'level': i,
			// 		}
			// 		_selectLevel(data);
			// 		var count = $('#modalEdit-body .selectLevel' + i + ' option').length;
			// 		var j = 0;
			// 		while (count) {
			// 			if ($('#modalEdit-body .selectLevel' + i + ' option:eq(' + j + ')').text() == tmp[i]) {
			// 				var tmpval = $('#modalEdit-body .selectLevel' + i + ' option:eq(' + j + ')').val();
			// 				$('#modalEdit-body .selectLevel' + i).val(tmpval)
			// 				parentId = tmpval
			// 				break;
			// 			}
			// 			j++;
			// 			count--;
			// 		}
			// 	}
			// }
			$('#modalEdit').modal();
		}
	})

	$('#modalEdit .modal-footer button:eq(0)').click(function() {
		// if ($('#modalEdit-body input:eq(3)').val() != $('#modalEdit-body input:eq(4)').val()) {
		// 	alert('两次输入的密码不一致!');
		// 	$('#modalEdit-body input:eq(3)').val('');
		// 	$('#modalEdit-body input:eq(4)').val('');
		// } else {
			
		// }
		var data = {
			'userName': $('#modalEdit-body input:eq(2)').val(),
			'password': $('#modalEdit-body input:eq(3)').val(),
		};
		if (checkUser(data) != 0) {
			var tr = $("#main2 tbody input:checkbox:checked").parent().parent();
			var deviceID = tr.attr('id');
			var deviceName = $('#modalEdit-body input:eq(0)').val();
			var deviceTele = $('#modalEdit-body input:eq(1)').val();
			// var deviceMeid = $('#modalEdit-body input:eq(2)').val();
			if ($('#modalEdit-body .selectLevel1').val() == "0") {
				var parentId = $('#modalEdit-body .selectLevel0').val();
				var n = 1;
			} else {
				if ($('#modalEdit-body .selectLevel2').val() == "0") {
					var parentId = $('#modalEdit-body .selectLevel1').val();
					var n = 2;
				} else {
					var parentId = $('#modalEdit-body .selectLevel2').val();
					var n = 3;
				}
			}

			var area = [];
			var levels = [];
			for (var i = 0; i < n; i++) {
				var tmp = $('#modalEdit-body .selectLevel' + i).find("option:selected").text();
				area.push(tmp);
				var tmp = $('#modalEdit-body .selectLevel' + i).val();
				levels.push(tmp);
			};

			var area = area.join('/');
			var levels = levels.join('/')
			console.log(levels);
			var deviceDangerID = $('#modalEdit-body .selectDanger').find("option:selected").val();
			var lineName = $('#modalEdit-body .selectLine').find("option:selected").text();
			var lineId = $('#modalEdit-body .selectLine').find("option:selected").val();
			var data = {
				'deviceID': deviceID,
				'deviceName': deviceName,
				'deviceMeid': "",
				'deviceTele': deviceTele,
				'area': area,
				'parentId': parentId,
				'deviceDangerID': deviceDangerID,
				'lineName': lineName,
				'lineId': lineId,
				'levels':levels,
			}
			editDevice(data);
		}
	})

	//
	$('#deleteDevice').click(function() {
		var num = $('#main2 table tbody').find("input:checkbox:checked").length;
		if (num == 0) {
			alert('未选中设备!');
		} else {
			if (confirm('是否确定删除该设备？')) {
				var list = [];
				for (var i = 0; i < num; i++) {
					var id = $('#main2 table tbody').find("input:checkbox:checked:eq(" + i + ")").parent().parent().attr('id');
					list.push(id);
				}
				deleteDevice(list);
			}
		}
	})

	//
	$('#addDanger').click(function() {
		showDanger();
		$('#modalDanger').modal();
	})

	// $('#addLine').click(function(){
	//     showLine();
	//     $('#modalLine').modal();
	// })

	$('body').on('click', '.glyphicon-remove', function() {
		if (confirm("是否确定删除该隐患？")) {
			$(this).parent().parent().remove();
		}
	})

	$('#modalDanger .modal-footer button:eq(0)').click(function() {
		var list = [];
		var total = $('#modalDanger-body tbody tr').length;
		for (var i = 0; i < total - 1; i++) {
			var id = $('#modalDanger-body tbody tr:eq(' + i + ')').attr('id');
			var dangerName = $('#modalDanger-body tbody tr:eq(' + i + ')').find('td:eq(0)').text();
			var tmp = {
				'id': id,
				'dangerName': dangerName,
			}
			list.push(tmp);
		}
		if ($('#modalDanger-body input').val() != "") {
			var id = makeId();
			var dangerName = $('#modalDanger-body input').val();
			var tmp = {
				'id': id,
				'dangerName': dangerName,
			}
			list.push(tmp);
		}
		if (!list.length) {
			alert('请添加隐患！');
		} else {
			editDanger(list);
		}
	})

	//高级设置
	$('body').on('click', '#settings', function() {
		$('#modalSetting input').val('');
		$('#modalSetting select option').attr('selected', false);
		var num = $('#main2 table tbody').find("input:checkbox:checked").length;
		if (num > 1) {
			alert('只可以选择一个设备!');
		} else if (num == 0) {
			alert('未选中设备!');
		} else {
			var tr = $("#main2 tbody input:checkbox:checked").parent().parent();
			var id = tr.attr('id');
			$('#modalSetting input:eq(0)').val(tr.find('td:eq(2)').text());
			console.log(tr.html());
			console.log(tr.attr('resolution'));
			var status = tr.attr('channelNo2');
			$('#channelNo2').val(status);
			if (status == 1) {
				$('#channel2Name').removeAttr('disabled');
			}
			var status = tr.attr('channelNo3');
			$('#channelNo3').val(status);
			if (status == 1) {
				$('#channel3Name').removeAttr('disabled');
			}

			$('#channel3Name').val(tr.attr('channel3Name'));
			$('#channel2Name').val(tr.attr('channel2Name'));
			$('#channel1Name').val(tr.attr('channel1Name'));
			$('#photoSize').val(tr.attr('photosize'));
			$('#capturePeriod').val(tr.attr('captureperiod'));
			$('#captureTimes').val(tr.attr('capturetimes'));
			$('#resolution').val(tr.attr('resolution'));

			for (var i = 0; i < 24; i++) {
				$('#beginHour').append('<option value="' + i + '">' + i + '</option>');
				$('#endHour').append('<option value="' + i + '">' + i + '</option>');
			}

			for (var i = 0; i < 60; i++) {
				$('#beginMin').append('<option value="' + i + '">' + i + '</option>');
				$('#endMin').append('<option value="' + i + '">' + i + '</option>');
			}

			var beginHour = tr.attr('beginHour');
			var beginMin = tr.attr('beginMinutes');
			var endHour = tr.attr('endHour');
			var endMin = tr.attr('endMinutes');

			$('#beginHour').val(beginHour);
			$('#beginMin').val(beginMin);
			$('#endHour').val(endHour);
			$('#endMin').val(endMin);
			$('#modalSetting').modal();
		}
	})

	$('#modalSetting .modal-footer button:eq(0)').click(function() {
		// if ($('#modalSetting-body input:eq(6)').val() != $('#modalSetting-body input:eq(7)').val()) {
		// 	alert('两次输入的密码不一致!');
		// 	$('#modalSetting-body input:eq(6)').val('');
		// 	$('#modalSetting-body input:eq(7)').val('');
		// } else {
			
		// }
		var data = {
			'userName': $('#modalSetting-body input:eq(5)').val(),
			'password': $('#modalSetting-body input:eq(6)').val(),
		};
		if (checkUser(data) != 0) {
			var deviceID = $('#main2 table tbody').find("input:checkbox:checked").parent().parent().attr('id');
			var deviceName = $('#deviceName').val();
			var channel1Name = $('#channel1Name').val();
			var channel2Name = $('#channel2Name').val();
			var channel3Name = $('#channel3Name').val();
			var beginHour = $('#beginHour').find('option:selected').val();
			var beginMin = $('#beginMin').find('option:selected').val();
			var endHour = $('#endHour').find('option:selected').val();
			var endMin = $('#endMin').find('option:selected').val();
			var photoSize = parseInt($('#photoSize').find('option:selected').val());
			var capturePeriod = parseInt($('#capturePeriod').find('option:selected').val());
			var resolution = parseInt($('#resolution').find('option:selected').val());
			var channelNo2 = parseInt($('#channelNo2').find('option:selected').val());
			var channelNo3 = parseInt($('#channelNo3').find('option:selected').val());
			var captureTimes = $('#captureTimes').val();

			var data = {
				'deviceID': deviceID,
				'deviceName': deviceName,
				'beginHour': beginHour,
				'beginMin': beginMin,
				'endHour': endHour,
				'endMin': endMin,
				'photoSize': photoSize,
				'capturePeriod': capturePeriod,
				'captureTimes': captureTimes,
				'resolution': resolution,
				'channel1Name': channel1Name,
				'channel2Name': channel2Name,
				'channelNo2': channelNo2,
				'channel3Name': channel3Name,
				'channelNo3': channelNo3,
			};
			SettingsDevice(data);
		}
	})

	$('#channelNo2').change(function() {
		if ($(this).find('option:selected').text() == "启用") {
			$('#channel2Name').removeAttr('disabled');
		} else {
			$('#channel2Name').attr('disabled', "disabled");
		}
	})

	$('#channelNo3').change(function() {
		if ($(this).find('option:selected').text() == "启用") {
			$('#channel3Name').removeAttr('disabled');
		} else {
			$('#channel3Name').attr('disabled', "disabled");
		}
	})

	$('#channelSelect').change(function() {
		var deviceID = $('body').attr('hover-deviceId') || $('#main2 table tbody').find("input:checkbox:checked").parent().parent().attr('id');;
		var channelNo = parseInt($(this).val());;
		var data = {
			deviceID: deviceID,
			channelNo: channelNo,
		}
		getRefInfo(data);
	})

	// var elem = document.querySelector('#slider');//选择input元素
	// var init = new Powerange(elem, { min: 1, max: 20, start: 10 });//实例化powerange类并且初始化参数


	$('#setPicRef').click(function() {
		var modalH = parseInt($('#modalRef .modal-content').css('height'));
		// $('#modalRef .modal-dialog').css('padding-top','100px');

		var num = $('#main2 table tbody').find("input:checkbox:checked").length;
		if (num > 1) {
			alert('只可以选择一个设备!');
		} else if (num == 0) {
			alert('未选中设备!');
		} else {
			// $('#channelSelect').val('1');
			$('#canvas').css('background-image', '')
			var deviceID = $('#main2 table tbody').find("input:checkbox:checked").parent().parent().attr('id');
			var channelNo = 1;
			var data = {
				deviceID: deviceID,
				channelNo: channelNo,
			}
			getRefInfo(data);
			$('#modalRef').modal();
		}
	})

	$('#modalRef .modal-footer button:eq(0)').click(function() {
		// for(var i=0;i<points.length;i++){
		// }
		var deviceID = $('#main2 table tbody').find("input:checkbox:checked").parent().parent().attr('id') || $('body').attr('hover-deviceId');
		var channelNo = parseInt($('#channelSelect').val());
		var sensitivity = parseInt($('#senseSelect').val());
		if (sensitivity == 0) {
			alert('请选择敏感度!');
		} else if (points.length == 0) {
			alert('尚未绘出对比区域！');
		} else {
			if (points.length == 1) {
				points.push({
					x: 0,
					y: 0,
					endX: 0,
					endY: 0,
				});
				points.push({
					x: 0,
					y: 0,
					endX: 0,
					endY: 0,
				});
			}
			if (points.length == 2) {
				points.push({
					x: 0,
					y: 0,
					endX: 0,
					endY: 0,
				});
			}
			var data = {
				deviceID: deviceID,
				channelNo: channelNo,
				points: points,
				sensitivity: sensitivity,
			};

			$.ajax({
				url: '/v1/device/setRefArea',
				type: "POST",
				data: JSON.stringify(data),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				async: false,
				success: function(data) {
					if (data.code == 0) {
						alert('设置对比区域成功！');
					} else {
						alert('设置对比区域失败！');
					}
				}
			})
		}
	})

	//`update
	$('#update').click(function() {
		$('#avatar').empty();
		var num = $('#main2 table tbody').find("input:checkbox:checked").length;
		if (num > 1) {
			alert('只可以选择一个设备!');
		} else if (num == 0) {
			alert('未选中设备!');
		} else {
			var deviceId = $('#main2 table tbody').find("input:checkbox:checked").parent().parent().attr('id');
			$('#update').attr('deviceId', deviceId);
			findUpdateFiles(cookie_userId);
		}
	})

	function findUpdateFiles(userId) {
		var data = {userId: userId};
		$.ajax({
			url: '/v1/device/find/updateFiles',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data) {
				if (data.code == 0) {
					$('#fileList').empty();
					var list = data.result.list;
					list.forEach(item => {
						var $ctrl = `<div><button class="deleteFile" style="margin-right:20px;">删除</button><input filename="${item}" type="radio">${item}</div>`;
						$('#fileList').append($ctrl);
					});
					$('#modalUpdate').modal();
				} else {
					alert('处理失败！');
					console.log(data);
				}
			}
		}) // end of ajax
	}

	$('#modalUpdate').on('click','.deleteFile',function(){
		if(confirm("是否确定删除该升级文件？")){
			var filename = $(this).next().attr('filename');
			var data = {'filename': filename};
			$.ajax({
				url: '/v1/device/delete/updateFiles',
				type: "POST",
				data: JSON.stringify(data),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function(data) {
					if (data.code == 0) {
						alert('删除成功!');
						findUpdateFiles(cookie_userId);
					} else {
						alert('处理失败！');
						console.log(data);
					}
				}
			}) // end of ajax
		}
	});

	$('#modalUpdate .modal-footer button:eq(0)').click(function() {
		var filename = $('#modalUpdate input:checked').attr('filename');
		var deviceId = $('#update').attr('deviceId');
		var data = {
			'deviceId': deviceId,
			'filename': filename,
		};
		var content = '';
		var file = {
			'filename': filename,
			'deviceId': deviceId,
		};
		$.ajax({
			url: '/v1/device/klUpdateDevice',
			type: "POST",
			data: JSON.stringify(file),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data) {
				if (data.code == 0) {
					alert('发送升级命令成功！');
					$('#modalUpdate').modal('hide');
				} else if (data.code == NO_SOCKET || data.code == SERVER_ERROR) {
					alert('与设备服务器连接失败！错误码：' + data.code);
				} else {
					alert('发送升级命令失败！');
				}
			}
		});
	});

	//`backup
	$('#backup').click(function() {
		window.location.href = "http://www.zskjsdxl.top:6178/download";
	})


	// //`upload
	// $('#upload').click(function() {
	// 	$('#progressbar').hide();
	// 	$('#avatar').empty();
	// 	$('#modalUpload').modal();
	// })

	$('#avatar').change(function() {
		var file = this.files[0];
		if(file){
			console.log(file);
			console.log(`${file.name},${file.size},${file.type}`);
		}
	});

	

	$('#uploadConfirm').click(function() {
		var formData = new FormData();
		console.log($('#avatar').prop('files'));
		formData.append('avatar', $('#avatar').prop('files')[0]);
		$('#progressbar').show();

		function progressHandler(e) {
			if (e.lengthComputable) {
				$("#progressbar").progressbar({
					value: e.loaded,
					max: e.total
				});
			}
		}

		$.ajax({
			url: '/api/upload/update',
			type: 'POST',
			data: formData,
			cache: false,
			processData: false,
			contentType: false,
			xhr: function() { // custom xhr
				var myXhr = $.ajaxSettings.xhr();
				if (progressHandler && myXhr.upload) { // check if upload property exists
					myXhr.upload.addEventListener('progress', progressHandler, false); // for handling the progress of the upload
				}
				return myXhr;
			}
		})
		.then(function(data) {
			if (data.flag == 1) {
				alert('上传成功！');
				findUpdateFiles(cookie_userId);
			} else {
				alert('上传失败！请重新上传！');
			}
		});
		console.log("after ajax!");
	});

	//`reset
	$('#reset').click(function() {
		var num = $('#main2 table tbody').find("input:checkbox:checked").length;
		if (num > 1) {
			alert('只可以选择一个设备!');
		} else if (num == 0) {
			alert('未选中设备!');
		} else {
			var deviceId = $('#main2 table tbody').find("input:checkbox:checked").parent().parent().attr('id');
			$('#reset').attr('deviceId', deviceId);
			$('#modalReset input').attr('checked', false);
			$('#modalReset').modal();
		}
	})

	$('#modalReset .modal-footer button:eq(0)').click(function() {
		var mode = parseInt($('#modalReset .modal-body input:checked').val());
		var deviceId = $('#reset').attr('deviceId');
		var data = {
			'deviceId': deviceId,
			'mode': mode,
		};
		$.ajax({
			url: '/v1/command/klResetDevice',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data) {
				if (data.code == 0) {
					alert('设备复位成功！');
					$('#modalReset').modal('hide');
				} else if (data.code == NO_SOCKET || data.code == SERVER_ERROR) {
					alert('与设备服务器连接失败！错误码：' + data.code);
				} else {
					alert('复位失败！');
				}
			}
		})
	});

	//线路设置



	$('#addLevel0').click(function() {
		var name = $(this).prev().val();
		var data = {
			'name': name,
			'parentId': 'root',
			'parentLevel': -1
		}
		createLevel(data);
	})

	$('#addLevel').click(function() {
		var levelSelected = $('#levelTree').treeview('getSelected');
		var parentId = levelSelected[0].id;
		var parentLevel = levelSelected[0].level;
		var name = $(this).prev().val();
		var data = {
			'name': name,
			'parentId': parentId,
			'parentLevel': parentLevel,
		}
		createLevel(data);
	})

	$('#editLevel').click(function() {
		var levelSelected = $('#levelTree').treeview('getSelected');
		var id = levelSelected[0].id;
		var name = levelSelected[0].text;
		var level = levelSelected[0].level;
		var newName = $('#editLevel').prev().val();

		var data = {
			'id': id,
			'name': name,
			'newName': newName,
			'level': level,
		}
		if (newName == '') {
			alert('未输入任何名称！');
		} else if (newName == name) {
			alert('未作任何更改！')
		} else {
			editLevel(data);
		}
	})

	$('#deleteLevel').click(function() {
		var levelSelected = $('#levelTree').treeview('getSelected');
		var id = levelSelected[0].id;
		var data = {
			'id': id,
		}
		if (confirm("是否确定删除该线路？删除后其下所有线路也被删除")) {
			deleteLevel(data);
		}
	})

	$('#addLine').click(function() {
		var lineSelected = $('#lineTree').treeview('getSelected');
		var parentId = lineSelected[0].id;

		var name = $(this).prev().val();
		var data = {
			'name': name,
			'parentId': parentId,
		};

		createLine(data);
	})

	$('#editLine').click(function() {
		var lineSelected = $('#lineTree').treeview('getSelected');
		var id = lineSelected[0].id;
		var name = lineSelected[0].text;
		var newName = $('#editLine').prev().val();

		var data = {
			'id': id,
			'name': name,
			'newName': newName,
		}
		if (newName == '') {
			alert('未输入任何名称！');
		} else if (newName == name) {
			alert('未作任何更改！')
		} else {
			editLine(data);
		}
	})

	$('#deleteLine').click(function() {
		var lineSelected = $('#lineTree').treeview('getSelected');
		var id = lineSelected[0].id;
		var data = {
			'id': id,
		}
		if (confirm("是否确定删除该线路？删除后其下所有线路也被删除")) {
			deleteLine(data);
		}
	})

	//for painter
	// InitThis();

	//
	$('body').on('click', 'table a', function() {
		var deviceID = $(this).parent().parent().attr('id');
		$('body').attr('hover-deviceId', deviceID);
		$('#channelSelect').val('1');
		$('#canvas').css('background-image', '')
			// alert($(this).text());
		var txt = $(this).text().slice(-1);
		// alert(txt);
		var channelNo = parseInt(txt);
		var data = {
			deviceID: deviceID,
			channelNo: channelNo,
		}
		getRefInfo(data);
		// $('#modalRef').modal();
	})

	

	// ` deviceInfoList
	// `1
	function deviceInfoList(inputData) {
		var data = {
			'userId': cookie_userId,
			'index': inputData.index,
			'size': ENTRIES,
			'order': inputData.order,
			'userType': cookie_userType,
		};
		$.ajax({
			url: '/v1/device/info/list',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					var list = data.result.list;
					dataTableInit(list);
				} else {
					console.log('获取设备信息列表失败');
				}
			}
		})
	}

	function dataTableInit(data) {
		var height = parseInt($('#search').css('height')) * 0.85;
		var dt = $('#dt1').DataTable({
			data: data,
			pageLength: 100,
			scrollY: height+"px",
			scrollX: true,
			destroy:true,
			columns: [
				{"data": null},
				{"data": "deviceName"},
				{"data": "deviceTele"},
				{"data": "version"},
				{"data": "area"},
				{"data": "lineName"},
				{"data": "deviceDangerID"},//6
				{"data": "status"},//7
				{"data": "heartBeatTime"},
				{"data": "temperature"},//9
				{"data": "batteryVoltage"},
				{"data": "batterySolarVoltage"},
				{"data": "capacityVoltage"},
				{"data": "networkSignal"},//13
				{"data": "countPicDay"},
				{"data": "countPicMonth"},
				{"data": "latitude"},
				{"data": "longitude"},
				{"data": "deviceId"},
			],
			"columnDefs":[
				{
					"render": function(data, type, row, meta){
						return dangerType[data-1] ;
					},
					"targets": 6
				},
				{
					"render": function(data, type, row, meta){
						return data == 0 ? '离线' : '在线';
					},
					"targets": 7
				},
				{
					"render": function(data, type, row, meta){
						return toFix3(data) ;
					},
					"targets": [9,10,11,12,13]
				},
			],
			"language": {
				"lengthMenu":     "显示 _MENU_ 条",
				"info":           "显示 _START_ to _END_ of _TOTAL_ 条",
				"infoEmpty":      "显示 0 to 0 of 0 条",
				"search":         "搜索:",
				"paginate": {
			        "first":      "首页",
			        "last":       "末页",
			        "next":       "下一页",
			        "previous":   "上一页"
			    },
			},
			"createdRow": function ( row, data, index ) {
                    if ( data['status'] == 0 ) {
                        $('td', row).eq(7).css('color', 'red');
                    }else{
                    	$('td', row).eq(7).css('color', 'blue');
                    }
                },
		});
		dt.on('order.dt search.dt',
		    function() {
		        dt.column(0, {
		            "search": 'applied',
		            "order": 'applied'
		        }).nodes().each(function(cell, i) {
		            cell.innerHTML = i + 1;
		        });
		    }).draw();
	}

	function dataTable2Init(data) {
		var height = parseInt($('#table2').css('height')) * 0.8;
		var dt = $('#dt2').DataTable({
			data: data,
			pageLength: 100,
			scrollY: height + "px",
			scrollX: false,
			destroy:true,
			columns: [
				{"data": null},
				{"data": null},
				{"data": "deviceName"},
				{"data": "deviceTele"},
				{"data": "version"},
				{"data": "area"},
				{"data": "lineName"},
				{"data": "deviceDangerID"},
				{"data": "deviceId"},
				{"data": "deviceId"},
			],
			columnDefs: [
				{
					"render": function(data, type, row, meta){
						return '<input type="checkbox"/>';
					},
					"targets": 0
				},
				{
					"render": function(data, type, row, meta){
						return dangerType[data-1] ;
					},
					"targets": 7
				},
				{
					"render": function(data, type, row, meta){
						var template_0 = "<a href = '#' style = 'margin-left:10px;' onmouseout='hiddenPic();' onmousemove='showPic(event,\"";
						var html1 = template_0 + row.picUrl1 + "\");'>摄像头1</a>";
						var html2 = template_0 + row.picUrl2 + "\");'>摄像头2</a>";
						var html3 = template_0 + row.picUrl3 + "\");'>摄像头3</a>";
						var htmls = ''

						var template_1 = "<p style='margin-left:10px;display:inline-block'>";
						if(row.picUrl1==''){
							var html1 = template_1 + "摄像头1</p>";
						}
						if(row.picUrl2==''){
							var html2 = template_1 + "摄像头2</p>";
						}
						if(row.picUrl3==''){
							var html3 = template_1 + "摄像头3</p>";
						}

						if (row.refPicPath1 != '' && row.channelNo1 == 1) {
							htmls += html1;
						}
						if (row.refPicPath2 != '' && row.channelNo2 == 1) {
							htmls += html2;
						}
						if (row.refPicPath3 != '' && row.channelNo3 == 1) {
							htmls += html3;
						}
						return htmls ;
					},
					"targets": 9
				}
			],
			"createdRow": function ( row, data, index ) {
                $(row).attr('id', data.deviceId);
                $(row).attr('channelNo1', data.channelNo1);
                $(row).attr('channel1Name', data.channel1Name);
                $(row).attr('channelNo2', data.channelNo2);
                $(row).attr('channel2Name', data.channel2Name);
                $(row).attr('channelNo3', data.channelNo3);
                $(row).attr('channel3Name', data.channel3Name);
                $(row).attr('beginHour', data.beginHour);
                $(row).attr('beginMinutes', data.beginMinutes);
                $(row).attr('endHour', data.endHour);
				$(row).attr('endMinutes', data.endMinutes);
                $(row).attr('photoSize', data.photoSize);
                $(row).attr('capturePeriod', data.capturePeriod);
                $(row).attr('captureTimes', data.captureTimes);
                $(row).attr('resolution', data.resolution);
                $(row).attr('devicedangerid', data.devicedangerid);
                $(row).attr('lineId', data.lineId);
                $(row).attr('levels', data.levels);
            },
			"language": {
				"lengthMenu":     "显示 _MENU_ 条",
				"info":           "显示 _START_ to _END_ of _TOTAL_ 条",
				"infoEmpty":      "显示 0 to 0 of 0 条",
				"search":         "搜索:",
				"paginate": {
			        "first":      "首页",
			        "last":       "末页",
			        "next":       "下一页",
			        "previous":   "上一页"
			    },
			},
		});
		dt.on('order.dt search.dt',
	    function() {
	        dt.column(1, {
	            "search": 'applied',
	            "order": 'applied'
	        }).nodes().each(function(cell, i) {
	            cell.innerHTML = i + 1;
	        });
	    }).draw();
	}

	// ` deviceInfoEdit
	// `2
	function deviceInfoEdit(inputData) {
		var data = {
			'userId': cookie_userId,
			'userType': cookie_userType,
			'index': inputData.index,
			'size': ENTRIES,
			'order': inputData.order,
		};
		$.ajax({
			url: '/v1/device/info/list',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					var list = data.result.list;
					dataTable2Init(list);
				} else {
					alert('获取设备树失败');
				}
			}
		})
	}

	function createDevice(inputData) {
		var data = {
			'userId': inputData.userId,
			'deviceID': inputData.deviceID,
			'name': inputData.deviceName,
			'area': inputData.area,
			'deviceDangerID': inputData.deviceDangerID,
			'parentId': inputData.parentId,
			'deviceMeid': inputData.deviceMeid,
			'deviceTele': inputData.deviceTele,
			'lineName': inputData.lineName,
			'lineId': inputData.lineId,
			'levels':inputData.levels,
		};
		$.ajax({
			url: '/v1/device/create',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					alert('创建设备成功！');
					var tmp = {
						'index': 0,
						'order': 'deviceID',
					}
					$('#modalAdd').modal('hide');
					deviceInfoList(tmp);
					deviceInfoEdit(tmp);
				} else {
					alert('创建设备失败！');
				}
			}
		})
	}

	function editDevice(inputData) {
		var data = {
			'deviceID': inputData.deviceID,
			'name': inputData.deviceName,
			'area': inputData.area,
			'deviceDangerID': inputData.deviceDangerID,
			'lineName': inputData.lineName,
			'lineId': inputData.lineId,
			'parentId': inputData.parentId,
			'levels':inputData.levels
		};
		$.ajax({
			url: '/v1/device/edit',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					alert('修改设备成功！');
					var tmp = {
						'index': 0,
						'order': 'deviceID',
					}
					$('#modalEdit').modal('hide');
					deviceInfoList(tmp);
					deviceInfoEdit(tmp);
				} else {
					alert('修改设备失败！');
				}
			}
		})
	}

	function deleteDevice(inputData) {
		var data = {
			ids: inputData,
		};
		$.ajax({
			url: '/v1/device/delete',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					var tmp = {
						'index': 0,
						'order': 'deviceID',
					}
					deviceInfoEdit(tmp);
					deviceInfoList(tmp);
				} else {
					alert('获取设备树失败');
				}
			}
		})
	}

	function SettingsDevice(inputData) {
		var data = inputData;
		$.ajax({
			url: '/v1/device/settings',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					alert('高级设置成功！');
					var tmp = {
						'index': 0,
						'order': 'deviceID',
					}
					$('#modalSetting').modal('hide');
					deviceInfoEdit(tmp);
					deviceInfoList(tmp);
				} else {
					alert('高级设置失败！');
				}
			}
		})
	}

	function showDanger() {
		var data = {
			'userId': cookie_userId
		};
		$.ajax({
			url: '/v1/device/danger/info',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					var list = data.result.list;
					$('#modalDanger-body table tbody').empty();
					for (var i = 0; i < list.length; i++) {
						$('#modalDanger-body table tbody').append('<tr id="' + list[i].dangerId + '"><td>' + list[i].dangerName + '</td><td><span class="glyphicon glyphicon-remove"></span></td></tr>');
					}
					$('#modalDanger-body table tbody').append('<tr><td><input></input></td><td></td></tr>');
				} else {
					alert('获取设备隐患失败!');
				}
			}
		})
	}

	function editDanger(inputData) {
		var data = {
			'list': inputData
		};
		$.ajax({
			url: '/v1/device/danger/edit',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					var list = data.result.list;
					showDanger();
					alert('修改隐患成功!');
				} else {
					alert('修改隐患失败!');
				}
			}
		})
	}

	function selectDanger() {
		var data = {
			'userId': cookie_userId
		};
		$.ajax({
				url: '/v1/device/danger/info',
				type: "POST",
				data: JSON.stringify(data),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				async: false,
				success: function(data) {
					if (data.code == 0) {
						var list = data.result.list;
						$('.selectDanger').empty();
						for (var i = 0; i < list.length; i++) {
							$('.selectDanger').append('<option value="' + list[i].dangerId + '">' + list[i].dangerName + '</option>');
						}
					} else {
						alert('获取设备隐患失败!');
					}
				}
			})
			// $('.selectDanger').append('<option value="1">线下施工</option>'
			//      +'<option value="2">建筑工地</option>'
			//      +'<option value="3">塔吊作业</option>'
			//      +'<option value="4">线下堆物</option>'
			//      +'<option value="5">树木生长</option>'
			//      +'<option value="6">野火防范</option>'
			//      +'<option value="7">杆塔本体</option>'
			//      +'<option value="8">鸟类活动</option>'
			//      +'<option value="9">其他类型</option>');
	}

	function showLine() {
		var data = {
			'userId': cookie_userId
		};
		$.ajax({
			url: '/v1/device/line/info',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					var list = data.result.list;
					$('#modalLine-body table tbody').empty();
					for (var i = 0; i < list.length; i++) {
						$('#modalLine-body table tbody').append('<tr id="' + list[i].lineId + '"><td>' + list[i].lineName + '</td><td><span class="glyphicon glyphicon-remove"></span></td></tr>');
					}
					$('#modalLine-body table tbody').append('<tr><td><input></input></td><td></td></tr>');
				} else {
					console.log('获取线路失败!');
				}
			}
		})
	}


	function selectLine() {
		var data = {
			'userId': cookie_userId
		};
		$.ajax({
			url: '/v1/device/line/info',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					var list = data.result.list;
					$('.selectLine').empty();
					for (var i = 0; i < list.length; i++) {
						$('.selectLine').append('<option value="' + list[i].lineId + '">' + list[i].lineName + '</option>');
					}
				} else {
					console.log('获取线路失败!');
				}
			}
		})
	}

	function deviceTree() {
		var data = {
			"userId": cookie_userId
		};
		var rootNode = [];
		$.ajax({
			url: '/v1/device/tree3',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					rootNode = data.result.data;
				} else {
					console.log('获取设备树失败');
				}
			}
		})
		return rootNode;
	}

	function levelTree() {
		// Some logic to retrieve, or generate tree structure
		var data = {
			"level": 0
		}
		var rootNode = [];
		$.ajax({
				url: '/v1/device/level/root',
				type: "POST",
				data: JSON.stringify(data),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				async: false,
				success: function(data) {
					if (data.code == 0) {
						rootNode = data.result.list;
						for (var i = 0; i < rootNode.length; ++i) {
							rootNode[i].text = rootNode[i].name;
						}
					} else {
						console.log("获取设备失败");
						console.log(data);
					}
				}
			}) // end of ajax


		var nodes = rootNode.slice();
		while (nodes.length) {
			var node = nodes.pop();
			var data = {
				"id": node.id,
				"level": node.level
			}
			$.ajax({
					url: '/v1/device/level/childs',
					type: "POST",
					data: JSON.stringify(data),
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					async: false,
					success: function(data) {
						if (data.code == 0) {
							if (data.result.size > 0) {
								node.nodes = data.result.list;
								for (var i = 0; i < node.nodes.length; ++i) {
									node.nodes[i].text = node.nodes[i].name;
									node.type = 1;
								}

								nodes = nodes.concat(node.nodes);
							} else {}
						} else {
							// alert("获取设备分组树失败");
							console.log(data);
						}
					}
				}) // end of ajax    
		}

		var trees = rootNode;

		return trees;
	}

	function createLevel(inputData) {
		var data = {
			"name": inputData.name,
			"parentId": inputData.parentId,
			"parentLevel": inputData.parentLevel,
		};

		$.ajax({
			url: '/v1/device/level/create',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data) {
				if (data.code == 0) {
					alert('创建成功');
					$('#addLevel0').prev().val('');
					$('#addLevel').prev().val('');
					$('#levelTree').treeview({
						data: levelTree(),
						levels: 3,
						collapseIcon: "glyphicon glyphicon-chevron-down",
						expandIcon: "glyphicon glyphicon-chevron-right"
					});
					$('#levelTree').unbind('nodeSelected');
					$('#levelTree').on('nodeSelected', function(event, data) {
						var name = data.text;
						$('#editLevel').prev().val(name);
						$('#deleteLevel').prev().val(name);
					});
				} else {
					alert('创建失败');
					console.log(data);
				}
			}
		})
	}

	function editLevel(inputData) {
		var data = {
			'id': inputData.id,
			'level': inputData.level,
			'name': inputData.name,
			'newName': inputData.newName
		};
		$.ajax({
			url: '/v1/device/level/edit',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data) {
				if (data.code == 0) {
					alert('编辑成功');
					$('#editLevel').prev().val('');
					$('#levelTree').treeview({
						data: levelTree(),
						levels: 3,
						collapseIcon: "glyphicon glyphicon-chevron-down",
						expandIcon: "glyphicon glyphicon-chevron-right"
					});
					$('#levelTree').unbind('nodeSelected');
					$('#levelTree').on('nodeSelected', function(event, data) {
						var name = data.text;
						$('#editLevel').prev().val(name);
						$('#deleteLevel').prev().val(name);
					});
				} else {
					alert('编辑失败');
					console.log('编辑分组失败');
				}
			}
		})
	}

	function deleteLevel(inputData) {
		var id = inputData.id;
		var list = [];
		list[0] = {
			'id': id,
		}
		var data = {
			'list': list,
		};
		$.ajax({
			url: '/v1/device/level/delete',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data) {
				if (data.code == 0) {
					alert('删除线路成功');
					$('#deleteLevel').prev().val('');
					$('#levelTree').treeview({
						data: levelTree(),
						levels: 3,
						collapseIcon: "glyphicon glyphicon-chevron-down",
						expandIcon: "glyphicon glyphicon-chevron-right"
					});
					$('#levelTree').unbind('nodeSelected');
					$('#levelTree').on('nodeSelected', function(event, data) {
						var name = data.text;
						$('#editLevel').prev().val(name);
						$('#deleteLevel').prev().val(name);
					});
				} else {
					alert('删除线路失败');
					console.log(data);
				}
			}
		});
	}

	function selectLevel(inputData) {
		var data = {
			'id': inputData.parentId,
			'level': inputData.level
		}

		$.ajax({
			url: '/v1/device/level/childs',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					var list = data.result.list;
					var lv = inputData.level;
					$('#selectLevel' + lv).empty();
					$('#selectLevel' + lv).append('<option value="0">全部</option>');
					$('#selectLevel' + lv).val("0");
					for (var i = 0; i < list.length; i++) {
						$('#selectLevel' + lv).append('<option value="' + list[i].id + '">' + list[i].name + '</option>');
					}
					if (list.length !== 0) {
						$("body").attr("data-level",lv);
						$('#selectLevel' + lv).parent().removeClass("hide");
					} else {
						$('#selectLevel' + lv).parent().addClass("hide");
					}

				} else {
					if (inputData.level == 0) {
						console.log('获取线路失败！');
					} else if (inputData.level == 1) {
						console.log('获取线路失败！');
					} 
				}
			}
		})
	}

	function _selectLevel(inputData) {
		var data = {
			'id': inputData.parentId,
			'level': inputData.level
		}

		$.ajax({
			url: '/v1/device/level/childs',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					var list = data.result.list;
					var lv = inputData.level;
					$('.selectLevel' + lv).empty();
					for (var i = 0; i < list.length; i++) {
						$('.selectLevel' + lv).append('<option value="' + list[i].id + '">' + list[i].name + '</option>');
					}
					if (list.length !== 0) {
						$('.selectLevel' + lv).parent().removeClass("hide");
						if (lv + 1 < 3) {
							var data = {
								'parentId': list[0].id,
								'level': lv+1
							}
							_selectLevel(data);
						}
					} else {
						$('.selectLevel' + lv).parent().addClass("hide");
					}


				} else {
					console.log('获取线路失败！');
				}
			}
		})
	}

	function selectLevels() {
		var data = {
			'parentId': 'root',
			'level': 0,
		}
		_selectLevel(data);
	}

	function lineTree() {
		// Some logic to retrieve, or generate tree structure
		var data = {
			"userId": cookie_userId,
		}
		var rootNode = [];
		$.ajax({
				url: '/v1/device/line/list',
				type: "POST",
				data: JSON.stringify(data),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				async: false,
				success: function(data) {
					if (data.code == 0) {
						rootNode = data.result.list;
						for (var i = 0; i < rootNode.length; i++) {
							// rootNode[i].selectable=false;
						}
					} else {
						console.log("获取线路失败");
						console.log(data);
					}
				}
			}) // end of ajax
		return rootNode;
	}

	function createLine(inputData) {
		var data = {
			"name": inputData.name,
			"parentId": inputData.parentId,
		};

		$.ajax({
			url: '/v1/device/line/create',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data) {
				if (data.code == 0) {
					alert('创建成功');
					selectLine();
					$('#addLine').prev().val('');
					$('#lineTree').treeview({
						data: lineTree(),
						levels: 2,
						collapseIcon: "glyphicon glyphicon-chevron-down",
						expandIcon: "glyphicon glyphicon-chevron-right"
					});
					$('#lineTree').unbind('nodeSelected');
					$('#lineTree').on('nodeSelected', function(event, data) {
						var name = data.text;
						$('#editLine').prev().val(name);
						$('#deleteLine').prev().val(name);
					});
				} else {
					alert('创建失败');
					console.log(data);
				}
			}
		})
	}

	function editLine(inputData) {
		var data = {
			'id': inputData.id,
			'name': inputData.name,
			'newName': inputData.newName
		};
		$.ajax({
			url: '/v1/device/line/edit',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data) {
				if (data.code == 0) {
					alert('编辑成功');
					selectLine();
					$('#editLine').prev().val('');
					$('#lineTree').treeview({
						data: lineTree(),
						levels: 2,
						collapseIcon: "glyphicon glyphicon-chevron-down",
						expandIcon: "glyphicon glyphicon-chevron-right"
					});
					$('#lineTree').unbind('nodeSelected');
					$('#lineTree').on('nodeSelected', function(event, data) {
						var name = data.text;
						$('#editLine').prev().val(name);
						$('#deleteLine').prev().val(name);
					});
				} else {
					alert('编辑失败');
				}
			}
		})
	}

	function deleteLine(inputData) {
		var id = inputData.id;
		var list = [];
		list[0] = {
			'id': id,
		}
		var data = {
			'list': list,
		};
		$.ajax({
			url: '/v1/device/line/delete',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data) {
				if (data.code == 0) {
					alert('删除线路成功');
					selectLine();
					$('#deleteLine').prev().val('');
					$('#lineTree').treeview({
						data: lineTree(),
						levels: 2,
						collapseIcon: "glyphicon glyphicon-chevron-down",
						expandIcon: "glyphicon glyphicon-chevron-right"
					});
					$('#lineTree').unbind('nodeSelected');
					$('#lineTree').on('nodeSelected', function(event, data) {
						var name = data.text;
						$('#editLine').prev().val(name);
						$('#deleteLine').prev().val(name);
					});
				} else {
					alert('删除线路失败');
					console.log(data);
				}
			}
		});
	}

	function checkUser(inputData) {
		var data = {
			'userName': inputData.userName,
			'password': inputData.password,
		};
		var flag = 0;
		$.ajax({
			url: '/v1/user/check',
			type: "GET",
			data: data,
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code != 0) {
					alert('用户名或密码有误!');
					$('#modalAdd-body input:eq(5)').val('');
					$('#modalAdd-body input:eq(6)').val('');
					$('#modalEdit-body input:eq(4)').val('');
					$('#modalEdit-body input:eq(5)').val('');
				} else {
					flag = 1;
				}
			}
		});
		return flag;
	}

	function getRefInfo(inputData) {
		var data = {
			deviceID: inputData.deviceID,
			channelNo: inputData.channelNo,
		}
		count = 0;
		points = [];
		$.ajax({
			url: '/v1/device/refpic/info',
			type: "GET",
			data: data,
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					var result = data.result;
					$('#channelSelect').val(inputData.channelNo);

					$('#senseSelect').val(result.sensitivity);
					$('#myCanvas').css('background-image', 'url(' + PIC_SERVER + result.path + ')');
					$('#myCanvas').attr('width', '' + CANVASWIDTH + '');
					$('#myCanvas').attr('height', '' + CANVASWIDTH * result.height / result.width + '');
					$('#container').css('height', 10 + CANVASWIDTH * result.height / result.width + 'px');

					$('body').attr('pic-width', result.width);
					$('body').attr('pic-height', result.height);
					$('body').attr('canvas-width', CANVASWIDTH);
					$('body').attr('canvas-height', CANVASWIDTH * result.height / result.width);
					console.log(result);
					if(result.X1 !== null && (result.endY1 - result.X1)){
						autoPaint(result.X1, result.Y1, result.endX1, result.endY1);
					}

					if(result.X2 !== null && (result.endY2 - result.X2)){
						autoPaint(result.X2, result.Y2, result.endX2, result.endY2);
					}

					if(result.X3 !== null && (result.endY3 - result.X3)){
						autoPaint(result.X3, result.Y3, result.endX3, result.endY3);
					}
					
					$('#modalRef').modal('show');
				} else {
					alert('无法获取对比图片信息！');
					$('#modalRef').modal('hide');
				}
			}
		});
	}


	function searchDevice(inputData) {
		var data = {
			'size': ENTRIES,
			'index': 0,
			'area': inputData.area,
			'name': inputData.name,
			'deviceTele': inputData.deviceTele,
			'lineId': inputData.lineId,
			'deviceDangerID': inputData.deviceDangerID,
			'status': inputData.status,
			'order': 'deviceID',
			'userId': cookie_userId,
			'userType': cookie_userType,
		}
		$.ajax({
			url: '/v1/device/info/search',
			type: "POST",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			async: false,
			success: function(data) {
				if (data.code == 0) {
					var list = data.result.list;
					dataTableInit(list);
					// console.log(list);
					// var total = data.result.total;
					// $('#table').attr('infolist-index', inputData.index);
					// var pages = Math.ceil(total / ENTRIES);
					// $('#infoCount').text('第' + (inputData.index + 1) + '页，共' + pages + '页');
					// if (inputData.index + 1 == 1) {
					// 	$('#infoLast').hide();
					// } else {
					// 	$('#infoLast').show();
					// }

					// if (inputData.index + 1 == pages) {
					// 	$('#infoNext').hide();
					// } else {
					// 	$('#infoNext').show();
					// }

					// $('#table tbody').empty();
					// for (var i = 0; i < list.length; i++) {
					// 	const dangerID = list[i].deviceDangerID;
					// 	switch (list[i].status) {
					// 		case 0:
					// 			var html = '<td style="color:red">离线</td>';
					// 			break;
					// 		case 1:
					// 			var html = '<td style="color:blue">在线</td>';
					// 			break;
					// 		default:
					// 			var html = '<td>离线</td>';
					// 			break;
					// 	}
					// 	$("#table tbody").append("<tr id='" + list[i].deviceId + "' class='infolist' devicedangerid='" + dangerID + "' lineid='" 
					// 		+ list[i].lineId + "'><td>" + (i + 1) + "</td><td>" + list[i].deviceName + "</td><td>" + list[i].deviceTele + "</td><td>" + list[i].version + "</td><td>" 
					// 		+ list[i].area + "</td><td>" + list[i].lineName + "</td><td>" + dangerType[dangerID] + "</td>" + html + "<td>" + list[i].heartBeatTime + "</td><td>"
					// 		+ toFix3(list[i].temperature) + "</td><td>" + toFix3(list[i].batteryVoltage) + "</td><td>" + toFix3(list[i].batterySolarVoltage) + "</td><td>" + toFix3(list[i].capacityVoltage) + "</td><td>" + toFix3(list[i].networkSignal) + "</td><td>"
					// 		+ list[i].countPicDay + "</td><td>" + list[i].countPicMonth + "</td><td>" + list[i].latitude + "</td><td>" + list[i].longitude + "</td><td>" + list[i].deviceId + "</td></tr>");
					// }
				} else {
					alert('失败!');
				}
			}
		});
	}

	function deviceInfoShow() {
		$('#search input').val('');
		$('#search select').val('0');
		var data = {
			'userId': cookie_userId,
			'userType': cookie_userType,
			'index': 0,
			'order': 'deviceID',
		}
		deviceInfoList(data);

		$("#selectLevel1").parent().addClass("hide");
		$("#selectLevel2").parent().addClass("hide");
		var data = {
			'parentId': 'root',
			'level': 0,
		}
		selectLevel(data);

		selectLine();
		$('#search .selectLine').prepend('<option value="0">全部</option>');
		$('#search .selectLine').val('0');
	}

	function deviceEditShow() {
		var data = {
			'index': 0,
			'order': 'deviceID',
		}
		deviceInfoEdit(data);
		selectLevel(data);
		selectLine();
	}

	function areaSetShow() {
		var tmpData = levelTree();

		$('#levelTree').treeview({
			data: tmpData,
			levels: 3,
			collapseIcon: "glyphicon glyphicon-chevron-down",
			expandIcon: "glyphicon glyphicon-chevron-right"
		});
		$('#main3 input').val('');

		$('#levelTree').unbind('nodeSelected');
		$('#levelTree').on('nodeSelected', function(event, data) {
			var name = data.text;
			$('#editLevel').prev().val(name);
			$('#deleteLevel').prev().val(name);
		});
	}

	function lineSetShow() {
		var tmpData = lineTree();
		$('#lineTree').treeview({
			data: tmpData,
			levels: 2,
			collapseIcon: "glyphicon glyphicon-chevron-down",
			expandIcon: "glyphicon glyphicon-chevron-right"
		});
		$('#main3 input').val('');

		$('#lineTree').unbind('nodeSelected');
		$('#lineTree').on('nodeSelected', function(event, data) {
			var name = data.text;
			$('#editLine').prev().val(name);
			$('#deleteLine').prev().val(name);
		});
	}

})



//`2Painter
// var container=$(".container");
// var canvas=document.querySelector("canvas");
// var screenWidth=document.documentElement.clientWidth;
// var screenHeight=document.documentElement.clientHeight;
// var width=screenWidth-295;
// var height=screenHeight-15;
// canvas.width=width;
// canvas.height=height;
// var obj=canvas.getContext("2d");
// var linewidth="1";
// var style="stroke";
// var color = 'red';
// var arr=[];
// var width=1070;
// var height=648;

// var x,y,w,h;
// var lx,ly,lw,lh;

// canvas.onmousedown=function(e){
//     x=e.offsetX;
//     y=e.offsetY;

//     var draw=new Draw(obj,{type:style,color:color,width:linewidth});//实例化构造函数
//     canvas.onmousemove=function(e){
//         w=e.offsetX;
//         h=e.offsetY;
//         obj.clearRect(0,0,width,height);
// if(arr.length!=0){
//     obj.putImageData(arr[arr.length-1],0,0,0,0,width,height);
// }
//         draw['rect'](x,y,w,h);
//     }
//     document.onmouseup=function(){
//         canvas.onmousemove=null;
//         document.onmouseup=null;
//         arr.push(obj.getImageData(0,0,width,height));
//     }
// }


// function Draw(obj,setting){
//     this.obj=obj;
//     this.type=setting.type||"stroke";
//     this.color=setting.color||"#000";
//     this.width=setting.width||"1";
// }
// Draw.prototype={
//     init:function(){
//         this.obj.strokeStyle=this.color;
//         this.obj.fillStyle=this.color;
//         this.obj.lineWidth=this.width;
//     },
//     rect:function(x,y,x1,y1){
//         this.init();
//         this.obj.beginPath();
//         this.obj.rect(x,y,x1-x,y1-y);
//         if(this.type=="stroke"){
//             this.obj.stroke();
//         }else if(this.type=="fill"){
//             this.obj.fill();
//         }
//     },
// }

function showPic(e, sUrl) {

		var x, y;

		x = e.clientX;

		y = e.clientY;

		document.getElementById("Layer1").style.left = x - 200 + 'px';

		document.getElementById("Layer1").style.top = y + 20 + 'px';

		document.getElementById("Layer1").innerHTML = "<img width='320' height='180' border='0' src=\"" + sUrl + "\">";

		document.getElementById("Layer1").style.display = "";

	}

	function hiddenPic() {

		document.getElementById("Layer1").innerHTML = "";

		document.getElementById("Layer1").style.display = "none";

	}

	

function autoPaint(x, y, endX, endY) {
	if (x && endY) {
		points.push({x: x, y: y, endX: endX, endY: endY});
		count ++;
		var ctx = document.getElementById("myCanvas").getContext("2d");
		var pwidth = parseInt($('body').attr('pic-width'));
		var pheight = parseInt($('body').attr('pic-height'));
		var cwidth = parseInt($('body').attr('canvas-width'));
		var cheight = parseInt($('body').attr('canvas-height'));
		var tmpx = x / pwidth * cwidth;
		var tmpy = y / pheight * cheight;
		var tmpendx = endX / pwidth * cwidth;
		var tmpendy = endY / pheight * cheight;
		// console.log(tmpx + '_' + tmpy + '_' + tmpendx + '_' + tmpendy);

		ctx.lineWidth = 1;
		ctx.strokeStyle = 'red';
		ctx.fillStyle = 'transparent';
		// alert(x+' '+y+' '+endX+' '+endY);

		ctx.strokeRect(tmpx, tmpy, (tmpendx - tmpx), (tmpendy - tmpy));
	}
}
	// `Painter
var count = 0;
var x, y, endX, endY;

var points = [];
var tmp = {
	x: 0,
	y: 0,
	endX: 0,
	endY: 0,
};

var rectTip = $("#myCanvas").next();

var flag = false;
var ctx = document.getElementById("myCanvas").getContext("2d");

$("#container").mousemove(fakeRectangleInput);

function fakeRectangleInput(e) {
	if (count < 3) {
		var offset = $("#myCanvas").offset();
		endX = e.pageX - offset.left;
		endY = e.pageY - offset.top;
		var borderWidth = 1;
		if (flag) {
			rectTip.css({
				left: x,
				top: y
			});
			rectTip.width(endX - x - borderWidth * 2);
			rectTip.height(endY - y - borderWidth * 2);
			console.log(flag);
		}
	}
}

$("#container").mousedown(function(e) {
	if (count < 3) {
		flag = true;
		var offset = $("#myCanvas").offset();
		x = e.pageX - offset.left;
		y = e.pageY - offset.top;
		console.log("begin:" + x + " " + y);

		// rectTip.css({
		//     "border": sr,
		//     "background-color":backgroundColor
		// });
		rectTip.css({
			left: x,
			top: y
		});
		rectTip.width(0);
		rectTip.height(0);
		rectTip.show();
	}
})

$("#container").mouseup(function(e) {
	if (count < 3) {
		flag = false;
		drawRectangle();
	} else {
		alert('最多划定3个对比区域！')
	};
})

function drawRectangle() {
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'red';
	ctx.fillStyle = 'transparent';
	// alert(x+' '+y+' '+endX+' '+endY);

	ctx.strokeRect(x, y, (endX - x), (endY - y));
	// ctx.strokeRect(40,40,80,80);

	var pwidth = parseInt($('body').attr('pic-width'));
	var pheight = parseInt($('body').attr('pic-height'));
	var cwidth = parseInt($('body').attr('canvas-width'));
	var cheight = parseInt($('body').attr('canvas-height'));
	tmp.x = x / cwidth * pwidth;
	tmp.y = y / cheight * pheight;
	tmp.endX = endX / cwidth * pwidth;
	tmp.endY = endY / cheight * pheight;
	if((tmp.endY - tmp.y) && (tmp.endX - tmp.x)){
		points.push(tmp);
		count++;
	}
	console.log(tmp);
	console.log(points);
	
	tmp = {};
	$("#myCanvas").focus();
	rectTip.hide();
}

function clearArea() {
	// Use the identity matrix while clearing the canvas
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	points = [];
	count = 0;
}