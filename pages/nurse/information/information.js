Page({
    data: {
      identitySelected:"",
      scrollHeight: 250,  
      showPopup: false, // 控制弹窗
      showRecruitPage: false, // 控制页面切换，默认显示主页
      showInfoPage: false,
      bloodTypes: ["Rh", "p", "JK"],
      selectedBloodType: "请选择血型",
      conditions: ["标准", "自定义"],
      selectedCondition: "请选择献血条件",
      recruitData: {},
      infoList: [],
      recruitType: 'emergency',
      infoType: 'emergency',
      Token: "",
      activities: [
        { id: 1, title: '稀有血型O型Rh阴性献血', count: 32, isSigned: false,
        imageUrl: 'https://blood-station-1327665268.cos.ap-guangzhou.myqcloud.com/献血活动海报.png' },
        { id: 2, title: 'AB型血献血者紧急招募', count: 18, isSigned: false,
        imageUrl: 'https://blood-station-1327665268.cos.ap-guangzhou.myqcloud.com/献血活动海报2.png' },
        { id: 3, title: 'AB型血献血者紧急招募', count: 25, isSigned: false,
        imageUrl: 'https://blood-station-1327665268.cos.ap-guangzhou.myqcloud.com/献血活动海报2.png' }
      ],
      showDonorInfoPage: false, // 控制献血者信息页面显示
      donorList: [ 
        { id: 1, name: '李想', bloodType: 'Rh阴型', age: '21周岁' },
        { id: 2, name: '陈毅', bloodType: 'Rh阴型', age: '21周岁' }
      ],
      scienceList: [
        {
          question: "我是O型血，我是万能的吗？",
          answer: "O型血是万能献血者，但只能接受O型血。O型血的红细胞没有A、B抗原，但血浆中含有抗A和抗B抗体，因此只能少量输给其他血型。",
          isOpen: false // 控制折叠状态
        },
        {
          question: "稀有血型有哪几种？",
          answer: "主要包括Rh阴性血型（如熊猫血）、孟买型、JK表型等。",
          isOpen: false
        },
        {
          question: "“熊猫血”是什么？“熊猫血”有多珍稀？",
          answer: "Rh阴性血型的俗称，在中国汉族人口中仅占0.3%。",
          subAnswer: "因稀缺性类似熊猫，故得名。需特别注意血源储备。",
          isOpen: false
        }
      ],
      showAnswerPage: false,
      currentQuestion: "",
      currentAnswer: "",
      currentSubAnswer: ""
    },
    // 点击问题触发
    showAnswerDialog(e) {
        const index = e.currentTarget.dataset.index;
        const item = this.data.scienceList[index] || {};
        console.log('点击问题：', item); // 调试输出问题和答案
        this.setData({
          showAnswerPage: true,
          currentQuestion: item.question || "问题加载失败",
          currentAnswer: item.answer || "答案未提供",
          currentSubAnswer: item.subAnswer || ""
        });
      },  
    // 跳转到献血者信息页面
    goToDonorInfoPage() {
      this.setData({
        showRecruitPage: false,
        showDonorInfoPage: true
      });
    },
    
    // 查看详情
    viewDonorDetail(e) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `/pages/donor-detail/donor-detail?id=${id}`
      });
    },
    

    toggleSign(e) {
      const index = e.currentTarget.dataset.index;
      const activities = this.data.activities.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            isSigned: !item.isSigned,
            count: item.count + (item.isSigned ? -1 : 1)
          };
        }
        return item;
      });
      this.setData({ activities });
    },
    onLoad() {
        // 获取本地存储的数据
        wx.getStorage({
          key: 'userIdentity', // 要获取的 key
          success: (res) => {
            this.setData({
              identitySelected: res.data.Identity, // 获取到的数据存入页面的 data 中
              Token: res.data.token 
            });
            console.log(res.data);  
            console.log(this.data.identitySelected);
          },
          fail: () => {
            console.error('获取数据失败');
          }
        });
      }, 
    // **跳转发布页面**
    goToRecruitPage(e) {
      const type = e.currentTarget.dataset.type; // 获取按钮类型（emergency/activity）
      this.setData({
        showRecruitPage: true,
        recruitType: type // 存储发布类型
      });
    },

  
    // **跳转查看页面**
    goToInfoPage(e) {
      const type = e.currentTarget.dataset.type; // 获取按钮类型（emergency/activity）
      this.setData({
        showInfoPage: true,
        infoType: type // 存储发布类型
      });
    },


    // **返回主页面**
    goBack() {
        this.setData({ 
          showRecruitPage: false,
          showDonorInfoPage: false,
          showPopup: false,
          showAnswerPage: false
        });
      }, 
  
    // 打开弹窗
    openPopup() {
      this.setData({ showPopup: true });
    },
  
    // 关闭弹窗
    closePopup() {
      this.setData({ showPopup: false });
    },
  
    // 处理血型选择变化
    onBloodTypeChange(e) {
      this.setData({ selectedBloodType: this.data.bloodTypes[e.detail.value] });
      //e.detail.value是当前选择的那个选项的index
    },
  
    // 处理献血条件选择变化
    onConditionChange(e) {
      this.setData({ selectedCondition: this.data.conditions[e.detail.value] });
    },
  
    // 处理输入框数据变化
    onInputChange(e) {
      let field = e.currentTarget.dataset.field;
    //   console.log(field)
      let value = e.detail.value;
    //   console.log(value)
      this.setData({ recruitData: { ...this.data.recruitData, [field]: value } });
    },
  
    // 提交招募信息
    submitRecruitment() {
      console.log("提交招募信息2")  
      let { recruitData, selectedBloodType, selectedCondition, infoList } = this.data;
      
      if (selectedBloodType === "请选择血型" || selectedCondition === "请选择献血条件") {
        wx.showToast({ title: "请选择血型和献血条件", icon: "none" });
        return;
      }
      console.log(this.data.selectedBloodType)
      let newRecruit = {
        bloodType: selectedBloodType,
        recruitTime: recruitData.recruitTime || "未填写",
        location: recruitData.location || "未填写",
        targetGroup: recruitData.targetGroup || "未填写",
        recruitNumber: recruitData.recruitNumber || "未填写",
        condition: selectedCondition,
        timestamp: new Date().getTime()
      };
      console.log(this.data.recruitData)
      console.log(this.data.recruitData["targetGroup"])
      wx.request({
        url: 'https://jobguard.online/api/activity/publish-activity', // 替换为你的后端 API 地址
        method: 'POST', //请求方式
        header: {
            'Authorization': this.data.Token,
            'Content-Type': 'application/json' //请求头格式为json
        },
        //请求体
        data: {
            "bloodType": this.data.selectedBloodType,
            "timeRange": this.data.recruitData["recruitTime"],
            "address": this.data.recruitData["location"],
            "targetPeople": this.data.recruitData["targetGroup"],
            "maxParticipateCount": this.data.recruitData["recruitNumber"],
            "needs": this.data.selectedCondition,
            "isEmergency": "true",
            "coverUrl": "https://img.tusij.com/tgs_assets/ips_templ_preview/25/c0/9b/lg_3403740_1614845676_604096ec325be.jpg?auth_key=2315410104-0-0-b848c59237ac0883581cddafd780ae65&x-oss-process=image/resize,m_fixed,h_298,w_700",//这里固定默认的活动图片
            "title": "111" //标题

        },
        success: (res) => { //请求成功回调
            console.log('后端返回:', res.data); //打印信息进行调试
        },
        //请求失败
        fail: (err) => {
            console.error('请求失败:', err);
            wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
            });
        }
    });
      this.setData({
        infoList: [newRecruit, ...infoList],
        showPopup: false,
        selectedBloodType: "请选择血型",
        selectedCondition: "请选择献血条件",
        recruitData: {}
      });
        wx.showToast({ title: "发布成功", icon: "success" });
    }
  });
  