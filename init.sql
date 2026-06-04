-- 创建数据库
CREATE DATABASE IF NOT EXISTS fitness_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE fitness_tracker;

-- 插入训练部位数据
INSERT INTO body_parts (name, color) VALUES
  ('胸', '#FF6B6B'),
  ('背', '#4ECDC4'),
  ('腿', '#45B7D1'),
  ('肩', '#96CEB4'),
  ('手臂', '#FFEAA7'),
  ('核心', '#DDA0DD')
ON DUPLICATE KEY UPDATE color = VALUES(color);

-- 插入动作数据
INSERT INTO exercises (name, body_part_id) VALUES
  -- 胸部动作
  ('卧推', 1), ('上斜卧推', 1), ('哑铃飞鸟', 1), ('龙门架夹胸', 1), ('俯卧撑', 1),
  -- 背部动作
  ('高位下拉', 2), ('引体向上', 2), ('杠铃划船', 2), ('单边划船', 2), ('后拉', 2),
  -- 腿部动作
  ('深蹲', 3), ('腿举', 3), ('腿弯举', 3), ('腿屈伸', 3), ('硬拉', 3),
  -- 肩部动作
  ('推举', 4), ('侧平举', 4), ('面拉', 4), ('绕肩', 4), ('前平举', 4),
  -- 手臂动作
  ('弯举', 5), ('三头下压', 5), ('锤式弯举', 5), ('窄距卧推', 5), ('颈后臂屈伸', 5),
  -- 核心动作
  ('卷腹', 6), ('平板支撑', 6), ('悬垂举腿', 6), ('俄罗斯转体', 6), ('死虫', 6)
ON DUPLICATE KEY UPDATE name = VALUES(name);