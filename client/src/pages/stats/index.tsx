import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import { get } from '../../utils/request'
import './index.scss'

interface BodyPartStat {
  name: string
  color: string
  count: number
}

interface DailyWorkout {
  date: string
  count: number
  parts: string[]
}

interface WeeklyStats {
  weekStart: string
  weekEnd: string
  totalWorkouts: number
  trainingDays: number
  totalSets: number
  bodyPartStats: BodyPartStat[]
  dailyWorkouts: DailyWorkout[]
}

interface MonthlyStats {
  month: string
  totalWorkouts: number
  trainingDays: number
  totalSets: number
  bodyPartStats: BodyPartStat[]
  weeklyStats: { week: string; count: number }[]
}

const weekDayNames = ['一', '二', '三', '四', '五', '六', '日']

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week')
  const [weeklyData, setWeeklyData] = useState<WeeklyStats | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyStats | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(false)

  const formatDate = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const formatMonth = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  const fetchWeeklyStats = async (date?: Date) => {
    const target = date || currentDate
    try {
      setLoading(true)
      const res = await get<WeeklyStats>(`/workouts/stats/weekly?date=${formatDate(target)}`)
      setWeeklyData(res.data)
    } catch (error) {
      console.error('获取周统计失败', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyStats = async (date?: Date) => {
    const target = date || currentDate
    try {
      setLoading(true)
      const res = await get<MonthlyStats>(`/workouts/stats/monthly?month=${formatMonth(target)}`)
      setMonthlyData(res.data)
    } catch (error) {
      console.error('获取月统计失败', error)
    } finally {
      setLoading(false)
    }
  }

  const switchTab = (tab: 'week' | 'month') => {
    setActiveTab(tab)
    if (tab === 'week' && !weeklyData) fetchWeeklyStats()
    if (tab === 'month' && !monthlyData) fetchMonthlyStats()
  }

  const changeDate = (delta: number) => {
    const newDate = new Date(currentDate)
    if (activeTab === 'week') {
      newDate.setDate(newDate.getDate() + delta * 7)
    } else {
      newDate.setMonth(newDate.getMonth() + delta)
    }
    setCurrentDate(newDate)
    if (activeTab === 'week') fetchWeeklyStats(newDate)
    else fetchMonthlyStats(newDate)
  }

  const loadData = () => {
    if (activeTab === 'week') fetchWeeklyStats()
    else fetchMonthlyStats()
  }

  // 首次加载
  useEffect(() => {
    fetchWeeklyStats()
  }, [])

  const weekMaxCount = weeklyData ? Math.max(...weeklyData.dailyWorkouts.map(d => d.count), 1) : 1
  const monthMaxCount = monthlyData ? Math.max(...monthlyData.weeklyStats.map(w => w.count), 1) : 1

  return (
    <View className="stats-page">
      {/* 选项卡 */}
      <View className="tab-bar">
        <View className={`tab ${activeTab === 'week' ? 'active' : ''}`} onClick={() => switchTab('week')}>
          <Text>按周</Text>
        </View>
        <View className={`tab ${activeTab === 'month' ? 'active' : ''}`} onClick={() => switchTab('month')}>
          <Text>按月</Text>
        </View>
      </View>

      {/* 日期切换 */}
      <View className="date-nav">
        <View className="nav-btn" onClick={() => changeDate(-1)}>
          <AtIcon value='chevron-left' size='24' color='#333' />
        </View>
        <Text className="date-text">
          {activeTab === 'week'
            ? `${weeklyData?.weekStart || ''} ~ ${weeklyData?.weekEnd || ''}`
            : `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`
          }
        </Text>
        <View className="nav-btn" onClick={() => changeDate(1)}>
          <AtIcon value='chevron-right' size='24' color='#333' />
        </View>
      </View>

      {loading ? (
        <View className="loading">
          <Text>加载中...</Text>
        </View>
      ) : activeTab === 'week' && weeklyData ? (
        <View className="stats-content">
          {/* 概览卡片 */}
          <View className="overview-card">
            <View className="stat-item">
              <Text className="stat-num">{weeklyData.totalWorkouts}</Text>
              <Text className="stat-label">训练次数</Text>
            </View>
            <View className="stat-divider" />
            <View className="stat-item">
              <Text className="stat-num">{weeklyData.trainingDays}</Text>
              <Text className="stat-label">训练天数</Text>
            </View>
            <View className="stat-divider" />
            <View className="stat-item">
              <Text className="stat-num">{weeklyData.totalSets}</Text>
              <Text className="stat-label">总组数</Text>
            </View>
          </View>

          {/* 每日训练柱状图 */}
          <View className="chart-card">
            <Text className="card-title">每日训练</Text>
            <View className="bar-chart">
              {weeklyData.dailyWorkouts.map((d, i) => (
                <View key={i} className="bar-col">
                  <View className="bar-wrapper">
                    {d.count > 0 && <Text className="bar-value">{d.count}</Text>}
                    <View
                      className="bar"
                      style={{
                        height: d.count > 0 ? `${Math.max((d.count / weekMaxCount) * 130, 30)}px` : '30px',
                        background: d.count > 0 ? '#4A90E2' : '#E8EDF3',
                      }}
                    />
                  </View>
                  <Text className="bar-label">{weekDayNames[i]}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 肌群分布 */}
          {weeklyData.bodyPartStats.length > 0 && (
            <View className="chart-card">
              <Text className="card-title">肌群分布</Text>
              <View className="body-part-list">
                {weeklyData.bodyPartStats.map((bp, i) => (
                  <View key={i} className="body-part-item">
                    <View className="bp-left">
                      <View className="bp-dot" style={{ background: bp.color }} />
                      <Text className="bp-name">{bp.name}</Text>
                    </View>
                    <Text className="bp-count">{bp.count}次</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : activeTab === 'month' && monthlyData ? (
        <View className="stats-content">
          {/* 概览卡片 */}
          <View className="overview-card">
            <View className="stat-item">
              <Text className="stat-num">{monthlyData.totalWorkouts}</Text>
              <Text className="stat-label">训练次数</Text>
            </View>
            <View className="stat-divider" />
            <View className="stat-item">
              <Text className="stat-num">{monthlyData.trainingDays}</Text>
              <Text className="stat-label">训练天数</Text>
            </View>
            <View className="stat-divider" />
            <View className="stat-item">
              <Text className="stat-num">{monthlyData.totalSets}</Text>
              <Text className="stat-label">总组数</Text>
            </View>
          </View>

          {/* 每周训练柱状图 */}
          <View className="chart-card">
            <Text className="card-title">每周训练</Text>
            <View className="bar-chart">
              {monthlyData.weeklyStats.map((w, i) => (
                <View key={i} className="bar-col">
                  <View className="bar-wrapper">
                    {w.count > 0 && <Text className="bar-value">{w.count}</Text>}
                    <View
                      className="bar"
                      style={{
                        height: w.count > 0 ? `${Math.max((w.count / monthMaxCount) * 130, 30)}px` : '30px',
                        background: w.count > 0 ? '#4A90E2' : '#E8EDF3',
                      }}
                    />
                  </View>
                  <Text className="bar-label-small">{w.week}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 肌群分布 */}
          {monthlyData.bodyPartStats.length > 0 && (
            <View className="chart-card">
              <Text className="card-title">肌群分布</Text>
              <View className="body-part-list">
                {monthlyData.bodyPartStats.map((bp, i) => (
                  <View key={i} className="body-part-item">
                    <View className="bp-left">
                      <View className="bp-dot" style={{ background: bp.color }} />
                      <Text className="bp-name">{bp.name}</Text>
                    </View>
                    <Text className="bp-count">{bp.count}次</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : (
        <View className="empty-state">
          <Text className="empty-text">暂无训练数据</Text>
        </View>
      )}
    </View>
  )
}
