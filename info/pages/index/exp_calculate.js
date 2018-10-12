// pages/index/bar.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    map: {},
    qpRankMap: {},
    qpCupMap: {},
    exp: [100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000, 21000, 23100, 25300, 27600, 30000, 32500, 35100, 37800, 40600, 43500, 46500, 49600, 52800, 56100, 59500, 63000, 66600, 70300, 74100, 78000, 82000, 86100, 90300, 94600, 99000, 103500, 108100, 112800, 117600, 122500, 127500, 132600, 137800, 143100, 148500, 154000, 159600, 165300, 171100, 177000, 183000, 189100, 195300, 201600, 208000, 214500, 221100, 227800, 234600, 241500, 248500, 255600, 262800, 270100, 277500, 285000, 292600, 300300, 308100, 316000, 324000, 332100, 340300, 348600, 357000, 365500, 374100, 382800, 391600, 400500, 418500, 454900, 510100, 584500, 678500, 792500, 926900, 1082100, 1258500, 1456500],
    star: 5,
    lvMin: 1,
    lvMax: 90,
    reqInfo: [],
    reqInfoSame: [],
    showDialog: false,
    lastTap: 0,
    model: 0,
    total:{},
    req:[],
    isSame:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var map = {};
    map["1"] = [20, 30, 40, 50, 60, 70, 75, 80, 85, 90, 92, 94, 96, 98, 100];
    map["2"] = [25, 35, 45, 55, 65, 70, 75, 80, 85, 90, 92, 94, 96, 98, 100];
    map["3"] = [30, 40, 50, 60, 70, 75, 80, 85, 90, 92, 94, 96, 98, 100];
    map["4"] = [40, 50, 60, 70, 80, 85, 90, 92, 94, 96, 98, 100];
    map["5"] = [50, 60, 70, 80, 90, 92, 94, 96, 98, 100];

    var qpRankMap = {};
    qpRankMap["1"] = [10000, 30000, 90000, 300000];
    qpRankMap["2"] = [15000, 45000, 150000, 450000];
    qpRankMap["3"] = [30000, 100000, 300000, 900000];
    qpRankMap["4"] = [50000, 150000, 500000, 1500000];
    qpRankMap["5"] = [100000, 300000, 1000000, 3000000];

    var qpCupMap = {};
    qpCupMap["1"] = [0, 0, 0, 0, 400000, 600000, 800000, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000];
    qpCupMap["2"] = [0, 0, 0, 0, 600000, 800000, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000];
    qpCupMap["3"] = [0, 0, 0, 0, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000];
    qpCupMap["4"] = [0, 0, 0, 0, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000];
    qpCupMap["5"] = [0, 0, 0, 0, 9000000, 10000000, 11000000, 12000000, 13000000];

    var that = this;
    this.setData({
      map: map,
      qpCupMap: qpCupMap,
      qpRankMap: qpRankMap,
      model: wx.getStorageSync("model")
    })
  },
  lvChange: function(e) {
    var index = e.currentTarget.dataset.index;
    var lvMin = this.data.lvMin;
    var lvMax = this.data.lvMax;
    var lastTap = this.data.lastTap;
    if (lastTap == 0) {
      if (index < lvMin) {
        lvMin = index;
      }else if (index > lvMax) {
        lvMax = index;
      }else{
        lvMin = index;
      }
    } else {
      lvMin = index < lastTap ? index : lastTap;
      lvMax = index < lastTap ? lastTap : index;
    }
    this.setData({
      lvMin: lvMin,
      lvMax: lvMax,
      lastTap: index
    })
  },
  calculateExp: function() {
    var star = this.data.star;
    var lvMin = this.data.lvMin;
    var lvMax = this.data.lvMax;
    var lvs = this.splitLv(star, lvMin, lvMax);
    var lvArray = [];
    var lvSameArray = [];
    var that = this;
    lvs.forEach(function(lv) {
      lvArray.push(that.calculateLvExp(star, lv, 9000));
      lvSameArray.push(that.calculateLvExp(star, lv, 10800));
    })
    this.setData({
      reqInfo: lvArray,
      reqInfoSame: lvSameArray
    }, function(){
      that.sumTotal();
    })
  },

  sumTotal: function(){
    var total = {CUP:0,QP:0,goldCount:0,silCount:0};
    var isSame = this.data.isSame;
    var data = this.data.reqInfo;
    if(isSame == 1){
      data = this.data.reqInfoSame;
    }
    for(var i = 0; i< data.length; i++){
      total.CUP += data[i].CUP;
      total.goldCount += data[i].goldCount;
      total.silCount += data[i].silCount;
      total.QP += (data[i].RANKQP + data[i].qp);
    }
    total.QP = parseInt(total.QP/10000);
    this.setData({
      total: total,
      req:data
    })
  },

  splitLv: function(star, lvMin, lvMax) {
    var lvs = this.data.map[star + ''];
    var splitLv = [];
    for (var i = 0; i < lvs.length; i++) {
      if (lvs[i] > lvMin && lvs[i] < lvMax) {
        splitLv.push([lvMin, lvs[i]]);
        lvMin = lvs[i];
      } else if (lvs[i] >= lvMax) {
        splitLv.push([lvMin, lvMax]);
        break;
      }
    }
    return splitLv;
  },

  calculateLvExp: function(star, lv, exps) {
    var obj = {};
    //是否需要cup
    obj.lv = lv;
    obj.CUP = 0;
    obj.RANKQP = 0;
    var lvs = this.data.map[star + ''];
    var qps = this.data.qpCupMap[star + ''];
    var rankQps = this.data.qpRankMap[star + ''];
    for (var i = 0; i < lvs.length; i++) {
      if (lv[0] == lvs[i]) {
        obj.CUP = qps[i] == 0 ? 0 : 1;
        obj.RANKQP = qps[i] == 0 ? rankQps[i] : qps[i];
      }
    }
    //计算需求数量
    var expTotal = 0;
    var exp = this.data.exp;
    for (var i = lv[0]; i < lv[1]; i++) {
      expTotal += exp[i-1];
    }
    var count = Math.ceil(expTotal / exps);
    var goldCount = parseInt(count / 3);
    var silCount = count % 3;
    var cardArr = [];
    for (var i = 0; i < goldCount; i++) {
      cardArr.push(exps * 3);
    }
    for (var i = 0; i < silCount; i++) {
      cardArr.push(exps);
    }
    obj.goldCount = goldCount;
    obj.silCount = silCount;
    var qp = 0;
    var curLv = lv[0];
    var curExp = 0;
    while (cardArr.length > 0) {
      var thisCount = cardArr.length > 20 ? 20 : cardArr.length;
      qp += thisCount * (this.getQp(star, curLv));
      for (var i = 0; i < thisCount; i++) {
        curExp += cardArr[i];
      }
      curLv = this.getResultLv(lv[0], curExp);
      cardArr.splice(0, thisCount);
    }
    obj.qp = qp;
    return obj;
  },

  getQp: function(star, curLv) {
    if (star == '1') {
      return 100 + (curLv - 1) * 30;
    } else if (star == '2') {
      return 150 + (curLv - 1) * 45;
    } else if (star == '3') {
      return 200 + (curLv - 1) * 60;
    } else if (star == '4') {
      return 400 + (curLv - 1) * 120;
    } else if (star == '5') {
      return 600 + (curLv - 1) * 180;
    }
  },

  getResultLv: function(lv, exp) {
    var exp = this.data.exp;
    while (exp > (lv + 1) * lv / 2) {
      exp -= exp[lv-1];
      lv++;
    }
    return lv;
  },

  starChange: function(e) {
    this.setData({
      star: e.detail.value
    })
  },

  isSameChange: function(e) {
    var that = this;
    this.setData({
      isSame: e.detail.value
    }, function(){
      that.sumTotal();
    })
  },

  toggleDialog: function() {
    this.setData({
      showDialog: !this.data.showDialog
    });
  },
})