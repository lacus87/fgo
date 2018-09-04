// pages/index/bar.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    barList: [],
    model: wx.getStorageSync("model")
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var barList = this.data.barList;
    barList.push({
      'id': 1,
      'icon': '../../images/icon/01.png',
      'text': '英灵列表',
      'url': 'servant/servant'
    });
    barList.push({
      'id': 2,
      'icon': '../../images/icon/02.png',
      'text': '素材信息',
      'url': 'material/material'
    });
    barList.push({
      'id': 3,
      'icon': '../../images/icon/03.png',
      'text': '活动详情',
      'url': 'event/event'
    });
    barList.push({
      'id': 4,
      'icon': '../../images/icon/04.png',
      'text': '个人规划',
      'url': 'setting/programe'
    });
    barList.push({
      'id': 11,
      'icon': '../../images/icon/11.png',
      'text': '礼装列表',
      'url': 'card/card'
    });
    barList.push({
      'id': 10,
      'icon': '../../images/icon/10.png',
      'text': '卡池列表',
      'url': 'event/event_pickup'
    });
    barList.push({
      'id': 7,
      'icon': '../../images/icon/07.png',
      'text': '宝具伤害',
      'url': 'setting/setting_damage_calculate'
    });
    barList.push({
      'id': 12,
      'icon': '../../images/icon/12.png',
      'text': '狗粮需求',
      'url': 'index/exp_calculate'
    });
    barList.push({
      'id': 5,
      'icon': '../../images/icon/05.png',
      'text': '肝度一览',
      'url': 'setting/setting_mat_used'
    });
    barList.push({
      'id': 6,
      'icon': '../../images/icon/06.png',
      'text': '收集进度',
      'url': 'setting/setting_account'
    });
    barList.push({
      'id': 8,
      'icon': '../../images/icon/08.png',
      'text': '掉落速查',
      'url': 'setting/setting_tools'
    });
    
    barList.push({
      'id': 9,
      'icon': '../../images/icon/09.png',
      'text': '数据备份',
      'url': 'material/material_upload'
    });
    
    var localMenuData = wx.getStorageSync('localMenuData');
    localMenuData.forEach(function(menu){
      barList.forEach(function(bar){
        if(bar.id == menu.id){
          bar.flag = 1;
        }
      })
    })
    this.setData({
      barList: barList,
      model: wx.getStorageSync("model")
    })
  },
  switchChange: function(e){
    var envId = e.currentTarget.dataset.index;
    var barList = this.data.barList;
    barList.forEach(function (bar) {
      if (bar.id == envId) {
        bar.flag = bar.flag == 1? 0:1;
      }
    })
  },

  confrim: function(){
    var barList = this.data.barList;
    var localMenuData = [];
    barList.forEach(function (bar) {
      if (bar.flag == 1) {
        localMenuData.push(bar);
      }
    })
    localMenuData.push({
      'icon': '../../images/icon/99.png',
      'text': '更多',
      'url': 'index/bar'
    });
    wx.setStorageSync('localMenuData', localMenuData);
    wx.navigateBack();
  }
})