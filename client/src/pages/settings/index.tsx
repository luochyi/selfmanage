import { useState, useEffect } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import { get, put } from '../../utils/request'
import './index.scss'

interface UserInfo {
  id: number
  nickname: string
  avatar_url: string
}

export default function SettingsPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [nickname, setNickname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const user = Taro.getStorageSync('user')
    if (user) {
      setUserInfo(user)
      setNickname(user.nickname || '')
      setAvatarUrl(user.avatar_url || '')
    }
  }, [])

  // 选择头像
  const handleChooseAvatar = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        // 上传头像到服务器
        uploadAvatar(tempFilePath)
      },
    })
  }

  const uploadAvatar = async (filePath: string) => {
    try {
      // 这里简化处理，直接将本地路径作为头像URL
      // 实际项目中应该上传到 OSS 然后返回 URL
      setAvatarUrl(filePath)
      Taro.showToast({ title: '头像已更新', icon: 'success' })
    } catch (error) {
      console.error('上传头像失败', error)
      Taro.showToast({ title: '上传失败', icon: 'none' })
    }
  }

  // 获取微信头像和昵称（新版API需要用户主动点击头像组件）
  const handleGetWxProfile = () => {
    Taro.getUserProfile({
      desc: '用于完善个人资料',
      success: (res) => {
        const { avatarUrl, nickName } = res.userInfo
        if (avatarUrl) setAvatarUrl(avatarUrl)
        if (nickName) setNickname(nickName)
        Taro.showToast({ title: '已获取微信信息', icon: 'success' })
      },
      fail: () => {
        Taro.showToast({ title: '获取失败', icon: 'none' })
      },
    })
  }

  // 保存资料
  const handleSave = async () => {
    if (!nickname.trim()) {
      Taro.showToast({ title: '昵称不能为空', icon: 'none' })
      return
    }
    try {
      setSaving(true)
      const res = await put('/user/profile', {
        nickname: nickname.trim(),
        avatar_url: avatarUrl,
      })
      const updatedUser = res.data
      // 更新本地缓存
      const user = Taro.getStorageSync('user')
      const newUser = { ...user, ...updatedUser }
      Taro.setStorageSync('user', newUser)
      setUserInfo(newUser)
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('保存失败', error)
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <View className="settings-page">
      {/* 头像 */}
      <View className="avatar-section">
        <Text className="section-label">头像</Text>
        <View className="avatar-row" onClick={handleChooseAvatar}>
          <Image
            className="avatar-img"
            src={avatarUrl || 'https://via.placeholder.com/120'}
          />
          <AtIcon value='chevron-right' size='20' color='#999' />
        </View>
      </View>

      {/* 获取微信信息按钮 */}
      <View className="wx-section">
        <View className="wx-btn" onClick={handleGetWxProfile}>
          <Text className="wx-btn-text">获取微信头像和昵称</Text>
        </View>
      </View>

      {/* 昵称 */}
      <View className="nickname-section">
        <Text className="section-label">昵称</Text>
        <Input
          className="nickname-input"
          value={nickname}
          placeholder="请输入昵称"
          maxlength={20}
          onInput={(e) => setNickname(e.detail.value)}
        />
      </View>

      {/* 保存按钮 */}
      <View className="save-section">
        <View
          className={`save-btn ${saving ? 'disabled' : ''}`}
          onClick={handleSave}
        >
          <Text>{saving ? '保存中...' : '保存'}</Text>
        </View>
      </View>
    </View>
  )
}
