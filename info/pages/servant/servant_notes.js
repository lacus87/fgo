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
    id:0,
    name:'',
    openId:"",
    pageWidth: 300,
    model: app.globalData.model,
    pageHeight: 400,
    servantNotes:{},
    categories: ['周回表现', '高难表现', '活动表现', '特殊性', '培养性'],
    categorieKeys: ['normal', 'hard', 'event', 'special', 'train'],
    hisNotes: false
  },

  onLoad: function (options) {
    var that = this;
    this.setData({
      id: options.id,
      name: options.name
    })
    wx.setNavigationBarTitle({
      title: options.name //页面标题为路由参数
    });
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageWidth: res.windowWidth,
          pageHeight: res.windowHeight,
          model: app.globalData.model,
          openId: app.globalData.openId
        });
      }
    });
  },
  onShow: function(){
    var servantId = this.data.id;
    var openId = app.globalData.openId;
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: app.globalData.url + '/account/qryNotes.do?servantId=' + servantId + '&openId=' + openId,
      method: 'GET',
      fail: function () {
        wx.hideLoading();
      },
      success: function (res) {
        wx.hideLoading();
        var hisNotes = 1;
        if(res.data.data.preNotes.normal< 1){
          hisNotes = 0;
        }
        that.setData({
          servantNotes: res.data.data,
          hisNotes: hisNotes
        },function(){
          that.drawServant();
        })
      }
    });

  },
  drawServant: function () {
    var width = this.data.pageWidth;
    var servantNotes = this.data.servantNotes;
    var model = this.data.model;
    var categories = [];
    for (var i = 0; i < this.data.categories.length; i++){
      categories.push(this.data.categories[i]+ " " + servantNotes[this.data.categorieKeys[i]].toFixed(1));
    }
    new wxCharts({
      animation: true,
      canvasId: 'servantInfo',
      type: 'radar',
      categories: categories,
      series: [{
        name: this.data.name+'的综合评分,共(' + servantNotes.count+")位用户参与",
        data: [servantNotes.normal, servantNotes.hard, servantNotes.event, servantNotes.special, servantNotes.train]
      }],
      width: width,
      height: width-20,
      extra: {
        radar: {
          max: 10,
          labelColor: app.globalData.model == 1 ? '#FFFFFF' : '#000000'
        }
      }
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

  onShareAppMessage(res){
    return {
      imageUrl: this.data.imgPath
    }
  },

  showNotesInfo: function(e){
    wx.showModal({
      title: '评分说明',
      content: '评分数据由大家共同完成，请理性评分，评分按日服最新进度为标准。\r\n周回表现：英灵在Free本，狗粮本的表现;\r\n高难表现：英灵在各高难本的表现;\r\n活动表现：英灵在活动中的加成、出场率;\r\n特殊性：英灵的技能独特性;\r\n培养性：英灵对技能要求是否高，素材是否亲民(越难分越低);',
      showCancel:false,
      success: function (res) {
      }
    })
  },

  setNotes: function(e){
    var index = parseInt(e.currentTarget.dataset.index);
    var typeId = e.currentTarget.dataset.typeid;
    var typeKey = this.data.categorieKeys[typeId];
    var servantNotes = this.data.servantNotes;
    servantNotes.preNotes[typeKey] = index;
    this.setData({
      servantNotes: servantNotes
    })
  },

  submitNotes: function(e){
    var servantNotes = this.data.servantNotes.preNotes;
    var noteInfo = {};
    noteInfo.servantId = this.data.id;
    noteInfo.openId = app.globalData.openId;
    var keys = this.data.categorieKeys;
    for(var i = 0; i< keys.length; i++){
      var key = keys[i];
      if (servantNotes[key] < 1){
        wx.showToast({
          title: '请完成评分项',
          icon: 'success',
          image: '/images/warning.png',
          duration: 500
        });
        return;
      }
      noteInfo[key] = servantNotes[key];
    }
    var url = "/account/submitNotes.do";
    if(this.data.hisNotes){
      url = "/account/updateNotes.do";
    }
    wx.showLoading({
      title: '评分提交中...',
    })
    var that = this;
    wx.request({
      url: app.globalData.url + url,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      data: noteInfo,
      success: function (res) {
        wx.hideLoading();
        that.onShow();
      }
    });
  }
});