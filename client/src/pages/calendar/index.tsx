import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { AtIcon } from 'taro-ui'
import { get } from '../../utils/request'
import './index.scss'

interface WorkoutSession {
  id: number
  workout_date: string
  body_part_id: number
  bodyPart: {
    id: number
    name: string
    color: string
  }
}

interface CalendarDay {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  workouts: WorkoutSession[]
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 获取当月训练数据
  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      const res = await get<WorkoutSession[]>(`/workouts?month=${month}`)
      setWorkouts(res.data || [])
    } catch (error) {
      console.error('获取训练数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 生成日历数据
  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days: CalendarDay[] = []
    
    // 填充上个月的日期
    const firstDayOfWeek = firstDay.getDay()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({
        day: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        workouts: [],
      })
    }
    
    // 填充当月日期
    const today = new Date()
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const dayWorkouts = workouts.filter(w => w.workout_date.startsWith(dateStr))
      
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === i,
        workouts: dayWorkouts,
      })
    }
    
    // 填充下个月的日期
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        workouts: [],
      })
    }
    
    setCalendarDays(days)
  }

  // 切换月份
  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + delta)
    setCurrentDate(newDate)
    setSelectedDate(null)

    // 重新获取新月份的训练数据
    const month = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    get<WorkoutSession[]>(`/workouts?month=${month}`).then(res => {
      setWorkouts(res.data || [])
    }).catch(error => {
      console.error('获取训练数据失败', error)
    })
  }

  // 点击日期：第一次点击选中，第二次点击跳转
  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return
    
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`
    
    if (selectedDate === dateStr) {
      // 第二次点击，跳转详情
      setSelectedDate(null)
      if (day.workouts.length > 0) {
        Taro.navigateTo({
          url: `/pages/detail/index?date=${dateStr}`,
        })
      } else {
        Taro.navigateTo({
          url: `/pages/workout/index?date=${dateStr}`,
        })
      }
    } else {
      // 第一次点击，选中日期
      setSelectedDate(dateStr)
    }
  }

  // 新建训练
  const handleAddWorkout = () => {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    Taro.navigateTo({
      url: `/pages/workout/index?date=${dateStr}`,
    })
  }

  useDidShow(() => {
    fetchWorkouts()
    try {
      const page: any = Taro.getCurrentInstance().page
      const tabBar = Taro.getTabBar(page)
      if (tabBar) {
        tabBar.setSelected(0)
      }
    } catch (e) {}
  })

  useEffect(() => {
    generateCalendar()
  }, [workouts, currentDate])

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <View className="calendar-page">
      {/* 头部 */}
      <View className="header">
        <View className="month-nav">
          <View className="nav-btn" onClick={() => changeMonth(-1)}>
            <AtIcon value='chevron-left' size='24' color='#333' />
          </View>
          <Text className="month-title">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </Text>
          <View className="nav-btn" onClick={() => changeMonth(1)}>
            <AtIcon value='chevron-right' size='24' color='#333' />
          </View>
        </View>
      </View>

      {/* 星期标题 */}
      <View className="week-header">
        {weekDays.map((day) => (
          <View key={day} className="week-item">
            <Text>{day}</Text>
          </View>
        ))}
      </View>

      {/* 日历网格 */}
      <View className="calendar-grid">
        {calendarDays.map((day, index) => {
          const year = currentDate.getFullYear()
          const month = currentDate.getMonth()
          const dateStr = day.isCurrentMonth
            ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`
            : ''
          const isSelected = day.isCurrentMonth && selectedDate === dateStr
          return (
          <View
            key={index}
            className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${day.isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
            onClick={() => handleDayClick(day)}
          >
            <Text className="day-number">{day.day}</Text>
            {day.isCurrentMonth && day.workouts.length > 0 && (
              <View className="workout-tags">
                {day.workouts.slice(0, 1).map((workout) => (
                  <View
                    key={workout.id}
                    className="workout-tag"
                    style={{ backgroundColor: workout.bodyPart.color + '30' }}
                  >
                    <Text style={{ color: workout.bodyPart.color }}>
                      {workout.bodyPart.name}
                    </Text>
                  </View>
                ))}
                {day.workouts.length > 1 && (
                  <Text className="more-tag">+{day.workouts.length - 1}</Text>
                )}
              </View>
            )}
          </View>
          )
        })}
      </View>

      {/* 新增按钮 */}
      <View className="add-btn" onClick={handleAddWorkout}>
        <AtIcon value='add' size='30' color='#fff' />
      </View>
    </View>
  )
}