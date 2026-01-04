import React, { useEffect, useState } from 'react'
import { readAllTasks, writeAllTasks } from '../core/taskServices.js'
import { Box, Text, useInput } from 'ink'
import { Task } from '../types.js'
import { stderr } from 'process'
import TextInput from 'ink-text-input'
import { listeners } from 'cluster'

const App = () => {

  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [mode, setMode] = useState<"list" | "edit" | "add">("list")
  const [editTask, setEditTask] = useState<string>("")
  const [isDirty, setIsDirty] = useState<boolean>(false)
  const [newTaskDescription, setNewTaskDescription] = useState<string>("")

  const addNewTask = (description: string) => {
    if (!description.trim())
      return

    const currentDate = new Date()
    const formattedDate = currentDate.toISOString().slice(0, 10)
    const newId = tasks.length === 0 ? 1 : Math.max(...tasks.map(task => task.id)) + 1

    const newTask: Task = {
      id: newId,
      description,
      status: 'todo',
      createdAt: formattedDate,
      updatedAt: formattedDate
    }

    setTasks(prevTasks => {
      return [...prevTasks, newTask]
    })
  }

  const editTaskDescription = (editedDescription: string, taskIndex: number) => {
    if (!editedDescription.trim())
      return

    tasks[taskIndex].description = editedDescription
    setTasks(tasks)
  }

  useEffect(() => {
    const getTasks = async () => {
      const allTasks = await readAllTasks()
      setTasks(allTasks)
    }
    getTasks()
  }, [])

  useInput(async (input, key) => {
    if (input === 'q') {
      process.exit(0)
    }

    if (input === "s" && isDirty && mode === "list") {
      await writeAllTasks(tasks)
      setIsDirty(false)
      return
    }

    if (mode === "edit" || mode === "add") {
      if (key.escape) {
        setMode("list")
      }
      return
    }

    if (mode !== 'list')
      return

    if (key.upArrow) {
      setSelectedIndex(prevIndex => Math.max(0, prevIndex - 1))
    }
    if (key.downArrow) {
      setSelectedIndex(prevIndex => Math.min(tasks.length - 1, prevIndex + 1))
    }
    if (input === "a") {
      setMode("add")
    }
    if (input === "e") {
      setMode("edit")
      setEditTask(tasks[selectedIndex].description)
    }
    if (input === "l") {
      setMode("list")
    }
    if (input === ' ') {
      setTasks(prevTasks => {
        setIsDirty(true)
        const newTasks = [...prevTasks]
        const task = newTasks[selectedIndex]
        newTasks[selectedIndex] = {
          ...task,
          status: task.status === "todo" ? "in-progress" : task.status === "in-progress" ? "done" : "todo"
        }
        return newTasks
      })
    }
    if (input === 'd') {
      setTasks(prevTasks => {
        setIsDirty(true)
        return prevTasks.filter((_, i) => i !== selectedIndex)
      })
    }
  })

  return (
    <Box flexDirection='column'>
      <Box borderBottom paddingX={1} flexDirection='row'>
        <Box width={4}><Text bold>ID</Text></Box>
        <Box width={40}><Text bold>Description</Text></Box>
        <Box width={20}><Text bold>Status</Text></Box>
      </Box>
      {tasks.map((task, index) => {
        const isSelectedIndex = selectedIndex === index
        const ROW_BG = isSelectedIndex ? 'blue' : undefined
        const ROW_COLOR = isSelectedIndex ? 'black' : 'white'
        const statusIcon = task.status === 'done' ? '✔' :
          task.status === 'in-progress' ? '●' : '○'

        return (
          <Box key={task.id} backgroundColor={ROW_BG} paddingX={1} flexDirection='row'>
            <Box width={4}>
              <Text color={ROW_COLOR}>{task.id}</Text>
            </Box>
            <Box width={40}>
              <Text color={ROW_COLOR}>{task.description}</Text>
            </Box>
            <Box width={20}>
              <Text color={ROW_COLOR}>{statusIcon} {task.status}</Text>
            </Box>
          </Box>
        )
      })}

      {
        (mode === "add") ?
          (
            <Box flexDirection='column'>
              <Box>
                <Text bold>Enter new task: </Text>
                <TextInput
                  value={newTaskDescription}
                  onChange={setNewTaskDescription}
                  placeholder='What do you need to do?'
                  onSubmit={() => {
                    addNewTask(newTaskDescription)
                    setNewTaskDescription("")
                    setMode("list")
                    setIsDirty(true)
                  }}
                />
              </Box>
              <Box>
                <Text dimColor> {"\n"}Enter to save . Esc to cancel</Text>
              </Box>
            </Box>
          ) :
          <></>
      }

      {
        (mode === "edit") ?
          (
            <Box>
              <TextInput
                value={editTask}
                onChange={setEditTask}
                onSubmit={
                  () => {
                    editTaskDescription(editTask, selectedIndex)
                    setEditTask("")
                    setMode("list")
                    setIsDirty(true)
                  }
                }
              />
            </Box>
          ) :
          <></>
      }

      <Box paddingX={1} paddingTop={1}>
        <Text>
          Mode: {mode}
        </Text>
      </Box>

      <Box paddingX={1} paddingTop={1}>
        <Text dimColor>
          ↑↓ Navigate   space Toggle-status   a Add   e Edit    s Save    d Delete    q Quit
        </Text>
      </Box>
    </Box>
  )
}

export default App
