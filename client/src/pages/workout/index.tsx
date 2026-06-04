import { useState, useEffect } from 'react'
import { View, Text, Input, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { get, post, put, del } from '../../utils/request'
import './index.scss'

interface BodyPart {
  id: number
  name: string
  color: string
}

interface Exercise {
  id: number
  name: string
  body_part_id: number
}

interface WorkoutDetail {
  exercise_id: number
  exercise_name?: string
  weight: number
  sets_count: number
  reps: number
}

export default function WorkoutPage() {
  const router = useRouter()
  const date = router.params.date || ''
  const workoutId = router.params.id

  const [bodyParts, setBodyParts] = useState<BodyPart[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null)
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutDetail[]>([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  // 获取部位列表
  const fetchBodyParts = async () => {
    try {
      const res = await get<BodyPart[]>('/body-parts')
      setBodyParts(res.data || [])
    } catch (error) {
      console.error('获取部位列表失败', error)
    }
  }

  // 获取动作列表
  const fetchExercises = async (bodyPartId: number) => {
    try {
      const res = await get<Exercise[]>(`/exercises?bodyPartId=${bodyPartId}`)
      setExercises(res.data || [])
    } catch (error) {
      console.error('获取动作列表失败', error)
    }
  }

  // 获取训练详情（编辑模式）
  const fetchWorkoutDetail = async () => {
    if (!workoutId) return
    
    try {
      setLoading(true)
      const res = await get(`/workouts/${workoutId}`)
      const workout = res.data
      
      setSelectedBodyPart(workout.bodyPart)
      setWorkoutDetails(workout.details.map(d => ({
        exercise_id: d.exercise_id,
        exercise_name: d.exercise.name,
        weight: d.weight || 0,
        sets_count: d.sets_count || 0,
        reps: d.reps || 0,
      })))
      setNote(workout.note || '')
      setIsEdit(true)
      
      fetchExercises(workout.body_part_id)
    } catch (error) {
      console.error('获取训练详情失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 选择部位
  const handleBodyPartChange = (e) => {
    const index = e.detail.value
    const part = bodyParts[index]
    setSelectedBodyPart(part)
    fetchExercises(part.id)
    setWorkoutDetails([])
  }

  // 添加动作
  const handleAddExercise = () => {
    if (!selectedBodyPart) {
      Taro.showToast({ title: '请先选择部位', icon: 'none' })
      return
    }
    
    setWorkoutDetails([
      ...workoutDetails,
      {
        exercise_id: exercises.length > 0 ? exercises[0].id : 0,
        exercise_name: exercises.length > 0 ? exercises[0].name : '',
        weight: 0,
        sets_count: 0,
        reps: 0,
      },
    ])
  }

  // 删除动作
  const handleRemoveExercise = (index: number) => {
    const newDetails = [...workoutDetails]
    newDetails.splice(index, 1)
    setWorkoutDetails(newDetails)
  }

  // 更新动作详情
  const handleDetailChange = (index: number, field: string, value: any) => {
    const newDetails = [...workoutDetails]
    newDetails[index] = { ...newDetails[index], [field]: value }
    setWorkoutDetails(newDetails)
  }

  // 选择动作
  const handleExerciseChange = (index: number, e) => {
    const exerciseIndex = e.detail.value
    const exercise = exercises[exerciseIndex]
    handleDetailChange(index, 'exercise_id', exercise.id)
    handleDetailChange(index, 'exercise_name', exercise.name)
  }

  // 保存训练记录
  const handleSave = async () => {
    if (!selectedBodyPart) {
      Taro.showToast({ title: '请选择训练部位', icon: 'none' })
      return
    }
    
    if (workoutDetails.length === 0) {
      Taro.showToast({ title: '请添加至少一个动作', icon: 'none' })
      return
    }

    try {
      setLoading(true)
      
      const data = {
        workout_date: date,
        body_part_id: selectedBodyPart.id,
        note,
        details: workoutDetails.map((d, index) => ({
          exercise_id: d.exercise_id,
          weight: d.weight || 0,
          sets_count: d.sets_count || 0,
          reps: d.reps || 0,
          sort_order: index,
        })),
      }

      if (isEdit && workoutId) {
        await put(`/workouts/${workoutId}`, data)
      } else {
        await post('/workouts', data)
      }

      Taro.showToast({ title: '保存成功', icon: 'success' })
      
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('保存失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 删除训练记录
  const handleDelete = async () => {
    if (!workoutId) return
    
    try {
      await del(`/workouts/${workoutId}`)
      Taro.showToast({ title: '删除成功', icon: 'success' })
      
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  useEffect(() => {
    fetchBodyParts()
    if (workoutId) {
      fetchWorkoutDetail()
    }
  }, [])

  return (
    <View className="workout-page">
      {/* 头部信息 */}
      <View className="header">
        <Text className="date-text">{date}</Text>
        <Text className="title-text">{isEdit ? '编辑训练' : '新建训练'}</Text>
      </View>

      {/* 选择部位 */}
      <View className="section">
        <Text className="section-title">训练部位</Text>
        <Picker mode="selector" range={bodyParts} rangeKey="name" onChange={handleBodyPartChange}>
          <View className="picker-btn">
            <Text>{selectedBodyPart ? selectedBodyPart.name : '请选择部位'}</Text>
            <Text className="arrow">{'>'}</Text>
          </View>
        </Picker>
      </View>

      {/* 动作列表 */}
      <View className="section">
        <View className="section-header">
          <Text className="section-title">训练动作</Text>
          <View className="add-btn" onClick={handleAddExercise}>
            <Text>+ 添加动作</Text>
          </View>
        </View>

        {workoutDetails.map((detail, index) => (
          <View key={index} className="exercise-card">
            <View className="exercise-header">
              <Picker
                mode="selector"
                range={exercises}
                rangeKey="name"
                value={exercises.findIndex(e => e.id === detail.exercise_id)}
                onChange={(e) => handleExerciseChange(index, e)}
              >
                <View className="exercise-name">
                  <Text>{detail.exercise_name || '选择动作'}</Text>
                  <Text className="arrow">{'>'}</Text>
                </View>
              </Picker>
              <View className="delete-btn" onClick={() => handleRemoveExercise(index)}>
                <Text>×</Text>
              </View>
            </View>

            <View className="exercise-fields">
              <View className="field">
                <Text className="field-label">重量(kg)</Text>
                <Input
                  type="digit"
                  value={detail.weight ? String(detail.weight) : ''}
                  placeholder="0"
                  onInput={(e) => handleDetailChange(index, 'weight', parseFloat(e.detail.value) || 0)}
                />
              </View>
              <View className="field">
                <Text className="field-label">组数</Text>
                <Input
                  type="number"
                  value={detail.sets_count ? String(detail.sets_count) : ''}
                  placeholder="0"
                  onInput={(e) => handleDetailChange(index, 'sets_count', parseInt(e.detail.value) || 0)}
                />
              </View>
              <View className="field">
                <Text className="field-label">次数</Text>
                <Input
                  type="number"
                  value={detail.reps ? String(detail.reps) : ''}
                  placeholder="0"
                  onInput={(e) => handleDetailChange(index, 'reps', parseInt(e.detail.value) || 0)}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 备注 */}
      <View className="section">
        <Text className="section-title">备注</Text>
        <Input
          className="note-input"
          placeholder="添加备注..."
          value={note}
          onInput={(e) => setNote(e.detail.value)}
        />
      </View>

      {/* 操作按钮 */}
      <View className="actions">
        {isEdit && (
          <View className="delete-action" onClick={handleDelete}>
            <Text>删除记录</Text>
          </View>
        )}
        <View className="save-btn" onClick={handleSave}>
          <Text>保存</Text>
        </View>
      </View>
    </View>
  )
}