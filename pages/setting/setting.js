// pages/setting/setting.js
var sliderWidth = 0; // 需要设置slider的宽度，用于计算中间位置
var time = 0;
var touchDot = 0;//触摸时的原点
var interval = "";
var flag_hd = true;
var curAccId = 1;
var accountChange = false;
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: 1,
    tabs: ["账号", "规划"],
    accountList: [],
    servantList: [],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    pageHeight: 400,
    color: 'GREENYELLOW',
    ownCount: [0, 0, 0, 0, 0],
    totalCount: [0, 0, 0, 0, 0],
    percent: [0, 0, 0, 0, 0],
    materialData: new Object(),
    showLevel: 1,
    model: 0,
    curProgrameId: "",
    url: "",
    programeList: [],
    importFlag: 'N',
    importList: [],
    modelArray: [],
    showModalStatus: false,
    sortWay: ['默认', '星级'],
    sortWayIndex: 0,
    sortCur: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var servantList = getApp().globalData.servantList;
    var totalCount = [0, 0, 0, 0, 0];
    for (var i = 0; i < servantList.length; i++) {
      var index = 5 - parseInt(servantList[i].rarity);
      totalCount[index] = totalCount[index] + 1;
    }
    var showInputFlag = wx.getStorageSync('showInput') == '0' ? 0 : 1;
    that.setData({
      showLevel: showInputFlag,
      url: app.globalData.url + "/fgo"
    });

    that.setData({
      totalCount: totalCount
    });
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          pageHeight: res.windowHeight,
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 10,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    wx.setNavigationBarTitle({
      title: '个人规划'
    });
  },
  onShow: function () {
    var account = wx.getStorageSync('account');
    if (account == undefined || account == '') {
      account = [];
      account.push({ id: '1', name: '默认账号', status: 1 });
      account.push({ id: '2', name: '账号2', status: 0 });
      account.push({ id: '3', name: '账号3', status: 0 });
      account.push({ id: '4', name: '账号4', status: 0 });
      account.push({ id: '5', name: '账号5', status: 0 });
    }
    wx.setStorageSync('account', account);
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    var key = "programe_" + curAccId;
    if (this.data.curProgrameId != "") {
      key = key + "_" + this.data.curProgrameId;
    }
    var programeList = wx.getStorageSync(key);
    if (programeList == undefined || programeList == '') {
      programeList = [];
    }
    this.setData({
      servantList: programeList,
      model: wx.getStorageSync("model")
    })
    this.setData({
      accountList: account,
      accountChange: false
    });
    this.changeRarity();
    this.initServantSkill();
    this.refreshSetting();
  },
  onHide: function () {
    var servantList = this.data.servantList;
    var key = "programe_" + curAccId;
    if (this.data.curProgrameId != "") {
      key = key + "_" + this.data.curProgrameId;
    }
    wx.setStorageSync(key, servantList);
  },
  changeRarity: function () {
    var rarity = wx.getStorageSync('servantRarity');
    var item = wx.getStorageSync('srv_list' + "_" + curAccId);
    var ownCount = [0, 0, 0, 0, 0];
    var totalCount = this.data.totalCount;
    for (var i = 0; i < item.length; i++) {
      var id = item[i] + '';
      var index = 5 - parseInt(rarity[id].rarity);
      ownCount[index] = ownCount[index] + 1;
    }
    var percent = [];
    percent.push(Math.floor(ownCount[0] * 100 / totalCount[0]));
    percent.push(Math.floor(ownCount[1] * 100 / totalCount[1]));
    percent.push(Math.floor(ownCount[2] * 100 / totalCount[2]));
    percent.push(Math.floor(ownCount[3] * 100 / totalCount[3]));
    percent.push(Math.floor(ownCount[4] * 100 / totalCount[4]));
    this.setData({
      ownCount: ownCount,
      percent: percent
    })
  },
  initServantSkill: function (e) {
    var servantList = this.data.servantList;
    var allSkillInfo = wx.getStorageSync('srvSkill' + "_" + curAccId);
    if (allSkillInfo == undefined || allSkillInfo == '') {
      allSkillInfo = new Object();
    }
    for (var i = 0; i < servantList.length; i++) {
      var curSkillLevel = allSkillInfo[servantList[i].id + ''];
      if (curSkillLevel == undefined || curSkillLevel == null) {
        curSkillLevel = [0, 1, 1, 1];
      }
      servantList[i].rank = curSkillLevel[0];
      servantList[i].skill = [curSkillLevel[1], curSkillLevel[2], curSkillLevel[3], curSkillLevel[4]];
    }
    this.setData({
      servantList: servantList
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    if (this.data.activeIndex == 1 && this.data.accountChange) {
      this.onShow();
    }
  },
  changeAccount: function () {
    var account = wx.getStorageSync('account');
    var msgArray = [];
    for (var i = 0; i < account.length; i++) {
      msgArray.push(account[i].name);
    }
    var that = this;
    wx.showActionSheet({
      itemList: msgArray,
      success: function (res) {
        if (!res.cancel) {
          var id = res.tapIndex + 1;
          for (var i = 0; i < account.length; i++) {
            if (id == account[i].id) {
              account[i].status = 1;
            } else {
              account[i].status = 0;
            }
          }
          var flag = false;
          if (curAccId != id) {
            flag = true;
          }
          curAccId = id;
          wx.setStorageSync('account', account);
          that.setData({
            accountList: account,
            accountChange: flag
          });
          that.changeRarity();
        }
      }
    })
  },
  changeAccName: function (e) {
    var name = e.detail.value;
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        account[i].name = name;
      }
    }
    wx.setStorageSync('account', account);
  },
  skillUp: function (e) {
    var servantId = e.currentTarget.dataset.index;
    var tarValue = parseInt(e.currentTarget.dataset.value);
    var index = parseInt(e.currentTarget.dataset.src);
    var servantList = this.data.servantList;
    for (var i = 0; i < servantList.length; i++) {
      if (servantList[i].id == servantId) {
        servantList[i].tarSkill[index] = tarValue;
        break;
      }
    }
    this.setData({
      servantList: servantList
    })
  },
  rankUp: function (e) {
    var servantId = e.currentTarget.dataset.index;
    var tarValue = parseInt(e.currentTarget.dataset.value);
    var servantList = this.data.servantList;
    for (var i = 0; i < servantList.length; i++) {
      if (servantList[i].id == servantId) {
        servantList[i].tarRank = tarValue;
        break;
      }
    }
    this.setData({
      servantList: servantList
    })
  },
  upRank: function (e) {
    var servantId = e.currentTarget.dataset.index;
    var servantList = this.data.servantList;
    for (var i = 0; i < servantList.length; i++) {
      if (servantList[i].id == servantId) {
        var curValue = servantList[i].tarRank;
        curValue = (curValue + 1) % 5;
        servantList[i].tarRank = curValue;
      }
    }
    this.setData({
      servantList: servantList
    })
  },
  upSkill: function (e) {
    var servantId = e.currentTarget.dataset.index;
    var servantList = this.data.servantList;
    for (var i = 0; i < servantList.length; i++) {
      if (servantList[i].id == servantId) {
        var curValue = servantList[i].tarSkill;
        var max = curValue[0] > curValue[1] ? curValue[0] : curValue[1];
        max = curValue[2] > max ? curValue[2] : max;
        var maxFlag = curValue[0] != curValue[1] ? false : (curValue[1] != curValue[2] ? false : true);
        if (maxFlag) {
          if (1 <= max && max < 4) {
            max = 4
          } else if (4 <= max && max < 6) {
            max = 6;
          } else if (6 <= max && max < 9) {
            max = 9;
          } else if (9 <= max && max < 10) {
            max = 10;
          } else {
            max = 1;
          }
        }
        servantList[i].tarSkill = [max, max, max];
      }
    }
    this.setData({
      servantList: servantList
    })
  },
  skillDown: function (e) {
    var servantId = e.currentTarget.dataset.index;
    var index = parseInt(e.currentTarget.dataset.src);
    var servantList = this.data.servantList;
    for (var i = 0; i < servantList.length; i++) {
      if (servantList[i].id == servantId) {
        var value = servantList[i].tarSkill[index];
        value = (value - 1) % 10;
        if (value == 0) {
          value = 10;
        }
        servantList[i].tarSkill[index] = value;
        break;
      }
    }
    this.setData({
      servantList: servantList
    })
  },
  skillUpOne: function (e) {
    var servantId = e.currentTarget.dataset.index;
    var index = parseInt(e.currentTarget.dataset.src);
    var servantList = this.data.servantList;
    for (var i = 0; i < servantList.length; i++) {
      if (servantList[i].id == servantId) {
        var value = servantList[i].tarSkill[index];
        value = value % 10 + 1;
        servantList[i].tarSkill[index] = value;
      }
    }
    this.setData({
      servantList: servantList
    })
  },
  upSkill2: function (e) {
    var servantId = e.currentTarget.dataset.index;
    var servantList = this.data.servantList;
    for (var i = 0; i < servantList.length; i++) {
      if (servantList[i].id == servantId) {
        var curValue = servantList[i].tarSkill;
        var max = curValue[0] > curValue[1] ? curValue[0] : curValue[1];
        max = curValue[2] > max ? curValue[2] : max;
        var maxFlag = curValue[0] != curValue[1] ? false : (curValue[1] != curValue[2] ? false : true);
        if (maxFlag) {
          max = max % 10 + 1;
        }
        servantList[i].tarSkill = [max, max, max];
      }
    }
    this.setData({
      servantList: servantList
    })
  },
  closeInput: function () {
    this.setData({
      showLevel: 1
    })
    wx.setStorageSync('showInput', '1');
  },
  showInput: function () {
    this.setData({
      showLevel: 0
    })
    wx.setStorageSync('showInput', '0');
  },
  allTop: function (e) {
    var that = this;
    wx.showModal({
      title: '技能变更',
      content: '将所有从者设置为310？',
      success: function (res) {
        if (res.confirm) {
          var servantList = that.data.servantList;
          for (var i = 0; i < servantList.length; i++) {
            servantList[i].tarRank = 4;
            servantList[i].tarSkill = [10, 10, 10];
          }
          that.setData({
            servantList: servantList
          })
        }
      }
    });
  },
  addServant: function (e) {
    wx.navigateTo({
      url: "servant_setting"
    });
  },
  gotoGraphs: function (e) {
    var value = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: "setting_account?id=" + value
    });
  },
  removeServant: function (e) {
    var servantId = e.currentTarget.dataset.index;
    var tarValue = e.currentTarget.dataset.value;
    var that = this;
    wx.showModal({
      title: '移除英灵',
      content: '从规划列表中移除[' + tarValue + ']',
      success: function (res) {
        if (res.confirm) {
          var servantList = that.data.servantList;
          for (var i = 0; i < servantList.length; i++) {
            if (servantList[i].id == servantId) {
              servantList.splice(i, 1);
              break;
            }
          }
          var key = "programe_" + curAccId;
          if (that.data.curProgrameId != "") {
            key = key + "_" + that.data.curProgrameId;
          }
          wx.setStorageSync(key, servantList);
          that.setData({
            servantList: servantList
          })
          that.refreshSetting();
        }
      }
    });
  },
  calculate: function () {
    var that = this;
    var servantList = this.data.servantList;
    if (servantList.length == 0) {
      wx.showToast({
        title: '请先选择英灵',
        icon: 'success',
        image: '/images/warning.png',
        duration: 500
      });
      return;
    }
    var infoArray = [];
    for (var i = 0; i < servantList.length; i++) {
      var servant = new Object;
      servant.servantId = servantList[i].id;
      servant.rank = servantList[i].rank + "_" + servantList[i].tarRank;
      servant.skill1 = servantList[i].skill[0] + "_" + servantList[i].tarSkill[0];
      servant.skill2 = servantList[i].skill[1] + "_" + servantList[i].tarSkill[1];
      servant.skill3 = servantList[i].skill[2] + "_" + servantList[i].tarSkill[2];
      servant.clothFlag = (servantList[i].skill[3] == 1 ? 'N' : 'Y');
      infoArray.push(servant);
    }
    var routInfo = { "param": infoArray, "ownCount": wx.getStorageSync('material' + "_" + curAccId) };
    wx.showToast({
      title: '正在计算',
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
        var key = "programe_" + curAccId;
        if (that.data.curProgrameId != "") {
          key = key + "_" + that.data.curProgrameId;
        }
        wx.setStorageSync(key, servantList);
        that.setData({
          materialData: res.data.data
        })
        wx.navigateTo({
          url: "setting_details"
        });
      }
    })
  },
  clearAll: function () {
    var that = this;
    wx.showModal({
      title: '重要：清空规划列表',
      content: '确认清空当前规划列表？',
      success: function (res) {
        if (res.confirm) {
          that.setData({
            servantList: []
          })
        }
        that.refreshSetting();
      }
    });
  },
  changeModel: function () {
    var model = wx.getStorageSync("model");
    model = model == 1 ? 0 : 1;
    wx.setStorageSync("model", model);
    this.setData({
      model: model
    })
  },
  changePrograme: function (e) {
    this.onHide();
    var id = e.currentTarget.dataset.index;
    this.setData({
      curProgrameId: id
    })
    this.onShow();
  },
  uploadSetting: function (e) {
    wx.navigateTo({
      url: "../material/material_upload"
    });
  },
  showHelp: function (e) {
    wx.navigateTo({
      url: "../setting/setting_help"
    });
  },
  refreshSetting: function () {
    var curId = this.data.curProgrameId;
    var servantList = this.data.servantList;
    var importFlag = this.data.servantList.length == 0 ? "Y" : "N";
    var importIds = [1, 2, 3];
    var importKey = ["", "1", "2"];
    var resultKey = [];
    for (var i = 0; i < importIds.length; i++) {
      if (curId == importKey[i]) {
        continue;
      }
      resultKey.push(importIds[i]);
    }
    this.setData({
      importFlag: importFlag,
      importList: resultKey
    })
  },
  importList: function (e) {
    var id = e.currentTarget.dataset.index - 1;
    var index = ['', '1', '2'];
    var key = "programe_" + curAccId;
    if (index[id] != "") {
      key = key + "_" + index[id];
    }
    var programeList = wx.getStorageSync(key);
    if (programeList == undefined || programeList == '') {
      programeList = [];
    }
    if (programeList.length == 0) {
      wx.showToast({
        title: '此列表为空',
        icon: 'success',
        image: '/images/warning.png',
        duration: 500
      });
      return;
    }
    this.setData({
      servantList: programeList,
    })
    this.refreshSetting();
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    var currentOper = e.currentTarget.dataset.oper;
    if (currentStatu == "close") {
      if (currentOper == "confirm") {
        this.setData({
          servantList: this.data.modelArray
        });
      }
    } else {
      this.setData({
        modelArray: this.data.servantList
      })
    }
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
  downItem: function (e) {
    var index = e.currentTarget.dataset.index;
    var modelArray = this.data.modelArray;
    var servantInfo = modelArray[index];
    modelArray[index] = modelArray[index + 1];
    modelArray[index + 1] = servantInfo;
    this.setData(
      {
        modelArray: modelArray
      }
    );
  },
  upItem: function (e) {
    var index = e.currentTarget.dataset.index;
    var modelArray = this.data.modelArray;
    var servantInfo = modelArray[index];
    modelArray[index] = modelArray[index - 1];
    modelArray[index - 1] = servantInfo;
    this.setData({
      modelArray: modelArray
    });
  },
  switchSortWay: function () {
    var index = this.data.sortWayIndex;
    var sortWay = this.data.sortWay;
    index = (index + 1) % sortWay.length;
    this.setData({
      sortWayIndex: index
    })
  },
  sortProgrameList: function (e) {
    var cur = e.currentTarget.dataset.index;
    var sortWayIndex = this.data.sortWayIndex;
    var modelArray = this.data.modelArray;
    if (sortWayIndex == 0) {
      if (cur == 1) {
        modelArray.sort(function (a, b) {
          return a.id < b.id ? -1 : 1
        });
      } else {
        modelArray.sort(function (a, b) {
          return a.id < b.id ? 1 : -1
        });
      }
    } else if (sortWayIndex == 1) {
      if (cur == 1) {
        modelArray.sort(function (a, b) {
          if (a.rarity == b.rarity) return a.id < b.id ? -1 : 1;
          return a.rarity < b.rarity ? -1 : 1
        });
      } else {
        modelArray.sort(function (a, b) {
          if (a.rarity == b.rarity) return a.id < b.id ? -1 : 1;;
          return a.rarity < b.rarity ? 1 : -1
        });
      }
    }
    this.setData({
      modelArray: modelArray,
      sortCur: cur
    });
  }
})