// pages/servant/servant_detail.js
var sliderWidth = 0; // 需要设置slider的宽度，用于计算中间位置
var time = 0;
var touchDot = 0;//触摸时的原点
var interval = "";
var flag_hd = true;
var curAccId = 1;
var app = getApp();
var videoContext = {};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '1001',
    servant: '',
    servant_info: [],
    color: '#CCC',
    height: 400,
    width: 300,
    topFlag: 0,
    skill: 1,
    model: 0,
    movieUrl: '',
    playFlag: '',
    imgUrl: '',
    modelArray: [],
    showModalStatus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    videoContext = wx.createVideoContext('myVideo');
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    if (item == undefined || item == '') {
      item = [];
      wx.setStorageSync('srv_list' + "_" + curAccId, item);
    }
    var id = options.id + "";
    var allSkillInfo = wx.getStorageSync('srvSkill' + "_" + curAccId);
    if (allSkillInfo == undefined || allSkillInfo == '') {
      allSkillInfo = new Object();
    }
    var servant_info = allSkillInfo[id];
    //var servant_info = wx.getStorageSync('srv_' + options.id + "_" + curAccId);
    if (servant_info == undefined || servant_info == '') {
      servant_info = [0, 1, 1, 1, 0];//默认灵基/技能等级/灵衣
      //wx.setStorageSync('srv_' + options.id + "_" + curAccId, servant_info);
    }
    var color = '#CCC';
    for (var j = 0; j < item.length; j++) {
      if (options.id == item[j]) {
        color = '#2aa515';
        break;
      }
    }

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight - 200,
          width: res.windowWidth,
          model: wx.getStorageSync("model"),
          imgUrl: app.globalData.url + "/fgo"
        });
      }
    });
    // var url = app.globalData.url+'/fgo/images/servant/movie/' + options.id + ".mp4";
    // that.setData({
    //   movieUrl: url
    // });
    wx.getNetworkType({
      success: function (res) {
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        var networkType = res.networkType;
        if (networkType != 'wifi') {
          that.setData({
            playFlag: '未连接WIFI，继续播放会消耗约2M流量！'
          })
        }
      }
    })
    wx.onNetworkStatusChange(function (res) {
      var networkType = res.networkType;
      if (networkType != 'wifi') {
        that.setData({
          playFlag: '未连接WIFI，继续播放会消耗约2M流量！'
        })
      } else {
        that.setData({
          playFlag: ''
        })
      }
    })
    wx.request({
      url: app.globalData.url + '/fgo/servant/getServantInfo.do?servantId=' + options.id,
      method: 'GET',
      success: function (res) {
        var servant = res.data.data;
        for (var i = 0; i < servant.skill.length; i++) {
          servant.skill[i].skillLevel = servant_info[i + 1];
          servant.skill[i].tarLevel = servant_info[i + 1];
          servant.skill[i].skillLevelUp = servant_info[i + 1];
          servant.skill[i].skillIndex = i;
        }
        that.setData({
          id: options.id,
          servant_info: servant_info,
          color: color,
          servant: servant,
          modelArray: servant.matReq
        });
        wx.setNavigationBarTitle({
          title: that.data.servant.name//页面标题为路由参数
        });
        app.globalData.lastTapTime = 0;

      }
    });
  },

  bindNumDelete: function () {
    var nums = this.data.servant_info;
    var num = nums[0];
    if (num > 0) {
      num = num - 1;
    }
    nums[0] = num;
    this.setData({
      servant_info: nums
    });
  },

  bindNumAdd: function () {
    var nums = this.data.servant_info;
    var num = nums[0];
    if (num < 4) {
      num = num + 1;
    }
    nums[0] = num;
    this.setData({
      servant_info: nums
    });
  },
  setCare: function () {
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    var id = this.data.id;
    var flag = 0;
    for (var j = 0; j < item.length; j++) {
      if (id == item[j]) {
        flag = 1;
        item.splice(j, 1);
        break;
      }
    }
    if (flag == 0) {
      item.push(id);
      this.setData({
        color: '#2aa515',
      });
      wx.setStorageSync('srv_list' + "_" + curAccId, item);
      wx.showToast({
        title: '已设置为关注',
        icon: 'success',
        duration: 1000
      })
    } else {
      this.setData({
        color: '#CCC',
      });
      wx.setStorageSync('srv_list' + "_" + curAccId, item);
      wx.showToast({
        title: '已取消关注',
        icon: 'success',
        duration: 1000
      })
    }

  },
  changeSkillLevel0: function (e) {
    var curValue = e.detail.value;
    var servant_info = this.data.servant_info;
    servant_info[1] = curValue;
    var servant = this.data.servant;
    var oldValue = servant.skill[0].skillLevel;
    servant.skill[0].tarLevel = curValue;
    if (oldValue >= curValue) {
      servant.skill[0].skillLevelUp = curValue;
    } else {
      servant.skill[0].skillLevelUp = oldValue + "→" + curValue;
    }
    this.setData({
      servant: servant
    });
  },
  changeSkillLevel1: function (e) {
    var curValue = e.detail.value;
    var servant_info = this.data.servant_info;
    servant_info[2] = curValue;
    var servant = this.data.servant;
    var oldValue = servant.skill[1].skillLevel;
    servant.skill[1].tarLevel = curValue;
    if (oldValue >= curValue) {
      servant.skill[1].skillLevelUp = curValue;
    } else {
      servant.skill[1].skillLevelUp = oldValue + "→" + curValue;
    }
    this.setData({
      servant: servant
    });
  },
  changeSkillLevel2: function (e) {
    var curValue = e.detail.value;
    var servant_info = this.data.servant_info;
    servant_info[3] = curValue;
    var servant = this.data.servant;
    var oldValue = servant.skill[2].skillLevel;
    servant.skill[2].tarLevel = curValue;
    if (oldValue >= curValue) {
      servant.skill[2].skillLevelUp = curValue;
    } else {
      servant.skill[2].skillLevelUp = oldValue + "→" + curValue;
    }
    this.setData({
      servant: servant
    });
  },
  setStatus: function () {
    var servant = this.data.servant;
    var servant_info = this.data.servant_info;
    for (var i = 0; i < servant.skill.length; i++) {
      servant.skill[i].skillLevel = servant_info[i + 1];
      servant.skill[i].skillLevelUp = servant_info[i + 1];
    }
    var id = this.data.id + '';
    this.setData({
      servant: servant
    });
    //wx.setStorageSync('srv_' + id + "_" + curAccId, servant_info);
    var allSkillInfo = wx.getStorageSync('srvSkill' + "_" + curAccId);
    if (allSkillInfo == undefined || allSkillInfo == '') {
      allSkillInfo = new Object();
    }
    allSkillInfo[id] = servant_info;
    wx.setStorageSync('srvSkill' + "_" + curAccId, allSkillInfo);
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    var id = this.data.id;
    var flag = 0;
    for (var j = 0; j < item.length; j++) {
      if (id == item[j]) {
        flag = 1;
        break;
      }
    }
    if (flag == 0) {
      item.push(id);
      this.setData({
        color: '#2aa515',
      });
      wx.setStorageSync('srv_list' + "_" + curAccId, item);
    }
    wx.showToast({
      title: '技能设置成功',
      icon: 'success',
      duration: 1000
    })
  },
  setDefault: function () {
    var id = this.data.id;
    //var servant_info = wx.getStorageSync('srv_' + id + "_" + curAccId);
    id = id + "";
    var allSkillInfo = wx.getStorageSync('srvSkill' + "_" + curAccId);
    if (allSkillInfo == undefined || allSkillInfo == '') {
      allSkillInfo = new Object();
    }
    var servant_info = allSkillInfo[id];
    if (servant_info == undefined || servant_info == '') {
      servant_info = [0, 1, 1, 1, 0];//默认灵基/技能等级
    }
    var servant = this.data.servant;
    for (var i = 0; i < servant.skill.length; i++) {
      servant.skill[i].skillLevel = servant_info[i + 1];
      servant.skill[i].tarLevel = servant_info[i + 1];
      servant.skill[i].skillLevelUp = servant_info[i + 1];
      servant.skill[i].skillIndex = i;
    }
    this.setData({
      servant: servant,
      servant_info: servant_info,
      topFlag: 0
    });
  },
  setTop: function () {
    var id = this.data.id;
    // var servant_info = wx.getStorageSync('srv_' + id + "_" + curAccId);
    id = id + "";
    var allSkillInfo = wx.getStorageSync('srvSkill' + "_" + curAccId);
    if (allSkillInfo == undefined || allSkillInfo == '') {
      allSkillInfo = new Object();
    }
    var servant_info = allSkillInfo[id];
    if (servant_info == undefined || servant_info == '') {
      servant_info = [0, 1, 1, 1, 0];//默认灵基/技能等级
    }
    var servant = this.data.servant;
    for (var i = 0; i < servant.skill.length; i++) {
      servant.skill[i].tarLevel = 10;
      if (servant_info[i + 1] >= 10) {
        servant.skill[i].skillLevelUp = '10';
      } else {
        servant.skill[i].skillLevelUp = servant_info[i + 1] + "→" + 10;
      }
      servant_info[i + 1] = 10;
    }
    servant_info[0] = 4;
    if (servant.clothFlag == 'Y') {
      servant_info[4] = 1;
    }
    this.setData({
      servant: servant,
      servant_info: servant_info,
      topFlag: 1
    });
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
  calMaterial: function () {
    var servant = this.data.servant;
    var id = this.data.id;
    var servant_info = this.data.servant_info;
    var imgPath = [];
    //var servant_info_old = wx.getStorageSync('srv_' + id + "_" + curAccId);
    id = id + "";
    var allSkillInfo = wx.getStorageSync('srvSkill' + "_" + curAccId);
    if (allSkillInfo == undefined || allSkillInfo == '') {
      allSkillInfo = new Object();
    }
    var servant_info_old = allSkillInfo[id];
    if (servant_info_old == undefined || servant_info_old == '') {
      servant_info_old = [0, 1, 1, 1];//默认灵基/技能等级
    }
    servant_info_old.push(0);
    var flag = false;
    var rank = servant_info_old[0] + "_" + servant_info[0];
    if (servant_info_old[0] < servant_info[0]) {
      flag = true;
    }
    var clothFlag = 'N';
    if (servant_info_old[4] < servant_info[4]) {
      flag = true;
      clothFlag = 'Y';
    }
    var skill = '';
    for (var i = 0; i < servant.skill.length; i++) {
      skill = skill + servant_info_old[i + 1] + "_" + servant_info[i + 1] + ",";
      imgPath.push(servant.skill[i].imgPath);
      if (servant_info_old[i + 1] < servant_info[i + 1]) {
        flag = true;
      }
    }
    if (flag) {
      var item = wx.getStorageSync('srv_list' + "_" + curAccId);
      var id = this.data.id;
      var flag = 0;
      for (var j = 0; j < item.length; j++) {
        if (id == item[j]) {
          flag = 1;
          break;
        }
      }
      if (flag == 0) {
        item.push(id);
        this.setData({
          color: '#2aa515',
        });
        wx.setStorageSync('srv_list' + "_" + curAccId, item);
      }
      wx.navigateTo({
        url: "servant_material?id=" + id + "&rank=" + rank + "&skill=" + skill + "&clothFlag=" + clothFlag + "&imgPath=" + imgPath
      });
    } else {
      wx.showToast({
        title: '请先设置技能',
        icon: 'success',
        image: '/images/warning.png',
        duration: 1000
      })
    }
  },
  showImages: function (e) {
    var time = e.timeStamp;
    //设置无效点击，根据自己的需求设置，这里navigateTo切换页面到动画结束需要的时间为500毫秒左右
    if (time - app.globalData.lastTapTime < 1000) {
      app.globalData.lastTapTime = time;//这里一定更新无效点击的时间
      return;
    }
    //更新有效点击的时间
    app.globalData.lastTapTime = time;
    wx.navigateTo({
      url: "servant_images?id=" + this.data.id + "&name=" + this.data.servant.name
    });
  },
  changeView: function (e) {
    var skill = e.currentTarget.dataset.index;
    if (this.data.skill != skill) {
      this.setData({
        skill: skill
      });
    }
  },
  setCloth: function () {
    var servantInfo = this.data.servant_info;
    servantInfo[4] = servantInfo[4] == 1 ? 0 : 1;
    this.setData({
      servant_info: servantInfo
    })
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
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
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {

  }
})