// register.js
Page({
    data: {
        identityOptions: ['游客','兼职护士', '献血者', '管理员', '研究所专家'],
        identityDict: {'兼职护士':'NURSE','献血者':'DONOR','管理员':'ADMIN','研究所专家': 'EXPERT'},
        selectedIdentity: '兼职护士',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        isAgreed: false,
        passwordVisible: false,
        confirmPasswordVisible: false,
        showIdentityDropdown: false,
    },
    // 点击页面其他区域关闭下拉菜单
  onTapPage() {
    if (this.data.showIdentityDropdown) {
        console.log('Closing dropdown from page tap');
        this.setData({
            showIdentityDropdown: false
        });
    }
},
    // 切换密码可见性
    togglePasswordVisibility() {
        this.setData({
            passwordVisible: !this.data.passwordVisible
        });
    },
    // 确认密码可视性  
    toggleConfirmPasswordVisibility() {
        this.setData({
            confirmPasswordVisible: !this.data.confirmPasswordVisible
        });
    },

   // 选择身份
   selectIdentity(e) {
    console.log("aaa") 
    const index = e.currentTarget.dataset.index;
    console.log('Selected identity:', this.data.identityOptions[index]);
    this.setData({
        selectedIdentity: this.data.identityOptions[index],
        showIdentityDropdown: false
    });
  },
    //下拉选择框
    toggleIdentityDropdown(e) {
        console.log('Toggle dropdown clicked');
        
        // 如果是关闭下拉菜单，直接设置
        if (this.data.showIdentityDropdown) {
            this.setData({
                showIdentityDropdown: false
            });
            return;
        }
        
        // 获取点击元素的位置信息
        const query = wx.createSelectorQuery();
        query.select('.picker-selected').boundingClientRect();
        query.exec((res) => {
            if (res && res[0]) {
                const rect = res[0];
                this.setData({
                    showIdentityDropdown: true,
                    dropdownStyle: `top:${rect.bottom}px; left:${rect.left}px; width:${rect.width}px;`
                });
            } else {
                // 如果无法获取位置，仍然显示下拉菜单
                this.setData({
                    showIdentityDropdown: true
                });
            }
        });
    },

    // 输入手机号码
    onPhoneNumberInput(e) {
        this.setData({
            phoneNumber: e.detail.value
        });
    },

    // 输入密码
    onPasswordInput(e) {
        this.setData({
            password: e.detail.value
        });
    },

    // 确认密码输入
    onConfirmPasswordInput(e) {
        this.setData({
            confirmPassword: e.detail.value
        });
    },

    // 同意协议
    onAgreementChange(e) {
        this.setData({
            isAgreed: !this.data.isAgreed
        });
        console.log(this.data.isAgreed)
    },

    // 跳转到隐私协议页面
    navigateToUserService() {
        wx.navigateTo({
            url: '/pages/user-service/user-service'
        });
    },
    //跳转到用户服务协议页面
    navigateToPrivacyPolicy() {
        wx.navigateTo({
            url: '/pages/privacy-policy/privacy-policy'
        });
    },

    // 提交注册
    onRegisterTap() {
        if(this.data.phoneNumber=="")
        {
            wx.showToast({ title: '请输入要注册的手机号', icon: 'none' });
            return;
        }
        if (this.data.password=="") {
            wx.showToast({ title: '请输入要注册的密码', icon: 'none' });
            return;
        }
        if (this.data.password !== this.data.confirmPassword) {
            wx.showToast({ title: '两次输入的密码不一致', icon: 'none' });
            return;
        }
        if (!this.data.isAgreed) {
            wx.showToast({ title: '请先同意用户协议', icon: 'none' });
            return;
        }
        wx.request({
            url: 'https://jobguard.online/api/auth/register', //发送请求路径
            method: 'POST',//请求方法
            //请求体
            data: {
                phone: this.data.phoneNumber,
                password: this.data.password,
                confirmPassword: this.data.confirmPassword,
                role: this.data.identityDict[this.data.selectedIdentity],
                isAgreed: this.data.isAgreed

            },
            header: { 'Content-Type': 'application/json' },
            success(res) {
                console.log('服务器返回数据:', res); // 打印 res 以查看完整响应
                if (res.data.message=="success") {
                    wx.showToast({ title: '注册成功', icon: 'success', duration: 500 });
                    setTimeout(() => {
                        wx.redirectTo({ url: '/pages/login/login' });
                    }, 500);
                } else {
                    wx.showToast({ title: res.data, icon: 'none' });
                }
            },
            fail(err) {
                console.error(err); // 在控制台输出错误详情
                if (err.errMsg.includes('ERR_SSL_PROTOCOL_ERROR')) {
                    wx.showToast({ title: 'SSL协议错误，请检查网络或联系管理员', icon: 'none' });
                } else {
                    wx.showToast({ title: '服务器错误，请稍后再试', icon: 'none' });
                }
            }
        });
    }
    
});
