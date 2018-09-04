//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    indexmenu: [],
    imgUrls: [],
    model: 0,
    pageHeight:200,
    pageWidth: 400
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowWidth * 374 / 640,
          pageWidth: res.windowWidth
        });
      }
    });
    wx.showLoading({
      title: '初始化...',
      mask:true
    })
    var localServantCacheData = wx.getStorageSync('localServantCacheData');
    if (localServantCacheData == undefined || localServantCacheData == '') {
      localServantCacheData = [];
    }
    wx.request({
      url: app.globalData.url + '/servant/getServantList.do?count=' + localServantCacheData.length + '&version=' + wx.getStorageSync('localServantCacheDataVersion'),
      method: 'GET',
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '服务器无响应',
          image: '/images/warning.png',
          icon: 'success',
          duration: 5000
        });
      },
      success: function (res) {
        wx.hideLoading();
        if(res.data.data){
          app.globalData.servantList = res.data.data;
          wx.setStorage({
            key: "localServantCacheData",
            data: res.data.data
          })
          wx.setStorage({
            key: "localServantCacheDataVersion",
            data: res.data.data[0].version
          })
        }else{
          app.globalData.servantList = localServantCacheData;
        }
      }
    });
    wx.request({
      url: app.globalData.url + '/account/getTopImgList.do',
      method: 'GET',
      success: function (res) {
        var imgList = res.data.data;
        var imgUrls = [];
        imgList.forEach(function (url) {
          imgUrls.push(app.globalData.url + url);
        })
        that.setData({
          imgUrls: imgUrls
        })
      }
    });
    
  },
  fetchData: function () {
    var localMenuData = wx.getStorageSync('localMenuData');
    if (localMenuData == undefined || localMenuData == '') {
      localMenuData = [];
      localMenuData.push({
        'id':1,
        'icon': '../../images/icon/01.png',
        'text': '英灵列表',
        'url': 'servant/servant'
      });
      localMenuData.push({
        'id': 2,
        'icon': '../../images/icon/02.png',
        'text': '素材信息',
        'url': 'material/material'
      });
      localMenuData.push({
        'id': 3,
        'icon': '../../images/icon/03.png',
        'text': '活动详情',
        'url': 'event/event'
      });
      localMenuData.push({
        'id': 4,
        'icon': '../../images/icon/04.png',
        'text': '个人规划',
        'url': 'setting/programe'
      });
      localMenuData.push({
        'icon': '../../images/icon/99.png',
        'text': '更多',
        'url': 'index/bar'
      });
      wx.setStorageSync('localMenuData', localMenuData);
    }
    this.setData({
      indexmenu: localMenuData,
      model: wx.getStorageSync("model")
    })
    if (this.data.model == 0) {
      wx.setTabBarStyle({
        "color": "#8a8a8a",
        "selectedColor": "#2aa515",
        "borderStyle": "white",
        "backgroundColor": "#E0E0E0"
      });
    } else if (this.data.model == 1) {
      wx.setTabBarStyle({
        "color": "#FFFFFF",
        "selectedColor": "#90EE90",
        "borderStyle": "black",
        "backgroundColor": "#000000"
      });
    }
  },
  onReady: function () {
    //生命周期函数--监听页面初次渲染完成
    // console.log('onReady');
  },
  onShow: function () {
    this.fetchData();
  },
  onHide: function () {
    //生命周期函数--监听页面隐藏
    // console.log('onHide');
  },
  onUnload: function () {
    //生命周期函数--监听页面卸载
    // console.log('onUnload');
  },
  onPullDownRefresh: function () {
    //页面相关事件处理函数--监听用户下拉动作
    // console.log('onPullDownRefresh');
  },
  onReachBottom: function () {
    //页面上拉触底事件的处理函数
    // console.log('onReachBottom');
  }
})
