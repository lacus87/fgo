// pages/setting/setting_damage_calculate.js
var app = getApp();
var curAccId = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    progress: 1,
    progressList: [],
    // progressNameList: [],
    selectProgressIndex: 0,
    // selectProgressId: 0,
    servantList: [],
    skillList: {},
    settings: [],
    skillModel: 1,
    model: wx.getStorageSync("model"),
    overCharge: 1,
    treaLv: { "5": 1, "4": 2 },
    selectBuff: 0,
    atk: 786,
    buff:
    [
      { id: 0, name: "无拐", select: 0, "11": 0, "21": 0, "31": 0, "41": 0, "61": 0, desc: "无BUFF" },
      { id: 1, name: "单明", select: 0, "11": 30, "21": 0, "31": 0, "41": 0, "61": 0, desc: "攻击提升30%" },
      { id: 2, name: "单梅", select: 0, "11": 20, "21": 50, "31": 0, "41": 0, "61": 0, desc: "攻击提升20% Buster提升50%" },
      { id: 3, name: "双明", select: 0, "11": 60, "21": 0, "31": 0, "41": 0, "61": 0, desc: "攻击提升60%" },
      { id: 4, name: "双梅", select: 0, "11": 40, "21": 100, "31": 0, "41": 0, "61": 0, desc: "攻击提升40% Buster提升100%" },
      { id: 5, name: "明梅", select: 0, "11": 50, "21": 50, "31": 0, "41": 0, "61": 0, desc: "攻击提升50% Buster提升50%" },
      { id: 6, name: "单狐", select: 0, "11": 0, "21": 0, "31": 50, "41": 0, "61": 0, desc: "Atrs提升50%" },
      { id: 7, name: "明狐", select: 0, "11": 30, "21": 0, "31": 50, "41": 0, "61": 0, desc: "攻击提升30% Atrs提升50%" },
      { id: 8, name: "双狐", select: 0, "11": 0, "21": 0, "31": 100, "41": 0, "61": 0, desc: "Atrs提升100%" },
        { id: 9, name: "单CBA", select: 0, "11": 30, "21": 0, "31": 0, "41": 50, "61": 0, desc: "Quick提升50% 防御下降30%" },
        { id: 10, name: "双CBA", select: 0, "11": 60, "21": 0, "31": 0, "41": 100, "61": 0, desc: "Quick提升100% 防御下降60%" },
        { id: 11, name: "明+CBA", select: 0, "11": 60, "21": 0, "31": 0, "41": 50, "61": 0, desc: "Quick提升50% 防御下降30% 攻击提升30%" },
        { id: 12, name: "梅+CBA", select: 0, "11": 50, "21": 50, "31": 0, "41": 50, "61": 0, desc: "Q/B提升50% 防御下降30% 攻击提升20%" },
      { id: 13, name: "输入", select: 0, "11": 0, "21": 0, "31": 0, "41": 0, "61": 0, desc: "" }
    ],
    selectCard: 0,
    card: [
      { id: 0, name: "NP类", "11": 0, "21": 0, "31": 0, "41": 0, "61": 0, desc: "" },
      { id: 1, name: "黑杯", "11": 0, "21": 0, "31": 0, "41": 0, "61": 60, desc: "宝具提升60%" },
      { id: 2, name: "满破黑杯", "11": 0, "21": 0, "31": 0, "41": 0, "61": 80, desc: "宝具提升80%" },
      { id: 3, name: "满破黑贞", "11": 0, "21": 0, "31": 0, "41": 0, "61": 15, desc: "宝具提升15%" },
      { id: 4, name: "满破相扑", "11": 15, "21": 0, "31": 0, "41": 0, "61": 0, desc: "攻击提升15%" },
      { id: 5, name: "满破小伊利", "11": 0, "21": 15, "31": 0, "41": 0, "61": 25, desc: "Buster提升15% 宝具提升25%" },
      { id: 6, name: "其他", "11": 0, "21": 0, "31": 0, "41": 0, "61": 0, desc: "" },
    ],
    selectCloth: 5,
    cloth: [
      { id: 0, name: "初始", "11": 50, "21": 0, "31": 0, "41": 0, "61": 0, desc: "攻击提升50%" },
      { id: 1, name: "换人", "11": 30, "21": 0, "31": 0, "41": 0, "61": 0, desc: "攻击提升30%" },
      { id: 2, name: "红魔放", "11": 0, "21": 60, "31": 0, "41": 0, "61": 0, desc: "Buster提升60%" },
      { id: 3, name: "蓝魔放", "11": 0, "21": 0, "31": 50, "41": 0, "61": 0, desc: "Arts提升50%" },
      { id: 4, name: "绿魔放", "11": 0, "21": 0, "31": 0, "41": 50, "61": 0, desc: "Quick提升50%" },
      { id: 5, name: "无", "11": 0, "21": 0, "31": 0, "41": 0, "61": 0, desc: "" }
    ],
    array: ["攻击提升", "宝具提升", "Buster提升", "Atrs提升", "Qucik提升"],
    arrayId: ["11", "61", "21", "31", "41"],
    arrIndex: 0,
    multiArray: [['SABER', 'ARCHER', 'LANCER', 'RIDER', 'CASTER', 'ASSASSIN', 'BERSERKER', 'SHIELDER', 'RULER', 'AVENGER', 'ALTEREGO', 'MOONCANCER', 'FOREIGNER', "BEASTI"], [], []],
    targetList: [],
    multiIndex: [0, 0, 0],
    chooseIndex: [0, 0, 0],
    desc: "",
    chooseImg: "",
    multiArray2: [['SABER', 'ARCHER', 'LANCER', 'RIDER', 'CASTER', 'ASSASSIN', 'BERSERKER', 'SHIELDER', 'RULER', 'AVENGER', 'ALTEREGO', 'MOONCANCER', 'FOREIGNER'], []],
    multiIndex2: [0, 0],
    chooseIndex2: [0, 0],
    desc2: "点击选择英灵",
    chooseImg2: "",
    servantSkill2: [10, 10, 10],
    damageData: [],
    limitTreaLv: 1,
    limitServantLv:0,
    sort: 1,
    showOwn: 0,
    showData: [],
    skillFlag: 1,
    servantLimit: 0,
    choosedesc: "点击选择英灵",
    showServantId:0,
    maxShow: 20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var account = wx.getStorageSync('account');
    for (var i = 0; i < account.length; i++) {
      if (account[i].status == 1) {
        curAccId = account[i].id;
      }
    }
    var data = wx.getStorageSync("calculateData");
    if (data != undefined && data != "") {
      var buff = this.data.buff;
      var card = this.data.card;
      var selectProgressIndex = data.selectProgressIndex;
      var progress = data.progress;
      if (selectProgressIndex == undefined || selectProgressIndex == '') {
        selectProgressIndex = 0;
      }
      if (progress == undefined || progress == '') {
        progress = 1;
      }
      buff[buff.length - 1].select = data.buff[data.buff.length - 1].select;
      this.setData({
        progress: progress,
        selectProgressIndex: selectProgressIndex,
        skillModel: data.skillModel,
        overCharge: data.overCharge,
        treaLv: { "5": data.treaLv['5'], "4": data.treaLv['4'] },
        selectBuff: data.selectBuff,
        atk: data.atk,
        buff: buff,
        selectCard: data.selectCard,
        card: card,
        selectCloth: data.selectCloth,
        arrIndex: data.arrIndex,
        multiIndex: data.multiIndex,
        chooseIndex: data.chooseIndex,
        desc: data.desc,
        chooseImg: data.chooseImg
      })
    }
    var array = this.data.settings;
    var servantList = wx.getStorageSync('srv_list' + "_" + curAccId);
    var skillList = wx.getStorageSync('srvSkill' + "_" + curAccId);
    if (servantList == undefined || servantList == "") {
      servantList = [];
    }
    if (skillList == undefined || skillList == "") {
      skillList = {};
    }
    if (array.length == 0) {
      array.push({ "id": 1, name: "敌对目标", show: 0 });
      array.push({ "id": 6, name: "游戏进度", show: 0 });
      array.push({ "id": 2, name: "伤害BUFF", show: 0 });
      array.push({ "id": 3, name: "礼装|服装", show: 0 });
      array.push({ "id": 4, name: "宝具等级", show: 0 });
      array.push({ "id": 5, name: "英灵技能", show: 0 });
    }
    this.setData({
      settings: array,
      servantList: servantList,
      skillList: skillList,
      model: app.globalData.model
    })
    wx.request({
      url: app.globalData.url + "/damageCalculate/getTargetList.do",
      method: "GET",
      success: function (res) {
        that.setData({
          targetList: res.data.data
        })
        that.initMultiPicker();
      }
    })
    wx.request({
      url: app.globalData.url + "/damageCalculate/getProgressList.do",
      method: "GET",
      success: function (res) {
        that.initProgressPicker(res.data.data);
      }
    })
  },

  initProgressPicker: function (data) {
    // var progressNameList = [];
    // for(var i=0; i< data.length; i++){
    //   progressNameList.push(data[i].eventName);
    // }
    this.setData({
      progressList: data,
      // progressNameList: progressNameList,
      // selectProgressId: data[this.data.selectProgressIndex].eventId
    })
  },

  initMultiPicker: function () {
    var targetList = this.data.targetList;
    var multiArray = this.data.multiArray;
    var multiIndex = this.data.chooseIndex;
    if (multiArray[1].length == 0) {
      var typeArr = [];
      for (var i = 0; i < targetList.length; i++) {
        var flag = 0;
        for (var j = 0; j < typeArr.length; j++) {
          if (targetList[i].targetType == typeArr[j]) {
            flag = 1;
            break;
          }
        }
        if (flag == 0) {
          typeArr.push(targetList[i].targetType);
        }
      }
      multiArray[1] = typeArr;
    }
    if (multiArray[2].length == 0) {
      var targetArr = [];
      var clazz = multiArray[0][multiIndex[0]];
      var targetType = multiArray[1][multiIndex[1]];
      for (var i = 0; i < targetList.length; i++) {
        if ((targetList[i].clazz == clazz || targetList[i].clazz == '')
          && targetType == targetList[i].targetType) {
          targetArr.push(targetList[i].targetName);
        }
      }
      multiArray[2] = targetArr;
    }
    if (this.data.multiArray[2].length == 0) {
      this.setData({
        multiArray: multiArray,
        desc: "无效目标",
        chooseImg: ""
      })
      return;
    }
    var desc = multiArray[0][this.data.chooseIndex[0]] + " " + multiArray[2][this.data.chooseIndex[2]];
    var targetList = this.data.targetList;
    var chooseImg = this.data.chooseImg;
    for (var i = 0; i < targetList.length; i++) {
      if (targetList[i].targetType == '英灵') {
        if (targetList[i].clazz == this.data.multiArray[0][this.data.chooseIndex[0]]
          && targetList[i].targetType == this.data.multiArray[1][this.data.chooseIndex[1]]
          && targetList[i].targetName == this.data.multiArray[2][this.data.chooseIndex[2]]) {
          chooseImg = targetList[i].imgPath;
          break;
        }
      } else if (targetList[i].targetType == this.data.multiArray[1][this.data.chooseIndex[1]]
        && targetList[i].targetName == this.data.multiArray[2][this.data.chooseIndex[2]]) {
        chooseImg = targetList[i].imgPath;
        break;
      }
    }
    this.setData({
      multiArray: multiArray,
      desc: desc,
      chooseImg: chooseImg
    })
  },

  bindProgressPickerChange: function (e) {
    this.setData({
      selectProgressIndex: e.detail.value
    })
  },

  bindMultiPickerChange: function (e) {
    if (this.data.multiArray[2].length == 0) {
      this.setData({
        desc: "无效目标",
        chooseImg: ""
      })
      return;
    }
    var desc = this.data.multiArray[0][e.detail.value[0]] + " " + this.data.multiArray[2][e.detail.value[2]];
    var targetList = this.data.targetList;
    var chooseImg = this.data.chooseImg;
    for (var i = 0; i < targetList.length; i++) {
      if (targetList[i].targetType == '英灵') {
        if (targetList[i].clazz == this.data.multiArray[0][e.detail.value[0]]
          && targetList[i].targetType == this.data.multiArray[1][e.detail.value[1]]
          && targetList[i].targetName == this.data.multiArray[2][e.detail.value[2]]) {
          chooseImg = targetList[i].imgPath;
          break;
        }
      } else if (targetList[i].targetType == this.data.multiArray[1][e.detail.value[1]]
        && targetList[i].targetName == this.data.multiArray[2][e.detail.value[2]]) {
        chooseImg = targetList[i].imgPath;
        break;
      }
    }
    this.setData({
      chooseIndex: e.detail.value,
      desc: desc,
      chooseImg: chooseImg
    })
  },
  bindcancel: function () {

  },
  bindMultiPickerColumnChange: function (e) {
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    if (e.detail.column == 2) return;
    var targetList = this.data.targetList;
    var targetArr = [];
    var clazz = data.multiArray[0][data.multiIndex[0]];
    var targetType = data.multiArray[1][data.multiIndex[1]];
    for (var i = 0; i < targetList.length; i++) {
      if ((targetList[i].clazz == clazz || targetList[i].clazz == '')
        && targetType == targetList[i].targetType) {
        targetArr.push(targetList[i].targetName);
      }
    }
    data.multiArray[2] = targetArr;
    data.multiIndex[2] = 0;
    this.setData({
      multiArray: data.multiArray,
      multiIndex: data.multiIndex
    });
  },

  bindMultiPickerChange2: function (e) {
    if (this.data.multiArray2[1].length == 0) {
      this.setData({
        desc2: "无效目标",
        chooseImg2: ""
      })
      return;
    }
    var desc = this.data.multiArray2[0][e.detail.value[0]] + " " + this.data.multiArray2[1][e.detail.value[1]];
    var targetList = this.data.targetList;
    var chooseImg = this.data.chooseImg2;
    var servantId = 0;
    for (var i = 0; i < targetList.length; i++) {
      if (targetList[i].targetType == '英灵') {
        if (targetList[i].clazz == this.data.multiArray2[0][e.detail.value[0]]
          && targetList[i].targetName == this.data.multiArray2[1][e.detail.value[1]]) {
          servantId = targetList[i].id;
          chooseImg = targetList[i].imgPath;
          break;
        }
      }
    }
    var servantSkill = [10, 10, 10];
    var servantList = this.data.servantList;
    var skillList = this.data.skillList;
    for (var i = 0; i < servantList.length; i++) {
      if (servantId == servantList[i]) {
        var id = servantList[i] + "";
        if (skillList[id] == undefined) {
          skillList[id] = [0, 1, 1, 1];
        }
        servantSkill[0] = skillList[id][1];
        servantSkill[1] = skillList[id][2];
        servantSkill[2] = skillList[id][3];
      }
    }
    this.setData({
      chooseIndex2: e.detail.value,
      desc2: desc,
      chooseImg2: chooseImg,
      servantSkill2: servantSkill
    })
  },

  bindMultiPickerColumnChange2: function (e) {
    if (e.detail.column == 1) return;
    var data = {
      multiArray: this.data.multiArray2,
      multiIndex: this.data.multiIndex2
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    var targetList = this.data.targetList;
    var targetArr = [];
    var clazz = data.multiArray[0][data.multiIndex[0]];
    var targetType = data.multiArray[1][data.multiIndex[1]];
    for (var i = 0; i < targetList.length; i++) {
      if (targetList[i].clazz == clazz && '英灵' == targetList[i].targetType) {
        targetArr.push(targetList[i].targetName);
      }
    }
    data.multiArray[1] = targetArr;
    data.multiIndex[1] = 0;
    this.setData({
      multiArray2: data.multiArray,
      multiIndex2: data.multiIndex
    });
  },

  onHide: function () {
    var data = {
      skillModel: this.data.skillModel,
      overCharge: this.data.overCharge,
      treaLv: this.data.treaLv,
      selectBuff: this.data.selectBuff,
      atk: this.data.atk,
      buff: this.data.buff,
      selectCard: this.data.selectCard,
      card: this.data.card,
      selectCloth: this.data.selectCloth,
      arrIndex: this.data.arrIndex,
      multiIndex: this.data.multiIndex,
      chooseIndex: this.data.chooseIndex,
      desc: this.data.desc,
      chooseImg: this.data.chooseImg,
      selectProgressIndex: this.data.selectProgressIndex,
      progress: this.data.progress
    }
    wx.setStorageSync("calculateData", data);
  },

  onUnload: function () {
    this.onHide();
  },

  showDetail: function (e) {
    var id = e.currentTarget.dataset.index;
    var eventList = this.data.settings;
    for (var i = 0; i < eventList.length; i++) {
      if (eventList[i].id == id) {
        eventList[i].show = eventList[i].show == 0 ? 1 : 0;
      } else {
        eventList[i].show = 0;
      }
    }
    this.setData({
      settings: eventList
    });
  },

  overChargeChange: function (e) {
    this.setData({
      overCharge: e.detail.value
    })
  },

  progressChange: function (e) {
    // var value = e.detail.value;
    // var setting = this.data.settings;
    // for (var i = 0; i < setting.length; i++) {
    //   if (setting[i].name == '游戏进度') {
    //     setting[i].show = value == '999' ? 1 : 0;
    //   }
    // }
    this.setData({
      // settings: setting,
      progress: e.detail.value
    })
  },

  buffChange: function (e) {
    this.setData({
      selectBuff: e.detail.value
    })
  },

  cardChange: function (e) {
    this.setData({
      selectCard: e.detail.value
    })
  },

  clothChange: function (e) {
    this.setData({
      selectCloth: e.detail.value
    })
  },

  skillModelChange: function (e) {
    this.setData({
      skillModel: e.detail.value
    })
  },

  treaLvChange5: function (e) {
    var treaLv = this.data.treaLv;
    treaLv["5"] = e.detail.value;
    this.setData({
      treaLv: treaLv
    })
  },

  treaLvChange4: function (e) {
    var treaLv = this.data.treaLv;
    treaLv["4"] = e.detail.value;
    this.setData({
      treaLv: treaLv
    })
  },

  inputChange: function (e) {
    var id = e.currentTarget.dataset.id + "";
    var count = e.detail.value;
    count = parseInt(count);
    if (isNaN(count)) {
      count = 0;
    }
    if (count > 999) {
      count = 999;
    }
    if (count < 0) {
      count = 0;
    }
    var buff = this.data.buff;
    buff[buff.length - 1][id] = count;
    this.getDesc(buff[buff.length - 1]);
    this.setData({
      buff: buff
    })
  },
  getDesc: function (buffDetail) {
    buffDetail.desc = "";
    var atk = buffDetail["11"];
    if (atk > 0) {
      buffDetail.desc += "攻击提升" + atk + "% "
    }
    atk = buffDetail["61"];
    if (atk > 0) {
      buffDetail.desc += "宝具提升" + atk + "% "
    }
    atk = buffDetail["21"];
    if (atk > 0) {
      buffDetail.desc += "Buster提升" + atk + "% "
    }
    atk = buffDetail["31"];
    if (atk > 0) {
      buffDetail.desc += "Atrs提升" + atk + "% "
    }
    atk = buffDetail["41"];
    if (atk > 0) {
      buffDetail.desc += "Quick提升" + atk + "% "
    }

  },

  bindPickerChange: function (e) {
    var index = e.detail.value;
    var card = this.data.card;
    var curIndex = this.data.arrIndex;
    var arrayId = this.data.arrayId;
    var percent = card[card.length - 1][arrayId[curIndex]];
    for (var i = 0; i < arrayId.length; i++) {
      card[card.length - 1][arrayId[i]] = 0;
    }
    card[card.length - 1][arrayId[index]] = percent;
    this.getDesc(card[card.length - 1]);
    this.setData({
      arrIndex: index,
      card: card
    })
  },

  cardBuffChange: function (e) {
    var id = e.currentTarget.dataset.id + "";
    var count = e.detail.value;
    count = parseInt(count);
    if (isNaN(count)) {
      count = 0;
    }
    if (count < 0) {
      count = 0;
    }
    var card = this.data.card;
    var index = this.data.arrIndex;
    var arrayId = this.data.arrayId;
    for (var i = 0; i < arrayId.length; i++) {
      card[card.length - 1][arrayId[i]] = 0;
    }
    card[card.length - 1][id] = count;
    this.getDesc(card[card.length - 1]);
    this.setData({
      card: card
    })
  },

  atkChange: function (e) {
    var count = e.detail.value;
    count = parseInt(count);
    if (isNaN(count)) {
      count = 0;
    }
    if (count > 2400) {
      count = 2400;
    }
    if (count < 0) {
      count = 0;
    }
    this.setData({
      atk: count
    })
  },

  calculateDamage: function () {
    var that = this;
    var param = {};
    param.progress = this.data.progress;
    if (param.progress == '999') {
      param.progress = this.data.progressList[this.data.selectProgressIndex].eventId
    }
    param.oc = this.data.overCharge;
    param.skillFlag = this.data.skillFlag;
    param.servantId = 0;
    param.treaLvPrefer = { "5": this.data.treaLv['5'], "4": this.data.treaLv['4'] };
    var skillInfo = [];
    if (this.data.servantLimit == 1) {
      var servantSkill2 = this.data.servantSkill2;
      var servant = {};
      servant.servantId = this.getServantId(this.data.multiArray2[0][this.data.chooseIndex2[0]], this.data.multiArray2[1][this.data.chooseIndex2[1]]);
      param.servantId = servant.servantId;
      servant.skill1 = servantSkill2[0];
      servant.skill2 = servantSkill2[1];
      servant.skill3 = servantSkill2[2];
      skillInfo.push(servant);
      param.treaLvPrefer[servant.servantId + ""] = this.data.limitTreaLv;
    } else if (this.data.skillModel == 2) {
      var servantList = this.data.servantList;
      var skillList = this.data.skillList;
      for (var i = 0; i < servantList.length; i++) {
        var servant = new Object;
        servant.servantId = servantList[i];
        var id = servantList[i] + "";
        if (skillList[id] == undefined) {
          skillList[id] = [0, 1, 1, 1];
        }
        servant.rank = skillList[id][0];
        servant.skill1 = skillList[id][1];
        servant.skill2 = skillList[id][2];
        servant.skill3 = skillList[id][3];
        skillInfo.push(servant);
      }
    }
    param.servantLv = this.data.limitServantLv;
    param.param = skillInfo;
    param.addParam = this.buffToString(this.data.buff[this.data.selectBuff]) + "|"
      + this.buffToString(this.data.card[this.data.selectCard]) + "|"
      + this.buffToString(this.data.cloth[this.data.selectCloth]) + "|"
      + "10:" + this.data.atk;
    if (param.progress == '1050') {
      //魔神柱特殊buff
      param.addParam = param.addParam + "|51:100%";
    }
    var targetList = this.data.targetList;
    for (var i = 0; i < targetList.length; i++) {
      if (targetList[i].targetType == '英灵') {
        if (targetList[i].clazz == this.data.multiArray[0][this.data.chooseIndex[0]]
          && targetList[i].targetType == this.data.multiArray[1][this.data.chooseIndex[1]]
          && targetList[i].targetName == this.data.multiArray[2][this.data.chooseIndex[2]]) {
          param.target = targetList[i];
          break;
        }
      } else if (targetList[i].targetType == this.data.multiArray[1][this.data.chooseIndex[1]]
        && targetList[i].targetName == this.data.multiArray[2][this.data.chooseIndex[2]]) {
        param.target = {
          clazz: this.data.multiArray[0][this.data.chooseIndex[0]],
          spec: targetList[i].spec,
          camp: targetList[i].camp,
          targetType: targetList[i].targetType,
          targetName: targetList[i].targetName
        }
        break;
      }
    }

    wx.showLoading({
      title: '计算中...',
      mask: true
    })
    wx.request({
      url: app.globalData.url + "/damageCalculate/calculate.do",
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      data: param,
      success: function (res) {
        wx.hideLoading();
        var array = that.data.settings;
        for (var i = 0; i < array.length && that.data.servantLimit == 0; i++) {
          array[i].show = 0;
        }
        var damageData = res.data.data;
        if (damageData.length == 0) {
          wx.showToast({
            title: '无有效伤害',
            icon: 'success',
            image: '/images/warning.png',
            duration: 1000
          });
          return;
        }
        damageData.sort(function (a, b) {
          return a.damage < b.damage ? 1 : -1;
        })
        for (var i = 0; i < damageData.length; i++) {
          damageData[i].attackBuff = Math.round(damageData[i].attackBuff * 100);
          damageData[i].treasurePercent = Math.round(damageData[i].treasurePercent * 100);
          damageData[i].treasureBuff = Math.round(damageData[i].treasureBuff * 100);
          damageData[i].cardBuff = Math.round(damageData[i].cardBuff * 100);
          damageData[i].spAttackBuff = Math.round(damageData[i].spAttackBuff * 100);
          damageData[i].treasureSpAtkBuff = Math.round(damageData[i].treasureSpAtkBuff * 100);
          damageData[i].damageRange = Math.round(damageData[i].damage * 0.9) + "~" + Math.round(damageData[i].damage * 1.1);
        }
        that.setData({
          maxShow:20,
          damageData: damageData,
          settings: array
        })
        that.initShowData();
      }
    })
  },

  initShowData: function () {
    var damageData = this.data.damageData;
    var showOwn = this.data.showOwn;
    var sortType = this.data.sort;
    var servantList = this.data.servantList;
    var maxShow = this.data.maxShow;
    var showData = [];
    for (var i = 0; i < damageData.length && showData.length < maxShow; i++) {
      if (showOwn == 1) {
        var showFlag = false;
        for (var j = 0; j < servantList.length; j++) {
          if ((damageData[i].servantId + "") == (servantList[j] + "")) {
            showFlag = true;
            break;
          }
        }
        if (!showFlag) continue;
      }
      if ((sortType == 1 || sortType == 2) && damageData[i].damageType == sortType) {
        showData.push(damageData[i]);
      } else if (sortType == 3) {
        showData.push(damageData[i]);
      }
    }
    this.setData({
      showData: showData
    })
  },

  buffToString: function (buff) {
    return "11:" + buff["11"] + "%|" + "21:" + buff["21"] + "%|" + "31:" + buff["31"]
      + "%|" + "41:" + buff["41"] + "%|" + "61:" + buff["61"] + "%";
  },

  checkboxChange: function (e) {
    var showOwn = this.data.showOwn;
    if (showOwn == 1) {
      showOwn = 0;
    } else {
      showOwn = 1;
    }
    this.setData({
      showOwn: showOwn
    })
    this.initShowData();
  },

  skillFlagChange: function (e) {
    var skillFlag = this.data.skillFlag;
    if (skillFlag == 1) {
      skillFlag = 0;
    } else {
      skillFlag = 1;
    }
    this.setData({
      skillFlag: skillFlag
    })
  },

  sortChange: function (e) {
    this.setData({
      sort: e.detail.value
    })
    this.initShowData();
  },

  servantLimitChange: function (e) {
    this.setData({
      servantLimit: e.detail.value
    })
  },

  limitTreaLvChange: function (e) {
    this.setData({
      limitTreaLv: e.detail.value
    })
  },

  limitServantLvChange: function (e) {
    this.setData({
      limitServantLv: e.detail.value
    })
  },

  getServantId: function (clazz, name) {
    var servantId = 0;
    var targetList = this.data.targetList;
    for (var i = 0; i < targetList.length; i++) {
      if (targetList[i].targetType == '英灵'
        && targetList[i].clazz == clazz
        && targetList[i].targetName == name) {
        servantId = targetList[i].id;
        break;
      }
    }
    return servantId;
  },

  inputSkillChange: function (e) {
    var id = e.currentTarget.dataset.id;
    var count = e.detail.value;
    count = parseInt(count);
    if (isNaN(count)) {
      count = 1;
    }
    if (count > 10) {
      count = count % 10;
    }
    if (count < 1) {
      count = 1;
    }
    var skill = this.data.servantSkill2;
    skill[id] = count;
    this.setData({
      servantSkill2: skill
    })
  },

  showDamageDetail: function(e){
    var id = e.currentTarget.dataset.index;
    this.setData({
      showServantId: this.data.showServantId == id ? 0 : id
    })
  },

  showAllDamage: function(e){
    this.setData({
      maxShow:999
    })
    this.initShowData();
  }

})