const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
* 从一个数组中随机取出一个元素
* @param {Array} arr 原数组
**/
const getRandomArrayElement = arr => {
  return arr[Math.floor(Math.random() * arr.length)];
}

function show(currentStatu, page){
  /* 动画部分 */
  // 第1步：创建动画实例 
  var animation = wx.createAnimation({
    duration: 300, //动画时长 
    timingFunction: "linear", //线性 
    delay: 0 //0则不延迟 
  });
  // 第2步：这个动画实例赋给当前的动画实例 
  page.animation = animation;
  // 第3步：执行第一组动画 
  animation.opacity(0).rotateX(-100).step();
  // 第4步：导出动画对象赋给数据对象储存 
  page.setData({
    animationData: animation.export()
  })
  // 第5步：设置定时器到指定时候后，执行第二组动画 
  setTimeout(function () {
    // 执行第二组动画 
    animation.opacity(1).rotateX(0).step();
    // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
    page.setData({
      animationData: animation
    })
    //关闭 
    if (currentStatu == "close") {
      page.setData(
        {
          showModalStatus: false
        }
      );
    }
  }.bind(this), 100)
  // 显示 
  if (currentStatu == "open") {
    page.setData(
      {
        showModalStatus: true
      }
    );
  }
}

const convertCount = money => {
  //汉字的数字
  var cnNums = new Array('零', '一', '二', '三', '四', '五', '六', '七', '八', '九');
  //基本单位
  var cnIntRadice = new Array('', '十', '百', '千');
  //对应整数部分扩展单位
  var cnIntUnits = new Array('', '万', '亿', '兆');
  //对应小数部分单位
  var cnDecUnits = new Array('角', '分', '毫', '厘');
  //整数金额时后面跟的字符
  var cnInteger = '';
  //整型完以后的单位
  var cnIntLast = '';
  //最大处理的数字
  var maxNum = 999999999999999.9999;
  //金额整数部分
  var integerNum;
  //金额小数部分
  var decimalNum;
  //输出的中文金额字符串
  var chineseStr = '';
  //分离金额后用的数组，预定义
  var parts;
  if (money == '') { return ''; }
  money = parseFloat(money);
  if (money >= maxNum) {
    //超出最大处理数字
    return '';
  }
  if (money == 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger;
    return chineseStr;
  }
  //转换为字符串
  money = money.toString();
  if (money.indexOf('.') == -1) {
    integerNum = money;
    decimalNum = '';
  } else {
    parts = money.split('.');
    integerNum = parts[0];
    decimalNum = parts[1].substr(0, 4);
  }
  //获取整型部分转换
  if (parseInt(integerNum, 10) > 0) {
    var zeroCount = 0;
    var IntLen = integerNum.length;
    for (var i = 0; i < IntLen; i++) {
      var n = integerNum.substr(i, 1);
      var p = IntLen - i - 1;
      var q = p / 4;
      var m = p % 4;
      if (n == '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0];
        }
        //归零
        zeroCount = 0;
        chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
      }
      if (m == 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q];
      }
    }
    chineseStr += cnIntLast;
  }
  //小数部分
  if (decimalNum != '') {
    var decLen = decimalNum.length;
    for (var i = 0; i < decLen; i++) {
      var n = decimalNum.substr(i, 1);
      if (n != '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (chineseStr == '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum == '') {
    chineseStr += cnInteger;
  }
  return chineseStr;
}


const syncAccount = url => {
  if (wx.getStorageSync('autoSync') != 1){
    return;
  }
  var curAccId = "1";
  var account = wx.getStorageSync('account');
  if (account == undefined || account == '') {
    return;
  }
  for (var i = 0; i < account.length; i++) {
    if (account[i].status == 1) {
      curAccId = account[i].id;
    }
  }
  var pyCode = wx.getStorageSync('pyCode' + "_" + curAccId);
  if (pyCode == undefined || pyCode == '' || pyCode.length !=2) {
    return;
  }
  var uid = wx.getStorageSync('uid' + "_" + curAccId);
  if (uid == undefined || uid == '') {
    return;
  }
  wx.request({
    url: url + '/account/syncAccount.do?srvId=' + pyCode[0] + "&mcType=" + pyCode[1]+ "&unionId=" + uid,
    success: function (res) {
      if (res.data.code == 10000) {
        var accountInfo = res.data.data;
        wx.setStorageSync('material' + "_" + curAccId, accountInfo.material);
        var servantList = wx.getStorageSync('srv_list' + "_" + curAccId);
        if (servantList == undefined || servantList == '') {
          servantList = [];
        }
        var servantSkill = wx.getStorageSync('srvSkill' + "_" + curAccId);
        if (servantSkill == undefined || servantSkill == '') {
          servantSkill = {};
        }
        var tarServantSkill = accountInfo.srvSkill;

        var tarServantList = accountInfo.srv_list;
        for (var i = 0; i < tarServantList.length; i++) {
          var id = tarServantList[i];
          servantSkill[id] = tarServantSkill[id];
          var flag = 0;
          for (var j = 0; j < servantList.length; j++) {
            if (id == servantList[j]) {
              flag = 1;
              break;
            }
          }
          if (flag == 0) {
            servantList.push(id);
          }
        }
        wx.setStorageSync('srv_list' + "_" + curAccId, servantList);
        wx.setStorageSync('srvSkill' + "_" + curAccId, servantSkill);
      }
    }
  })
}

module.exports = {
  formatTime: formatTime,
  convertCount: convertCount,
  syncAccount: syncAccount,
  show: show
}

