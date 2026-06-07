import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default class CustomTabBar extends Component {
  state = {
    selected: 0,
  }

  setSelected(index: number) {
    this.setState({ selected: index })
  }

  switchTab = (index: number, url: string) => {
    const { selected } = this.state
    if (selected === index) return
    this.setState({ selected: index })
    Taro.switchTab({ url })
  }

  render() {
    const { selected } = this.state
    const tabs = [
      { text: '日历', pagePath: '/pages/calendar/index' },
      { text: '我的', pagePath: '/pages/profile/index' },
    ]

    return (
      <View className='custom-tab-bar'>
        {tabs.map((tab, index) => (
          <View
            key={index}
            className={`tab-item ${selected === index ? 'active' : ''}`}
            onClick={() => this.switchTab(index, tab.pagePath)}
          >
            <Text className='tab-text'>{tab.text}</Text>
          </View>
        ))}
      </View>
    )
  }
}
