import { useState, useEffect } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
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
            <View className="login-btn" onClick={handleLogin}>
              <Text>微信登录</Text>
            </View>
          </View>
        )}
      </View>

      {/* 功能菜单 */}
      <View className="menu-section">
        <View className="menu-item" onClick={handleViewStats}>
          <Text className="menu-icon">📊</Text>
          <Text className="menu-text">训练统计</Text>
          <Text className="menu-arrow">{'>'}</Text>
        </View>
        <View className="menu-item">
          <Text className="menu-icon">⚙️</Text>
          <Text className="menu-text">设置</Text>
          <Text className="menu-arrow">{'>'}</Text>
        </View>
        <View className="menu-item">
          <Text className="menu-icon">❓</Text>
          <Text className="menu-text">帮助与反馈</Text>
          <Text className="menu-arrow">{'>'}</Text>
        </View>
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