// pages/servant/servant_detail.js
var sliderWidth = 0; // 需要设置slider的宽度，用于计算中间位置
var time = 0;
var touchDot = 0; //触摸时的原点
var interval = "";
var flag_hd = true;
var curAccId = 1;
var app = getApp();
var videoContext = {};
var util = require('../../utils/util.js');

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
    model: app.globalData.model,
    movieUrl: '',
    playFlag: '',
    imgUrl: '',
    modelArray: [],
    showModalStatus: false,
    tInfo: {},
    tDesc: [],
    tLv: [],
    attackList: {
      "attack": [],
      "attacked": []
    },
    showOldTreasure: false,
    showSkill: 'NEW',
    clothList: [],
    servantList: {},
    eventList:[],
    showPast:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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
      servant_info = [0, 1, 1, 1, 0]; //默认灵基/技能等级/灵衣
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
      success: function(res) {
        that.setData({
          height: res.windowHeight - 50,
          width: res.windowWidth,
          imgUrl: app.globalData.url,
          model: app.globalData.model
        });
      }
    });
    wx.showToast({
      title: '正在加载',
      icon: 'loading',
      duration: 10000,
      mask: true
    })
    wx.request({
      url: app.globalData.url + '/servant/getServantInfo.do?servantId=' + options.id,
      method: 'GET',
      success: function(res) {
        wx.hideToast();
        var servant = res.data.data;
        var oldCount = 0;
        servant.skill = servant.skill.concat(servant.skillOld);
        servant.skill.sort(function(a, b) {
          return a.id <= b.id ? -1 : 1
        });
        for (var i = 0; i < servant.skill.length; i++) {
          if (servant.skill[i].skillSrc == 'OLD') {
            oldCount++;
          }
          servant.skill[i].skillLevel = servant_info[i + 1 - oldCount];
          servant.skill[i].tarLevel = servant_info[i + 1 - oldCount];
          servant.skill[i].skillLevelUp = servant_info[i + 1 - oldCount];
          servant.skill[i].skillIndex = i - oldCount;

          servant.skill[i].skillDesc = servant.skill[i].skillDesc.split("&");
          var lv = servant.skill[i].lv;
          for (var j = 0; j < lv.length; j++) {
            lv[j] = lv[j].split("/");
          }
          servant.skill[i].lv = lv;
          var skillName = servant.skill[i].skillName;
          var keyIndex = skillName.lastIndexOf("（");
          servant.skill[i].skillName = skillName.substring(0, keyIndex);
          servant.skill[i].skillCD = parseInt(skillName.substring(keyIndex).replace("（", "").replace("）", ""));
        }

        var treasure = servant.treasure;
        var tName = treasure.tName;
        var index = tName.indexOf("（");
        if (index > 0) {
          treasure.tName = tName.substring(0, index);
          treasure.eName = tName.substring(index + 1).replace("）", "");
        }
        var clothList = that.data.clothList;
        var tDesc = treasure.tDesc.split("-");
        var tLv = treasure.tLv.split("-");
        for (var i = 0; i < tLv.length; i++) {
          tLv[i] = tLv[i].split("|");
        }
        if (servant.cardInfo){
          servant.cardInfo.intro = servant.cardInfo.intro.split("\n");
        }
        that.setData({
          tInfo: servant.treasure,
          tDesc: tDesc,
          tLv: tLv,
          id: options.id,
          servant_info: servant_info,
          color: color,
          servant: servant,
          modelArray: servant.matReq
        });
        wx.setNavigationBarTitle({
          title: that.data.servant.name //页面标题为路由参数
        });
        app.globalData.lastTapTime = 0;
        that.showNewSkill();
      }
    });

    wx.request({
      url: app.globalData.url + '/servant/getServantClothList.do?servantId=' + options.id,
      method: 'GET',
      success: function(res) {
        var allCloth = [];
        var servantList = {};
        var length = res.data.data.length;
        for (var i = 0; i < res.data.data.length; i++) {
          allCloth.push(res.data.data[i]);
          var lastServantId = res.data.data[length - 1].skillServantId
          wx.request({
            url: app.globalData.url + '/servant/getServantSkillInfo.do?servantId=' + res.data.data[i].skillServantId,
            method: 'GET',
            success: function(res) {
              servantList[res.data.data.servantId + ''] = res.data.data;
              if (Object.keys(servantList).length == allCloth.length) {
                that.setData({
                  clothList: allCloth,
                  servantList: servantList
                })
              }
            }
          });
        }
      }
    });


    wx.request({
      url: app.globalData.url + '/servant/getServantAttack.do?servantId=' + options.id,
      method: 'GET',
      success: function(res) {
        that.setData({
          attackList: res.data.data
        });
      }
    });

    wx.request({
      url: app.globalData.url + '/event/getPickupServant.do?servantId=' + options.id,
      method: 'GET',
      success: function (res) {
        if (res.data.data) {
          var servantList = app.globalData.servantList;
          var upList = res.data.data;
          for (var i = 0; i < upList.length; i++) {
            var servantMap = upList[i].detail;
            Object.keys(servantMap).forEach(function (key) {
              var list = servantMap[key + ''];
              list.forEach(function (curUp) {
                servantList.forEach(function (servant) {
                  if (servant.id == curUp.servantId) {
                    curUp.imgPath = servant.imgPath;
                    curUp.rarity = servant.rarity;
                    curUp.name = servant.name;
                  }
                })
              })
            });
          }
          that.setData({
            eventList: upList
          });
        }
      }
    });
  },

  showOldSkill: function() {
    var servant = this.data.servant;
    var skillDesp = [];
    for (var i = 0; i < servant.skill.length; i++) {
      if (servant.skill[i].skillSrc != 'NEW') {
        skillDesp.push(servant.skill[i]);
      }
    }
    servant.skillDesp = skillDesp;
    this.setData({
      servant: servant,
      showSkill: 'OLD'
    })
  },
  showNewSkill: function() {
    var servant = this.data.servant;
    var skillDesp = [];
    for (var i = 0; i < servant.skill.length; i++) {
      if (servant.skill[i].skillSrc != 'OLD') {
        skillDesp.push(servant.skill[i]);
      }
    }
    servant.skillDesp = skillDesp;
    this.setData({
      servant: servant,
      showSkill: 'NEW'
    })
  },

  changeServantSkillDesc: function(e) {
    wx.showToast({
      title: '正在加载',
      icon: 'loading',
      duration: 10000,
      mask: true
    })
    var skillServantId = e.detail.currentItemId;
    var current = this.data.servantList[skillServantId + ''];
    var servant = this.data.servant;
    if (current.skill.length > 0) {
      for (var i = 0; i < current.skill.length; i++ ){
        current.skill[i].skillLevel = servant.skill[i].skillLevel;
        current.skill[i].tarLevel = servant.skill[i].tarLevel;
        current.skill[i].skillLevelUp = servant.skill[i].skillLevelUp;
        current.skill[i].skillIndex = servant.skill[i].skillIndex;
      }
      servant.skill = current.skill;
    }
    if (current.skillAdd.length > 0) {
      servant.skillAdd = current.skillAdd;
    }
    if (current.skillOld.length > 0) {
      servant.skillOld = current.skillOld;
    }
    servant.treasure = current.treasure;
    servant.treasure_old = current.treasure_old;
    servant.treasure_update = current.treasure_update;

    servant.skill = servant.skill.concat(servant.skillOld);
    servant.skill.sort(function(a, b) {
      return a.id <= b.id ? -1 : 1
    });
    for (var i = 0; i < servant.skill.length; i++) {
      if (servant.skill[i].skillCD) {
        continue;
      }
      servant.skill[i].skillDesc = servant.skill[i].skillDesc.split("&");
      var lv = servant.skill[i].lv;
      for (var j = 0; j < lv.length; j++) {
        lv[j] = lv[j].split("/");
      }
      servant.skill[i].lv = lv;
      var skillName = servant.skill[i].skillName;
      var keyIndex = skillName.lastIndexOf("（");
      servant.skill[i].skillName = skillName.substring(0, keyIndex);
      servant.skill[i].skillCD = parseInt(skillName.substring(keyIndex).replace("（", "").replace("）", ""));
    }

    var treasure = servant.treasure;
    var tName = treasure.tName;
    var index = tName.indexOf("（");
    if (index > 0) {
      treasure.tName = tName.substring(0, index);
      treasure.eName = tName.substring(index + 1).replace("）", "");
    }
    var tDesc = treasure.tDesc.split("-");
    var tLv = treasure.tLv.split("-");
    for (var i = 0; i < tLv.length; i++) {
      tLv[i] = tLv[i].split("|");
    }
    this.setData({
      tInfo: servant.treasure,
      tDesc: tDesc,
      tLv: tLv,
      servant: servant,
    });
    this.showNewSkill();
    wx.hideToast();

  },

  bindNumChange: function(e) {
    var nums = this.data.servant_info;
    var curValue = parseInt(e.currentTarget.dataset.id);
    nums[0] = curValue;
    this.setData({
      servant_info: nums
    });
  },
  setCare: function() {
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
  changeSkillLevel0: function(e) {
    var curValue = e.detail.value;
    if (!curValue) {
      curValue = e.currentTarget.dataset.index;
    }
    var servant_info = this.data.servant_info;
    servant_info[1] = curValue;
    var servant = this.data.servant;
    for (var i = 0; i < servant.skill.length; i++) {
      if (servant.skill[i].skillIndex == 0) {
        var oldValue = servant.skill[i].skillLevel;
        servant.skill[i].tarLevel = curValue;
        if (oldValue >= curValue) {
          servant.skill[i].skillLevelUp = curValue;
        } else {
          servant.skill[i].skillLevelUp = oldValue + "→" + curValue;
        }
      }
    }
    this.setData({
      servant: servant
    });
  },
  changeSkillLevel1: function(e) {
    var curValue = e.detail.value;
    if (!curValue) {
      curValue = e.currentTarget.dataset.index;
    }
    var servant_info = this.data.servant_info;
    servant_info[2] = curValue;
    var servant = this.data.servant;
    for (var i = 0; i < servant.skill.length; i++) {
      if (servant.skill[i].skillIndex == 1) {
        var oldValue = servant.skill[i].skillLevel;
        servant.skill[i].tarLevel = curValue;
        if (oldValue >= curValue) {
          servant.skill[i].skillLevelUp = curValue;
        } else {
          servant.skill[i].skillLevelUp = oldValue + "→" + curValue;
        }
      }
    }
    this.setData({
      servant: servant
    });
  },
  changeSkillLevel2: function(e) {
    var curValue = e.detail.value;
    if (!curValue) {
      curValue = e.currentTarget.dataset.index;
    }
    var servant_info = this.data.servant_info;
    servant_info[3] = curValue;
    var servant = this.data.servant;
    for (var i = 0; i < servant.skill.length; i++) {
      if (servant.skill[i].skillIndex == 2) {
        var oldValue = servant.skill[i].skillLevel;
        servant.skill[i].tarLevel = curValue;
        if (oldValue >= curValue) {
          servant.skill[i].skillLevelUp = curValue;
        } else {
          servant.skill[i].skillLevelUp = oldValue + "→" + curValue;
        }
      }
    }
    this.setData({
      servant: servant
    });
  },
  setStatus: function() {
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
  setDefault: function() {
    var id = this.data.id;
    //var servant_info = wx.getStorageSync('srv_' + id + "_" + curAccId);
    id = id + "";
    var allSkillInfo = wx.getStorageSync('srvSkill' + "_" + curAccId);
    if (allSkillInfo == undefined || allSkillInfo == '') {
      allSkillInfo = new Object();
    }
    var servant_info = allSkillInfo[id];
    if (servant_info == undefined || servant_info == '') {
      servant_info = [0, 1, 1, 1, 0]; //默认灵基/技能等级
    }
    var servant = this.data.servant;
    var oldCount = 0;
    for (var i = 0; i < servant.skill.length; i++) {
      if (servant.skill[i].skillSrc == 'OLD') {
        oldCount++;
      }
      servant.skill[i].skillLevel = servant_info[i + 1 - oldCount];
      servant.skill[i].tarLevel = servant_info[i + 1 - oldCount];
      servant.skill[i].skillLevelUp = servant_info[i + 1 - oldCount];
      servant.skill[i].skillIndex = i - oldCount;
    }
    this.setData({
      servant: servant,
      servant_info: servant_info,
      topFlag: 0
    });
  },
  setTop: function() {
    var id = this.data.id;
    // var servant_info = wx.getStorageSync('srv_' + id + "_" + curAccId);
    id = id + "";
    var allSkillInfo = wx.getStorageSync('srvSkill' + "_" + curAccId);
    if (allSkillInfo == undefined || allSkillInfo == '') {
      allSkillInfo = new Object();
    }
    var servant_info = allSkillInfo[id];
    if (servant_info == undefined || servant_info == '') {
      servant_info = [0, 1, 1, 1, 0]; //默认灵基/技能等级
    }
    var servant = this.data.servant;
    for (var i = 0; i < servant.skillDesp.length; i++) {
      servant.skillDesp[i].tarLevel = 10;
      if (servant_info[i + 1] >= 10) {
        servant.skillDesp[i].skillLevelUp = '10';
      } else {
        servant.skillDesp[i].skillLevelUp = servant_info[i + 1] + "→" + 10;
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
  showOldTreasure: function() {
    var treasure = this.data.servant.treasure_old;
    var tDesc = treasure.srcDesc.split("-");
    var tLv = treasure.srcInfo.split("-");
    for (var i = 0; i < tLv.length; i++) {
      tLv[i] = tLv[i].split("|");
    }
    this.setData({
      tDesc: tDesc,
      tLv: tLv,
      showOldTreasure: true
    });
  },
  showNewTreasure: function() {
    var treasure = this.data.servant.treasure;
    var tDesc = treasure.tDesc.split("-");
    var tLv = treasure.tLv.split("-");
    for (var i = 0; i < tLv.length; i++) {
      tLv[i] = tLv[i].split("|");
    }
    this.setData({
      tDesc: tDesc,
      tLv: tLv,
      showOldTreasure: false
    });
  },
  calMaterial: function() {
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
      servant_info_old = [0, 1, 1, 1]; //默认灵基/技能等级
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
    for (var i = 0; i < servant.skillDesp.length; i++) {
      skill = skill + servant_info_old[i + 1] + "_" + servant_info[i + 1] + ",";
      imgPath.push(servant.skillDesp[i].imgPath);
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
      wx.showModal({
        title: '操作提示',
        content: '设置按钮初始化当前技能等级，再选择目标等级后计算',
        confirmText: '知道了',
        showCancel: false
      })
    }
  },
  showImages: function(e) {
    var time = e.timeStamp;
    //设置无效点击，根据自己的需求设置，这里navigateTo切换页面到动画结束需要的时间为500毫秒左右
    if (time - app.globalData.lastTapTime < 1000) {
      app.globalData.lastTapTime = time; //这里一定更新无效点击的时间
      return;
    }
    //更新有效点击的时间
    app.globalData.lastTapTime = time;
    wx.navigateTo({
      url: "servant_images?id=" + this.data.id + "&name=" + this.data.servant.name + "&clothFlag=" + this.data.servant.clothFlag
    });
  },
  changeView: function(e) {
    var skill = e.currentTarget.dataset.index;
    if (this.data.skill != skill) {
      this.setData({
        skill: skill
      });
    }
  },
  setCloth: function() {
    var servantInfo = this.data.servant_info;
    servantInfo[4] = servantInfo[4] == 1 ? 0 : 1;
    this.setData({
      servant_info: servantInfo
    })
  },
  powerDrawer: function(e) {
    var currentStatu = e.currentTarget.dataset.statu;
    util.show(currentStatu, this);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  showDetail: function (e) {
    var id = e.currentTarget.dataset.index;
    var eventList = this.data.eventList;
    for (var i = 0; i < eventList.length; i++) {
      eventList[i].show = 0;
      if (eventList[i].id == id) {
        eventList[i].show = 1;
      }
    }
    wx.navigateTo({
      url: '../event/event_pickup_detail',
    })
  },
  showImg: function () {
    var url = this.data.servant.cardInfo.pic1;
    wx.previewImage({
      urls: [url],
    })
  },

  showVideo: function(){
    var that = this;
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        var networkType = res.networkType;
        if(networkType !='wifi'){
          wx.showModal({
            title: '流量播放提示',
            content: '当前未连接wifi，预计消耗3M流量播放宝具动画',
            success: function (res) {
              if (res.confirm) {
                that.setData({
                  videoSrc: that.data.servant.treasure.animeAddr
                })
              }
            }
          })
        }else{
          that.setData({
            videoSrc: that.data.servant.treasure.animeAddr
          })
        }
      }
    })
    
  },

  previewImages: function(){
    var id = this.data.id;
    id = id.substring(1, 4);
    var url = app.globalData.url.replace("www.fgowiki.cn", "fgowiki.cn");
    // var url = app.globalData.imgUrl;
    var images = [];
    images.push(url + "/images/servant/detail/" + id + "A.jpg");
    images.push(url + "/images/servant/detail/" + id + "B.jpg");
    images.push(url + "/images/servant/detail/" + id + "C.jpg");
    images.push(url + "/images/servant/detail/" + id + "D.jpg");
    var clothFlag = this.data.servant.clothFlag;
    if (clothFlag == 'Y') {
      images.push(url + "/images/servant/detail/" + id + "Z.jpg");
    }
    if (id == '001' || id == '220') {
      images.push(url + "/images/servant/detail/" + id + "E.jpg");
    }
    wx.previewImage({
      urls: images // 需要预览的图片http链接列表   
    })
  },

  showServantNotes: function(){
    wx.navigateTo({
      url: "servant_notes?id=" + this.data.id + "&name=" + this.data.servant.name
    });
  },
  showServantAtk: function () {
    wx.navigateTo({
      url: "servant_atk?id=" + this.data.id + "&name=" + this.data.servant.name
    });
  }   
})