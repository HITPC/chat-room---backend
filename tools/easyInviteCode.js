class easyIC { // 用于生成简单加密（验证邀请码？好像后端验证好一点？）
  // （目前不做很难的了，仅考虑全为字母无空格以及长度不超过26位的字符串，包括密钥）
  constructor(serect="intial", result){
    // 构造函数只需要一个密钥， 以及未加密之前的明文
    if(typeof serect !== "string"){
      throw new Error("wrong type of serect! Need a String!");
    }else if(!result){
      throw new Error("no result!");
    }else if(!Array.isArray(result)){
      throw new Error("wrong type of result! Need a Array!");
    }
    result.forEach((item)=>{
      if(typeof item !== "string"){
        throw new Error("wrong type in result! Need String!");
      }else if(item.length > 26){
        throw new Error("too long of item in result! max is 26!");
      }
      for(let i = 0; i<item.length; ++i){
        let temp = item.charCodeAt(i);
        if(!((temp >= 65 && temp <= 90) || (temp >=97 && temp <= 122))){
          throw new Error("wrong char in arr! only letter!");
        }
      }
    });
    for(let i = 0; i<serect.length; ++i){
      let temp = serect.charCodeAt(i);
      if(!((temp >= 65 && temp <= 90) || (temp >=97 && temp <= 122))){
        throw new Error("wrong char in arr! only letter!");
      }
    }
    this.serect = serect;
    this.result = result;
    let t = 0;
    for(let i = 0; i<serect.length; ++i){
      t += serect.charCodeAt(i);
    }
    this.serectCount = t;
  }

  getRandom(min, max) {// 得到[min, max]的随机数
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomChar(){// 得到一个随机大小写的随机字母
    let key = this.getRandom(0, 25);
    let part = this.getRandom(0, 1);
    if(part == 1){
      return String.fromCharCode(97 + key);
    }else{
      return String.fromCharCode(65 + key);
    }
  }

  getChar(index, part="big"){// 得到一个自定义的字符
    // if(!index || !part || typeof index !== "number" || index > 26 || index < 0 
    //   || typeof part !== "string"
    // ){
    //   throw new Error("wrong props type or content!");
    // }
    if(part === "big"){
      return String.fromCharCode(65 + index);
    }else{
      return String.fromCharCode(97 + index);
    }
  }

  doEncode(before){
    // 加密思路：第一二位必没用
    let res = "";
    res += this.getRandomChar();
    res += this.getRandomChar();
    // 加密思路：第三，第x位提示加密前明文长度 x由第三位的数字(012，因为最多26位)决定
    let len = before.length;
    if(len < 10){
      res += "a";
    }else if(len < 20){
      res += "b";
      len -= 10;
      res += this.getRandomChar();
    }else{
      res += "c";
      len -= 20;
      res += this.getRandomChar();
      res += this.getRandomChar();
    }
    res += this.getChar(len, "small");
    // 加密思路：后面第x+1开始 才开始存放着原来的字符，之前全是随机字符，这个字符经过了密钥加密
    for(let i = 0; i<=len; ++i){
      res += this.getRandomChar();
    }
    // 加密思路：在原来码的基础上 每隔密钥对应的字符ASCII码的和，这个和是n位数，那就每隔第n个数对应的数放一个原来的数据(第一个原数据的是直接放的)（循环着来）
    let temp = this.serectCount.toString();
    let index = 0, i = 0;
    while(i < before.length){
      res += before.charAt(i);
      let gap = Number.parseInt(temp.charAt(index));
      for(let j = 0; j<gap; ++j){
        res += this.getRandomChar();
      }
      ++index;
      if(index >= temp.length){
        index = 0;
      }
      ++i;
    }

    while(res.length <= 50){
      res += this.getRandomChar();
    }

    return res;
  }

  encodeAll(){// 将result的内容全部加密
    let obj = {};
    this.result.forEach((item)=>{
      if(typeof item !== "string"){
        throw new Error("wrong type of result item! NEED STRING!");
      }
      // 进行加密
      obj[item] = this.doEncode(item);
    });
    return obj;
  }

  encodeSome(toEncodeArr){// 加密其中一个或几个（由输入的下标决定）
    if(!Array.isArray(toEncodeArr)){
      throw new Error("wrong type of prop! Need a Array!");
    }
    toEncodeArr.forEach((item)=>{
      if(typeof item !== "number"){
        throw new Error("wrong type of item! Need a Number!");
      } else if(item >= this.result.length || item < 0){
        throw new Error("item wrong number!");
      }
    });
    let obj = {};
    toEncodeArr.forEach((item)=>{
      obj[this.result[item]] = this.doEncode(this.result[item]);
    });
    return obj;
  }
  

  decode(toDecodeArr) {
    if (!Array.isArray(toDecodeArr)) {
      throw new Error("wrong type of prop! Need a Array!");
    }
    toDecodeArr.forEach((item) => {
      if (typeof item !== "string") {
        throw new Error("wrong type of item! Need a String!");
      }
    });
    let resArr = [];
    let firstPoint;
    let leave;
    let secondPoint;
    let realLeave;
    let realLength;
    let i = 0; // 当前已得到的长度
    let index = 0; // 指针
    let temp = ""; // 暂存字符串
    let serectIndex = 0; // 指向密钥的指针
    let gap;
    let serectCS = this.serectCount.toString();
    toDecodeArr.forEach((item)=>{
      firstPoint = item.charAt(2);
      leave = firstPoint === "a" ? 1 : firstPoint === "b" ? 2 : firstPoint === "c" ? 3 : 0;
      secondPoint = item.charAt(2 + leave);
      // 拿到的第二个是小写字母
      realLeave = secondPoint.charCodeAt() - 'a'.charCodeAt();
      realLength = (leave-1) * 10 + realLeave;
      console.log(realLength);
      index += 2 + leave + 1 + realLeave + 1;// 指针到初始位置上去
      while(i < realLength){
        temp += item.charAt(index);
        ++i;
        gap = Number.parseInt(serectCS.charAt(serectIndex));
        index += gap + 1;
        ++serectIndex;
        if(serectIndex >= serectCS.length){
          serectIndex = 0;
        }
      }
      i = 0;
      index = 0;
      serectIndex = 0;
      resArr.push(temp);
      temp = "";
    });

    
    return resArr;
  }
  
  judge(toDecodeArr){// 判断码到底对不对
    if (!Array.isArray(toDecodeArr)) {
      throw new Error("wrong type of prop! Need a Array!");
    }
    toDecodeArr.forEach((item) => {
      if (typeof item !== "string") {
        throw new Error("wrong type of item! Need a String!");
      }
    });
    let res = this.decode(toDecodeArr);
    let temp = 0;
    res.forEach((item)=>{
      console.log(item);
      if(this.result.includes(item)){
        ++temp;
      }
    });
    if(temp == toDecodeArr.length && toDecodeArr.length != 0){
      return true;
    }else{
      return false;
    }
  }
}

const config = require("../config/inviteCode.config");
module.exports = new easyIC(config.serect, config.list);