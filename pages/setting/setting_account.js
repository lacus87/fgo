var wxCharts = require('../style/wxcharts-min.js');
var time = 0;
var touchDot = 0;//触摸时的原点
var touchDotH = 0;//触摸时的原点y轴
var interval = "";
var flag_hd = true;
var curAccId = 1;
var app = getApp();
Page({
  data: {
    flag: 1,
    tabs: ["英灵分布图", "已消耗素材"],
    showTopTips: false,
    checkboxItems: [
      { name: '五星', value: '5', count: [1, 1, 1, 1, 1], checked: true },
      { name: '四星', value: '4', count: [1, 1, 1, 1] },
      { name: '三星', value: '3', count: [1, 1, 1] },
      { name: '二星', value: '2', count: [1, 1] },
      { name: '一星', value: '1', count: [1] }
    ],
    pageWidth: 300,
    model: 0,
    materialData: {},
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    pageHeight: 400,
    url: '',
    modelArray: [],
    showModalStatus: false,
    reqCount: 0,
  },

  onLoad: function (options) {
    var rarity = options.id;
    var checkboxItems = this.data.checkboxItems;
    for (var i = 0; i < checkboxItems.length; i++) {
      checkboxItems[i].checked = false;
      if (checkboxItems[i].value == rarity) {
        checkboxItems[i].checked = true;
      }
    }
    this.setData({
      checkboxItems: checkboxItems,
      url: app.globalData.url + "/fgo"
    });
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageWidth: res.windowWidth,
          pageHeight: res.windowHeight,
          model: wx.getStorageSync("model")
        });
      }
    });
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    this.drawServant();
    this.calculate();
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  drawServant: function () {
    var width = this.data.pageWidth;
    var servantData = [
      { name: 'SABER', data: 0, color: '#1195db' },
      { name: 'ARCHER', data: 0, color: '#f6ef37' },
      { name: 'LANCER', data: 0, color: '#0e932e' },
      { name: 'RIDER', data: 0, color: '#a686ba' },
      { name: 'CASTER', data: 0, color: '#7dc5eb' },
      { name: 'ASSASSIN', data: 0, color: '#515151' },
      { name: 'BERSERKER', data: 0, color: '#d81e06' },
      { name: 'RULER', data: 0, color: '#efb336' },
      { name: 'AVENGER', data: 0, color: '#88147f' },
      { name: 'SHIELDER', data: 0, color: '#e89abe' },
      { name: 'ALTEREGO', data: 0, color: '#17abe3' },
      { name: 'MOONCANCER', data: 0, color: '#a4579d' }
    ];
    var checkboxItems = this.data.checkboxItems;
    var rarityList = [];
    for (var i = 0; i < checkboxItems.length; i++) {
      if (checkboxItems[i].checked) {
        rarityList.push(checkboxItems[i].value);
      }
    }
    var rarity = wx.getStorageSync('servantRarity');
    if (rarity == undefined || rarity == '') {
      rarity = new Object();
    }
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    if (item == undefined || item == '') {
      item = [];
    }
    for (var i = 0; i < item.length; i++) {
      var id = item[i] + '';
      var curRarity = rarity[id];
      if (rarityList.indexOf(curRarity.rarity) >= 0) {
        for (var j = 0; j < servantData.length; j++) {
          if (servantData[j].name == curRarity.clazz) {
            servantData[j].data = servantData[j].data + 1;
            break;
          }
        }
      }
    }
    for (var i = servantData.length - 1; i >= 0; i--) {
      if (servantData[i].data == 0) {
        servantData.splice(i, 1);
      }
    }
    for (var i = servantData.length - 1; i >= 0; i--) {
      servantData[i].name = servantData[i].name + ":" + servantData[i].data;
    }
    if (servantData.length == 0) {
      return;
    }
    new wxCharts({
      canvasId: 'accountInfo',
      type: 'pie',
      series: servantData,
      width: width,
      height: 300,
      dataLabel: false
    });
  },


  checkboxChange: function (e) {
    var checkboxItems = this.data.checkboxItems, values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;

      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }
    this.setData({
      checkboxItems: checkboxItems
    });
    this.drawServant();
  },
  onShow: function () {

  },
  // 触摸开始事件 
  touchStart: function (e) {
    touchDot = e.touches[0].pageX; // 获取触摸时的原点 
    // 使用js计时器记录时间  
    interval = setInterval(function () {
      time++;
    }, 100);
  },
  // 触摸结束事件 
  touchEnd: function (e) {
    var touchMove = e.changedTouches[0].pageX;
    // 向右滑动 
    if (touchMove - touchDot >= 40 && time < 10 && touchDot < 80) {
      wx.navigateBack();
    }
    clearInterval(interval); // 清除setInterval 
    time = 0;
  },
  calculate: function () {
    var that = this;
    var servantList = wx.getStorageSync('srv_list' + "_" + curAccId);
    var skillList = wx.getStorageSync('srvSkill' + "_" + curAccId);
    var infoArray = [];
    for (var i = 0; i < servantList.length; i++) {
      var servant = new Object;
      servant.servantId = servantList[i];
      var id = servantList[i] + "";
      if (skillList[id] == undefined) {
        skillList[id] = [0, 1, 1, 1];
      }
      servant.rank = "0_" + skillList[id][0];
      servant.skill1 = "1_" + skillList[id][1];
      servant.skill2 = "1_" + skillList[id][2];
      servant.skill3 = "1_" + skillList[id][3];
      servant.clothFlag = 'N';
      infoArray.push(servant);
    }
    infoArray.sort(function (a, b) {
      return a.servantId < b.servantId ? -1 : 1;
    })
    var routInfo = { "param": infoArray, "ownCount": wx.getStorageSync('material' + "_" + curAccId) };
    wx.showToast({
      title: '计算中...',
      icon: 'loading',
      duration: 3000,
      mask: true
    })
    wx.request({
      url: app.globalData.url + "/fgo/material/calculateServantMaterial.do",
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      data: routInfo,
      complete: function (res) {
        wx.hideToast();
      },
      success: function (res) {
        var materialData = res.data.data;
        var array1 = [];
        var array2 = [];
        var array3 = [];
        for (var i = 0; i < materialData.material.length; i++) {
          var id = materialData.material[i].type;
          if (id == '1') {
            array1.push(materialData.material[i]);
          } else if (id == '2') {
            array2.push(materialData.material[i]);
          } else if (id == '3') {
            array3.push(materialData.material[i]);
          }
        }
        materialData.material1 = array1;
        materialData.material2 = array2;
        materialData.material3 = array3;
        that.setData({
          materialData: res.data.data
        })
      }
    })
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    var id = e.currentTarget.dataset.index + '';
    var reqCount = e.currentTarget.dataset.count;
    var array = this.data.materialData.servantReqList[id];
    this.setData({
      reqCount: reqCount,
      modelArray: array
    })
    this.util(currentStatu)
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 100, //动画时长 
      timingFunction: "linear", //线性 
      delay: 0 //0则不延迟 
    });

    // 第2步：这个动画实例赋给当前的动画实例 
    this.animation = animation;

    // 第3步：执行第一组动画 
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存 
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })

      //关闭 
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 100)

    // 显示 
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
  }
});