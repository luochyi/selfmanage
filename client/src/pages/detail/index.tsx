import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { get } from '../../utils/request'
import './index.scss'

interface WorkoutDetail {
  id: number
  workout_date: string
  body_part_id: number
  note: string
  bodyPart: {
    id: number
    name: string
    color: string
  }
  details: {
    id: number
    exercise_id: number
    weight: number
    sets_count: number
    reps: number
    exercise: {
      id: number
      name: string
    }
  }[]
}

export default function DetailPage() {
  const router = useRouter()
  const date = router.params.date || ''
  const [workouts, setWorkouts] = useState<WorkoutDetail[]>([])
  const [loading, setLoading] = useState(false)

  // 获取该日期的训练记录
  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      
      // 获取当月数据
      const dateObj = new Date(date)
      const month = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
      const res = await get<WorkoutDetail[]>(`/workouts?month=${month}`)
      
      // 筛选该日期的记录
      const dayWorkouts = (res.data || []).filter(w => w.workout_date.startsWith(date))
      setWorkouts(dayWorkouts)
    } catch (error) {
      console.error('获取训练数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 编辑训练
  const handleEdit = (workoutId: number) => {
    Taro.navigateTo({
      url: `/pages/workout/index?id=${workoutId}`,
    })
  }

  // 新建训练
  const handleAdd = () => {
    Taro.navigateTo({
      url: `/pages/workout/index?date=${date}`,
    })
  }

  useEffect(() => {
    fetchWorkouts()
  }, [date])

  return (
    <View className="detail-page">
      {/* 头部 */}
      <View className="header">
        <Text className="date-text">{date}</Text>
        <Text className="title-text">训练详情</Text>
      </View>

      {/* 训练记录列表 */}
      {workouts.length > 0 ? (
        <View className="workout-list">
          {workouts.map((workout) => (
            <View key={workout.id} className="workout-card">
              <View className="workout-header">
                <View
                  className="body-part-tag"
                  style={{ backgroundColor: workout.bodyPart.color + '30' }}
                >
                  <Text style={{ color: workout.bodyPart.color }}>
                    {workout.bodyPart.name}
                  </Text>
                </View>
                <View className="edit-btn" onClick={() => handleEdit(workout.id)}>
                  <Text>编辑</Text>
                </View>
              </View>

              <View className="exercise-list">
                {workout.details.map((detail) => (
                  <View key={detail.id} className="exercise-item">
                    <Text className="exercise-name">{detail.exercise.name}</Text>
                    <View className="exercise-data">
                      {detail.weight > 0 && (
                        <Text className="data-item">{detail.weight}kg</Text>
                      )}
                      {detail.sets_count > 0 && (
                        <Text className="data-item">{detail.sets_count}组</Text>
                      )}
                      {detail.reps > 0 && (
                        <Text className="data-item">{detail.reps}次</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {workout.note && (
                <View className="note-section">
                  <Text className="note-text">备注: {workout.note}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View className="empty-state">
          <Text className="empty-text">当天没有训练记录</Text>
          <View className="add-btn" onClick={handleAdd}>
            <Text>添加训练</Text>
          </View>
        </View>
      )}

      {/* 底部添加按钮 */}
      {workouts.length > 0 && (
        <View className="add-bottom-btn" onClick={handleAdd}>
          <Text>+ 添加更多训练</Text>
        </View>
      )}
    </View>
  )
}