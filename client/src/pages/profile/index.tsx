import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import { get } from '../../utils/request'
import './index.scss'

interface UserInfo {
  id: number
  nickname: string
  avatar_url: string
}

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 检查登录状态
  useEffect(() => {
    const token = Taro.getStorageSync('token')
    const user = Taro.getStorageSync('user')
    
    if (token && user) {
      setIsLoggedIn(true)
      setUserInfo(user)
    }
  }, [])

  useDidShow(() => {
    try {
      const page: any = Taro.getCurrentInstance().page
      if (page?.getTabBar) {
        page.getTabBar().setSelected(1)
      }
    } catch (e) {}
  })

  // 微信登录
  const handleLogin = async () => {
    try {
      const loginRes = await Taro.login()
      
      if (loginRes.code) {
        const res = await get('/auth/wx-login', { code: loginRes.code })
        const { token, user } = res.data
        
        Taro.setStorageSync('token', token)
        Taro.setStorageSync('user', user)
        
        setIsLoggedIn(true)
        setUserInfo(user)
        
        Taro.showToast({ title: '登录成功', icon: 'success' })
      }
    } catch (error) {
      console.error('登录失败', error)
      Taro.showToast({ title: '登录失败', icon: 'none' })
    }
  }

  // 开发环境模拟登录
  const handleDevLogin = async () => {
    try {
      const res = await get('/auth/dev-login')
      const { token, user } = res.data
      
      Taro.setStorageSync('token', token)
      Taro.setStorageSync('user', user)
      
      setIsLoggedIn(true)
      setUserInfo(user)
      
      Taro.showToast({ title: '开发登录成功', icon: 'success' })
    } catch (error) {
      console.error('开发登录失败', error)
      Taro.showToast({ title: '开发登录失败', icon: 'none' })
    }
  }

  // 退出登录
  const handleLogout = () => {
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('user')
    
    setIsLoggedIn(false)
    setUserInfo(null)
    
    Taro.showToast({ title: '已退出登录', icon: 'success' })
  }

  // 查看训练统计
  const handleViewStats = () => {
    Taro.showToast({ title: '统计功能开发中...', icon: 'none' })
  }

  return (
    <View className="profile-page">
      {/* 用户信息卡片 */}
      <View className="user-card">
        {isLoggedIn && userInfo ? (
          <View className="user-info">
            <Image
              className="avatar"
              src={userInfo.avatar_url || 'https://via.placeholder.com/120'}
            />
            <View className="info-text">
              <Text className="nickname">{userInfo.nickname}</Text>
              <Text className="user-id">ID: {userInfo.id}</Text>
            </View>
          </View>
        ) : (
          <View className="login-prompt">
            <Text className="login-text">登录后同步训练数据</Text>
            {/* <View className="dev-login-btn" onClick={handleDevLogin}>
              <Text>开发测试登录</Text>
            </View> */}
            <View className="login-btn" onClick={handleLogin}>
              <Text>微信登录</Text>
            </View>
          </View>
        )}
      </View>

      {/* 功能菜单 */}
      <View className="menu-section">
        <View className="menu-item" onClick={handleViewStats}>
          <AtIcon value='chart' size='24' color='#4A90E2' />
          <Text className="menu-text">训练统计</Text>
          <AtIcon value='chevron-right' size='20' color='#999' />
        </View>
        {/* <View className="menu-item">
          <AtIcon value='settings' size='24' color='#4A90E2' />
          <Text className="menu-text">设置</Text>
          <AtIcon value='chevron-right' size='20' color='#999' />
        </View>
        <View className="menu-item">
          <AtIcon value='help' size='24' color='#4A90E2' />
          <Text className="menu-text">帮助与反馈</Text>
          <AtIcon value='chevron-right' size='20' color='#999' />
        </View> */}
      </View>

      {/* 退出登录 */}
      {isLoggedIn && (
        <View className="logout-section">
          <View className="logout-btn" onClick={handleLogout}>
            <Text>退出登录</Text>
          </View>
        </View>
      )}

      {/* 版本信息 */}
      <View className="version-info">
        <Text>健身记录 v1.0.0</Text>
      </View>
    </View>
  )
}