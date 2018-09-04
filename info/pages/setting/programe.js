// pages/setting/setting.js
var sliderWidth = 150; // 需要设置slider的宽度，用于计算中间位置
var time = 0;
var touchDot = 0; //触摸时的原点
var interval = "";
var flag_hd = true;
var curAccId = 1;
var accountChange = false;
var app = getApp();
var util = require('../../utils/util.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    servantList: [],
    programeListArray: [{
        id: "",
        text: "1"
      }, {
        id: 1,
        text: "2"
      }, {
        id: 2,
        text: "3"
      }, {
        id: 3,
        text: "4"
      }, {
        id: 4,
        text: "5"
      },
      {
        id: 5,
        text: "6"
      }, {
        id: 6,
        text: "7"
      }, {
        id: 7,
        text: "8"
      }, {
        id: 8,
        text: "9"
      }, {
        id: 9,
        text: "10"
      }
    ],
    pageHeight: 400,
    materialData: new Object(),
    showLevel: 1,
    model: app.globalData.model,
    curProgrameId: "",
    url: "",
    programeList: [],
    importFlag: 'N',
    importList: [],
    modelArray: [],
    showModalStatus: false,
    sortWay: ['默认', '星级'],
    sortWayIndex: 0,
    sortCur: 0,
    showfilter: false, //是否显示下拉筛选
    showfilterIndex: null, //是否显示下拉筛选
    multiArray: [
      ['灵基', '技能1', '技能2', '技能3'],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    ],
    multiIndex: [0, 0, 0],
    curServant: {},
    autoSync: "1",
    batchOperModel: "0",
    showDialog:false,
    chooseRank: { "5": "0", "4": "0", "9": "0","0": "0"},
    selectedRank:"-1",
    selectedSkill:"-1"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var servantList = getApp().globalData.servantList;
    var showInputFlag = wx.getStorageSync('showInput') == '0' ? 0 : 1;
    that.setData({
      showLevel: showInputFlag,
      url: app.globalData.url,
      model: app.globalData.model
    });
  },
  onShow: function() {
    var that = this;
    var account = wx.getStorageSync('account');
    if (account == undefined || account == '') {
      account = [];
      account.push({
        id: '1',
        name: '默认账号',
        status: 1
      });
      account.push({
        id: '2',
        name: '账号2',
        status: 0
      });
      account.push({
        id: '3',
        name: '账号3',
        status: 0
      });
      account.push({
        id: '4',
        name: '账号4',
        status: 0
      });
      account.push({
        id: '5',
        name: '账号5',
        status: 0
      });
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
    
    var autoSync = wx.getStorageSync("programe_autoSync");
    if (autoSync == undefined || autoSync == '') {
      autoSync = "1";
    }
    this.setData({
      servantList: programeList,
      accountChange: false,
      autoSync: autoSync
    });
    if(autoSync == "1"){
      this.initServantSkill();
    }
    this.refreshSetting();
    setTimeout(function() {
      wx.getSystemInfo({
        success: function(res) {
          wx.getSystemInfo({
            success: function(res) {
              that.setData({
                pageHeight: res.windowHeight - 42,
              });
            }
          });
        }
      });
    }, 200);
  },
  onHide: function() {
    var servantList = this.data.servantList;
    var key = "programe_" + curAccId;
    if (this.data.curProgrameId != "") {
      key = key + "_" + this.data.curProgrameId;
    }
    wx.setStorage({
      key:key, 
      data:servantList
    });
    wx.setStorageSync("programe_autoSync", this.data.autoSync);
    var allPrograme = wx.getStorageSync("allPrograme");
    if (allPrograme == undefined || allPrograme == '') {
      allPrograme = [];
    }
    var isNew = true;
    for (var i = 0; i < allPrograme.length; i++) {
      if (allPrograme[i].id == this.data.curProgrameId) {
        allPrograme[i].data = servantList;
        isNew = false;
        break;
      }
    }
    if (isNew) {
      allPrograme.push({
        "id": this.data.curProgrameId,
        "data": servantList
      });
    }
    allPrograme.sort(function(a, b) {
      return a.id < b.id ? -1 : 1
    });
    wx.setStorage({
      key: 'allPrograme',
      data: allPrograme
    });
  },
  onUnload: function(){
    this.onHide();
  },
  changeCurrentId: function(e) {
    var servantIndex = e.currentTarget.dataset.index;
    var servantList = this.data.servantList;
    var curServant = servantList[servantIndex];
    curServant.index = servantIndex;
    curServant.tarRank = curServant.tarRank > curServant.rank ? curServant.tarRank : curServant.rank;
    curServant.tarSkill[0] = curServant.tarSkill[0] > curServant.skill[0] ? curServant.tarSkill[0] : curServant.skill[0];
    curServant.tarSkill[1] = curServant.tarSkill[1] > curServant.skill[1] ? curServant.tarSkill[1] : curServant.skill[1];
    curServant.tarSkill[2] = curServant.tarSkill[2] > curServant.skill[2] ? curServant.tarSkill[2] : curServant.skill[2];
    this.setData({
      curServant: curServant,
    })
    this.initServantPicker(1);
    this.toggleDialog();
  },
  changeSelected: function (e) {
    var servantIndex = e.currentTarget.dataset.index;
    var servantList = this.data.servantList;
    var curServant = servantList[servantIndex];
    curServant.selected = curServant.selected == "1"?"0":1;
    this.setData({
      servantList: servantList,
    })
  },

  toggleDialog: function() {
    this.setData({
      showDialog: !this.data.showDialog
    });
  },

  bindMultiPickerChange: function(e) {
    var servantList = this.data.servantList;
    var curServant = this.data.curServant;
    var curIndex = curServant.index;
    delete curServant.index;
    servantList[curIndex] = curServant;
    this.setData({
      servantList: servantList
    })
    this.toggleDialog();
  },
  bindMultiPickerColumnChange: function(e) {
    var curServant = this.data.curServant;
    var value = e.detail.value;
    var multiIndex = this.data.multiIndex;

    if (multiIndex[0] != value[0]) {
      this.initServantPicker(value[0]);
    } else {
      multiIndex = value;
      this.initServantPickerArray();
      if (multiIndex[0] == 0) {
        curServant.rank = multiIndex[1];
        curServant.tarRank = multiIndex[2];
      } else {
        curServant.skill[multiIndex[0] - 1] = multiIndex[1] + 1;
        curServant.tarSkill[multiIndex[0] - 1] = multiIndex[2] + 1;
      }
      this.setData({
        curServant: curServant,
        multiIndex: multiIndex
      })
    } 
  },

  initServantPicker: function (index0) {
    var curServant = this.data.curServant;
    var multiIndex = this.data.multiIndex;
    var multiArray = this.data.multiArray;
    multiIndex[0] = index0;
    if (multiIndex[0] == 0) {
      multiIndex[1] = parseInt(curServant.rank);
      multiIndex[2] = parseInt(curServant.tarRank);
      multiArray[1] = [0, 1, 2, 3, 4];
      multiArray[2] = [0, 1, 2, 3, 4];
    } else {
      multiIndex[1] = parseInt(curServant.skill[multiIndex[0] - 1]) - 1;
      multiIndex[2] = parseInt(curServant.tarSkill[multiIndex[0] - 1]) - 1;
      multiArray[1] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      multiArray[2] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
    this.setData({
      multiArray: multiArray
    })
    this.setData({
      multiIndex: multiIndex
    })
  },

  initServantPickerArray: function() {
    var multiIndex = this.data.multiIndex;
    var multiArray = this.data.multiArray;
    if (multiIndex[0] == 0) {
      multiArray[1] = [0, 1, 2, 3, 4];
      multiArray[2] = [0, 1, 2, 3, 4];
    } else {
      multiArray[1] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      multiArray[2] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
    this.setData({
      multiArray: multiArray
    })
  },

  setFilterPanel: function(e) { //展开筛选面板
    const d = this.data;
    const i = e.currentTarget.dataset.findex;
    if (d.showfilterindex == i) {
      this.setData({
        showfilter: false,
        showfilterindex: null
      })
    } else {
      this.setData({
        showfilter: true,
        showfilterindex: i,
      })
    }
  },
  hideFilter: function() { //关闭筛选面板
    this.setData({
      showfilter: false,
      showfilterindex: null
    })
  },

  initServantSkill: function(e) {
  	var that = this;
    var servantList = that.data.servantList;
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
    that.setData({
      servantList: servantList
    }) 
  },

  allTop: function(e) {
    var that = this;
    wx.showModal({
      title: '目标等级变更',
      content: '将所有从者目标技能等级设置为310？',
      success: function(res) {
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
  addServant: function(e) {
    wx.navigateTo({
      url: "servant_setting"
    });
  },
  removeServant: function(e) {
    var servantIndex = e.currentTarget.dataset.index;
    var tarValue = e.currentTarget.dataset.value;
    var that = this;
    wx.showModal({
      title: '移除英灵',
      content: '从规划列表中移除[' + tarValue + ']',
      success: function(res) {
        if (res.confirm) {
          var servantList = that.data.servantList;
          servantList.splice(servantIndex, 1);
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
  calculate: function() {
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
    var dropModel = wx.getStorageSync("dropModel_" + curAccId);
    if (dropModel == undefined || dropModel == '') {
      dropModel = 1;
    }
    var routInfo = {
      "param": infoArray,
      "ownCount": wx.getStorageSync('material' + "_" + curAccId),
      "model": dropModel
    };
    wx.showToast({
      title: '正在计算',
      icon: 'loading',
      duration: 3000,
      mask: true
    })
    wx.request({
      url: app.globalData.url + "/material/calculateServantMaterial.do",
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      data: routInfo,
      fail: function(res) {
        wx.hideToast();
      },
      success: function(res) {
        wx.hideToast();
        if (res.data.data.material.length == 0){
          wx.showToast({
            title: '无素材需求',
            icon: 'success',
            image: '/images/warning.png',
            duration: 500
          });
        }else{
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
      }
    })
  },
  clearAll: function() {
    var that = this;
    wx.showModal({
      title: '重要：清空规划列表',
      content: '确认清空当前规划列表？',
      success: function(res) {
        if (res.confirm) {
          that.setData({
            servantList: []
          })
        }
        that.refreshSetting();
      }
    });
  },
  changePrograme: function(e) {
    this.onHide();
    var id = e.detail.value;
    if (id != "") id = parseInt(id);
    this.setData({
      curProgrameId: id
    })
    this.onShow();
  },
  refreshSetting: function() {
    var curId = this.data.curProgrameId;
    var servantList = this.data.servantList;
    var importFlag = this.data.servantList.length == 0 ? "Y" : "N";
    this.setData({
      importFlag: importFlag,
      importList: wx.getStorageSync("allPrograme")
    })
  },
  importList: function(e) {
    var id = e.currentTarget.dataset.index;
    var key = "programe_" + curAccId;;
    if (id != "") {
      key = key + "_" + id;
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
  powerDrawer: function(e) {
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
    util.show(currentStatu, this);
  },
  downItem: function(e) {
    var index = e.currentTarget.dataset.index;
    var modelArray = this.data.modelArray;
    var servantInfo = modelArray[index];
    modelArray[index] = modelArray[index + 1];
    modelArray[index + 1] = servantInfo;
    this.setData({
      modelArray: modelArray
    });
  },
  upItem: function(e) {
    var index = e.currentTarget.dataset.index;
    var modelArray = this.data.modelArray;
    var servantInfo = modelArray[index];
    modelArray[index] = modelArray[index - 1];
    modelArray[index - 1] = servantInfo;
    this.setData({
      modelArray: modelArray
    });
  },
  switchSortWay: function() {
    var index = this.data.sortWayIndex;
    var sortWay = this.data.sortWay;
    index = (index + 1) % sortWay.length;
    this.setData({
      sortWayIndex: index
    })
  },
  sortProgrameList: function(e) {
    var cur = e.currentTarget.dataset.index;
    var sortWayIndex = this.data.sortWayIndex;
    var modelArray = this.data.modelArray;
    if (sortWayIndex == 0) {
      if (cur == 1) {
        modelArray.sort(function(a, b) {
          return a.id < b.id ? -1 : 1
        });
      } else {
        modelArray.sort(function(a, b) {
          return a.id < b.id ? 1 : -1
        });
      }
    } else if (sortWayIndex == 1) {
      if (cur == 1) {
        modelArray.sort(function(a, b) {
          if (a.rarity == b.rarity) return a.id < b.id ? -1 : 1;
          return a.rarity < b.rarity ? -1 : 1
        });
      } else {
        modelArray.sort(function(a, b) {
          if (a.rarity == b.rarity) return a.id < b.id ? -1 : 1;;
          return a.rarity < b.rarity ? 1 : -1
        });
      }
    }
    this.setData({
      modelArray: modelArray,
      sortCur: cur
    });
  },
  showServantDetail: function(e) {
    var servantId = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: "../servant/servant_detail?id=" + servantId
    });
  },
  enableAutoSync: function(){
    var that = this;
    wx.showModal({
      title: '启用自动同步',
      content: '启用从者初始技能等级自动同步后，从者页面修改的技能等级将自动更新到规划页面。',
      success: function (res) {
        if (res.confirm) {
          that.setData({
            autoSync: "1"
          })
          that.initServantSkill();
        }
      }
    });
  },
  disableAutoSync: function () {
    var that = this;
    wx.showModal({
      title: '关闭自动同步',
      content: '关闭从者技能等级自动同步后，从者页面修改的技能等级将不会自动更新到规划页面，可用于规划重复从者。',
      success: function (res) {
        if (res.confirm) {
          that.setData({
            autoSync: "0"
          })
        }
      }
    });
  },
  showBatchOper: function(){
    this.setData({
      batchOperModel: "1"
    })
  },
  cancelBatchOper: function () {
    this.setData({
      batchOperModel: "0"
    })
  },
  chooseRankChange: function(e){
    var index = e.currentTarget.dataset.index;
    var chooseRank = this.data.chooseRank;
    chooseRank[index + ''] = chooseRank[index + ''] == "1"?"0":"1";    
    var servantList = this.data.servantList;
    servantList.forEach(function(servant){
      if(index == 0){
        servant.selected = chooseRank["0"] == "1"?"1":"0";
      } else if (index == 5 && servant.rarity == '5'){
        servant.selected = chooseRank["5"] == "1" ? "1" : "0";
      } else if (index == 4 && servant.rarity == '4') {
        servant.selected = chooseRank["4"] == "1" ? "1" : "0";
      } else if (index == 9 && servant.rarity != '4' && servant.rarity != '5') {
        servant.selected = chooseRank["9"] == "1" ? "1" : "0";
      }
    })
    this.setData({
      chooseRank: chooseRank,
      servantList: servantList
    })
  },
  batchRankChange: function (e) {
    var index = e.currentTarget.dataset.index;
    var servantList = this.data.servantList;
    servantList.forEach(function (servant) {
      if (servant.selected == "1") {
        servant.tarRank = index;
      }
    })
    this.setData({
      selectedRank: index+'',
      servantList: servantList
    })
  },
  batchSkillChange: function (e) {
    var index = e.currentTarget.dataset.index;
    var servantList = this.data.servantList;
    servantList.forEach(function (servant) {
      if (servant.selected == "1") {
        servant.tarSkill = [index,index,index];
      }
    })
    this.setData({
      selectedSkill: index + '',
      servantList: servantList
    })
  }
})